# VaultNG – Paystack Withdrawal Test Mode Integration Guidance

This document describes how to configure, run, and test the VaultNG automated withdrawal lifecycle using **Paystack Test Mode**. It is designed to allow developers and auditors to thoroughly validate the full liquidity withdrawal lifecycle safely without executing real-money transfers.

---

## 1. Required Environment Variables

To test withdrawals safely, ensure the following keys are present in your backend environment configuration file (`server/.env`):

```env
# Server Configuration
PORT=5000
JWT_SECRET="your_secure_jwt_secret"

# Paystack API Credentials (Use 'test' keys from your Paystack Dashboard)
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYSTACK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Application URLs
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
```

---

## 2. Supported Test Scenarios & Example Accounts

Under **Paystack Test Mode**, calling the backend account resolution (`/api/withdrawals/resolve`) or transfer recipient creation will succeed only for specific mocked inputs. Attempting to use random or real account numbers in test mode will result in Paystack throwing resolution errors.

### Example Test Accounts:
Use the following canonical mock configurations to simulate successful account resolution in the frontend:

| Bank Name | Bank Code | Account Number | Expected Resolved Name |
| :--- | :--- | :--- | :--- |
| **Access Bank** | `044` | `0001234567` | APPROVED ACCOUNT |
| **Guaranty Trust Bank** | `058` | `0123456789` | GTBANK MOCK ACCOUNT |
| **Zenith Bank** | `057` | `0000000001` | ZENITH MOCK ACCOUNT |

*Note: For testing, enter exactly `0001234567` (10 digits) with bank Access Bank to trigger automatic resolution.*

---

## 3. Automated Withdrawal Lifecycle Workflow

When a withdrawal request is submitted:

1. **Client Submission:** The user fills the withdrawal amount, selects a bank from the searchable list, enters a 10-digit account number, and submits.
2. **Account Validation:** The frontend automatically proxies the account resolution requests via `/api/withdrawals/resolve`. The backend independently validates this account detail before creating the Paystack transfer recipient.
3. **Wallet Debit (Atomic):** The backend debits the amount from the user's `availableBalance` within a database transaction. If the balance is insufficient, it rolls back instantly.
4. **Recipient Creation:** A Paystack transfer recipient is registered via `POST /transferrecipient`.
5. **Transfer Initiation:** The backend initiates the transfer via `POST /transfer` utilizing a unique reference (`WTH-TIMESTAMP-RANDOM`).
6. **Immediate Response Handling:**
   - **Immediate Success:** If Paystack immediately resolves and processes the transfer (status: `success`), the database record status transitions to `APPROVED`, and a success notification is created.
   - **Immediate Failure:** If Paystack immediately returns a failure (status: `failed`/`reversed`), the wallet debit is rolled back, the record status is set to `FAILED` with the `rejectionReason` persisted, and a clear error is returned to the user.
7. **Webhook Fallback/Synchronization:** The backend's public `/api/payments/webhook` listens for `transfer.success` and `transfer.failed`/`transfer.reversed` events to process final asynchronous status changes.

---

## 4. Testing Asynchronous Webhooks Locallly

To test webhook events (`transfer.success` / `transfer.failed`) in your local sandbox:

1. Use a tool like **ngrok** to expose your local server port `5000`:
   ```bash
   ngrok http 5000
   ```
2. Copy the forwarded HTTPS URL (e.g. `https://your-subdomain.ngrok-free.app`).
3. Log in to your Paystack Dashboard, go to **Settings > API Keys & Webhooks**, and set the webhook URL to:
   ```
   https://your-subdomain.ngrok-free.app/api/payments/webhook
   ```
4. Perform a withdrawal in the VaultNG interface. Paystack will automatically deliver the corresponding status webhook to your local server, completing the reconciliation cycle.

---

## 5. Known Limitations of Paystack Test Mode

* **No Real-Money Dispatch:** No actual funds will leave your balance. The transaction is simulated.
* **Mock Bank Accounts Only:** Standard validation will fail if a real, live bank account is used unless it matches Paystack's standard mock account criteria.
* **Webhook Delivery Delay:** Webhook events might take a few seconds to trigger depending on network congestion and ngrok proxy latency.
