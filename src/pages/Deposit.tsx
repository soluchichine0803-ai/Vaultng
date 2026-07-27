import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { pageTransition } from '../lib/animations';
import {
  ArrowUpCircle,
  History,
  Loader2,
  Wallet
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { formatCurrency } from '../utils/formatters';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { depositService, type DepositRequest } from '../services/depositService';

const Deposit: React.FC = () => {
  const { user, token, fetchUser } = useAuthStore();
  const { addToast } = useToastStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [amount, setAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const quickAmounts = [3000, 5000, 10000, 50000];

  const fetchHistory = async () => {
    try {
      const data = await depositService.getDepositHistory();
      setDeposits(data);
    } catch (error) {
      console.error('Failed to fetch deposit history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token]);

  // Handle Paystack callback verification
  useEffect(() => {
    const reference = searchParams.get('reference');
    if (!reference) return;

    const verifyPaystackPayment = async () => {
      setIsVerifying(true);
      try {
        const res = await depositService.verifyPayment(reference);
        if (res.status === 'success' || res.data?.status === 'APPROVED') {
          addToast('Deposit verified and credited successfully!', 'success');
          // Immediately sync / update user balance
          await fetchUser();
        } else {
          addToast(res.message || 'Payment verification failed or was cancelled.', 'error');
        }
      } catch (error: any) {
        console.error('Error verifying payment:', error);
        const errMsg = error.response?.data?.message || 'Payment verification failed.';
        addToast(errMsg, 'error');
      } finally {
        setIsVerifying(false);
        // Clean query parameters from URL so verification is not triggered again on page refresh
        setSearchParams({}, { replace: true });
        // Refresh deposit history
        fetchHistory();
      }
    };

    verifyPaystackPayment();
  }, [searchParams, fetchUser, setSearchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      addToast('Please enter a valid amount greater than zero', 'error');
      return;
    }

    if (numericAmount < 3000) {
      addToast('Minimum deposit amount is ₦3,000', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Call initializePayment instead of createDeposit
      const res = await depositService.initializePayment(numericAmount);
      addToast('Payment initialized. Redirecting to secure checkout...', 'success');
      // Redirect to Paystack Checkout URL
      window.location.href = res.authorizationUrl;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to initialize payment';
      addToast(message, 'error');
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'text-green-400 bg-green-400/10';
      case 'REJECTED':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-yellow-400 bg-yellow-400/10';
    }
  };

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="space-y-6">
      {/* Verify Overlay */}
      {isVerifying && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center z-50 space-y-4">
          <div className="p-6 bg-zinc-900 border border-white/[0.08] rounded-2xl flex flex-col items-center text-center max-w-sm mx-4">
            <Loader2 className="w-12 h-12 text-purple-primary animate-spin mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Verifying Payment...</h2>
            <p className="text-gray-400 text-sm">Please do not refresh the page, close this tab, or click the back button.</p>
          </div>
        </div>
      )}

      <header className="flex flex-col gap-0.5 lg:gap-1">
        <h1 className="text-lg lg:text-xl font-bold tracking-tight flex items-center gap-2">
          <ArrowUpCircle className="w-5 h-5 text-purple-primary" />
          Deposit Funds
        </h1>
        <p className="text-text-muted text-[10px] lg:text-xs font-black opacity-60 uppercase tracking-tighter">Operational: Liquidity Inflow</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        {/* Deposit Form */}
        <div className="md:col-span-1">
          <Card className="h-full p-5 lg:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Amount (NGN)
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isSubmitting || isVerifying}
                  className="text-lg font-semibold no-spinner"
                />

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      disabled={isSubmitting || isVerifying}
                      onClick={() => setAmount(amt.toString())}
                      className="py-2 px-3 text-[11px] font-bold rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-purple-primary/30 transition-all text-text-secondary disabled:opacity-50"
                    >
                      ₦{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-primary/5 border border-purple-primary/10 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Current Balance</span>
                  <span className="text-white font-medium">
                    {user ? formatCurrency(Number(user.availableBalance)) : '₦0.00'}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base"
                disabled={isSubmitting || isVerifying || !amount}
                loading={isSubmitting}
              >
                Pay with Paystack
              </Button>
            </form>
          </Card>
        </div>

        {/* Deposit History */}
        <div className="md:col-span-2">
          <Card className="h-full flex flex-col p-5 lg:p-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-purple-primary" />
                Deposit History
              </h3>
            </div>

            <div className="flex-1 overflow-x-auto -mx-1 px-1">
              {isLoadingHistory ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <Loader2 className="w-8 h-8 text-purple-primary animate-spin" />
                  <span className="text-gray-400 text-sm">Loading history...</span>
                </div>
              ) : deposits.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-white/[0.03] flex items-center justify-center mb-3">
                    <Wallet className="w-6 h-6 text-gray-500" />
                  </div>
                  <p className="text-gray-400">No deposit requests found</p>
                </div>
              ) : (
                <table className="w-full text-left border-separate border-spacing-0">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest text-text-muted/60 border-b border-white/5">
                      <th className="pb-4 font-black border-b border-white/5">Reference</th>
                      <th className="pb-4 font-black text-right border-b border-white/5">Amount</th>
                      <th className="pb-4 font-black text-center border-b border-white/5">Status</th>
                      <th className="pb-4 font-black text-right border-b border-white/5">Date</th>
                    </tr>
                  </thead>
                  <tbody className="">
                    {deposits.map((deposit) => (
                      <tr key={deposit.id} className="text-sm group hover:bg-white/[0.01] transition-colors">
                        <td className="py-4 border-b border-white/[0.03]">
                          <span className="font-mono text-[11px] text-gray-400 bg-white/[0.03] px-2 py-1 rounded">
                            {deposit.reference}
                          </span>
                        </td>
                        <td className="py-4 text-right font-bold text-white border-b border-white/[0.03]">
                          {formatCurrency(Number(deposit.amount))}
                        </td>
                        <td className="py-4 border-b border-white/[0.03]">
                          <div className="flex justify-center">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${getStatusColor(deposit.status)}`}>
                              {deposit.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-right text-gray-400 text-[11px] font-medium border-b border-white/[0.03]">
                          {new Date(deposit.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default Deposit;
