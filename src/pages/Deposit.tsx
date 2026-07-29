import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '../lib/animations';
import {
  ArrowUpCircle,
  History,
  Loader2,
  Wallet,
  Upload,
  FileText,
  CheckCircle
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
  const [amount, setAmount] = useState<string>('');
  const method = 'Bank Transfer';
  const [customerReference, setCustomerReference] = useState<string>('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/webp',
        'application/pdf',
      ];

      if (!allowedMimeTypes.includes(file.type)) {
        addToast('Only images (JPEG, JPG, PNG, WEBP) and PDFs are allowed', 'error');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        addToast('File size must not exceed 10MB', 'error');
        return;
      }

      setProofFile(file);
      addToast(`Selected file: ${file.name}`, 'success');
    }
  };

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

    if (!method) {
      addToast('Please select a payment method', 'error');
      return;
    }

    if (!proofFile) {
      addToast('Proof of payment file is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await depositService.createDeposit({
        amount: numericAmount,
        method,
        proofFile,
        customerReference: customerReference || undefined,
      });

      addToast('Deposit request submitted successfully for review!', 'success');

      // Reset form
      setAmount('');
      setCustomerReference('');
      setProofFile(null);
      // Reset the file input element manually
      const fileInput = document.getElementById('proof-file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

      // Refresh data
      await fetchUser();
      await fetchHistory();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to submit deposit request';
      addToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'text-green-400 bg-green-400/10';
      case 'REVERSED':
        return 'text-orange-400 bg-orange-400/10';
      case 'REJECTED':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-yellow-400 bg-yellow-400/10';
    }
  };

  const getFileUrl = (pathStr: string) => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const backendBase = apiBase.replace('/api', '');
    return `${backendBase}${pathStr}`;
  };

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <header className="flex flex-col gap-0.5 lg:gap-1">
        <h1 className="text-lg lg:text-xl font-bold tracking-tight flex items-center gap-2">
          <ArrowUpCircle className="w-5 h-5 text-purple-primary" />
          Deposit Funds (Manual Request)
        </h1>
        <p className="text-text-muted text-[10px] lg:text-xs font-black opacity-60 uppercase tracking-tighter">Operational: Liquidity Inflow</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        {/* Deposit Form */}
        <div className="md:col-span-1">
          <Card className="h-full p-5 lg:p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">
                  Amount (NGN)
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isSubmitting}
                  className="text-lg font-semibold no-spinner"
                  required
                />

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setAmount(amt.toString())}
                      className="py-2 px-3 text-[11px] font-bold rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-purple-primary/30 transition-all text-text-secondary disabled:opacity-50"
                    >
                      ₦{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Instructions Panel */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-3">
                <p className="text-[10px] font-black uppercase text-purple-soft tracking-wider">
                  Payment Instructions (Bank Transfer)
                </p>
                <div className="text-xs text-gray-400 space-y-1.5">
                  <p>Kindly transfer exactly <span className="text-white font-bold">₦{amount ? Number(amount).toLocaleString() : '0.00'}</span> to:</p>
                  <div className="bg-black/40 p-2.5 rounded-lg border border-white/5 space-y-1">
                    <p>Bank: <span className="text-text-secondary font-mono font-bold">VaultNG Trust Bank</span></p>
                    <p>Account Name: <span className="text-text-secondary font-mono font-bold">VaultNG Operations</span></p>
                    <p>Account Number: <span className="text-text-secondary font-mono font-bold">1029384756</span></p>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 leading-tight">
                  Note: Upload proof of transfer below once payment is completed.
                </p>
              </div>

              {/* Upload Proof of Payment */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">
                  Proof of Payment (Required)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="proof-file-input"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                    className="hidden"
                    required
                  />
                  <label
                    htmlFor="proof-file-input"
                    className={`w-full h-24 border border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/[0.04] transition-all ${
                      proofFile
                        ? 'border-purple-primary/50 bg-purple-primary/5 text-white'
                        : 'border-white/10 bg-white/[0.01] text-gray-400'
                    }`}
                  >
                    {proofFile ? (
                      <>
                        <CheckCircle className="w-6 h-6 text-purple-primary" />
                        <span className="text-xs font-semibold font-mono max-w-[200px] truncate">{proofFile.name}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-gray-500" />
                        <span className="text-xs font-medium">Upload Image or PDF</span>
                        <span className="text-[10px] text-gray-500">Max size 10MB</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Optional Reference */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1">
                  Customer Transfer Reference (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Session ID or Transaction ID"
                  value={customerReference}
                  onChange={(e) => setCustomerReference(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="p-4 rounded-xl bg-purple-primary/5 border border-purple-primary/10 flex justify-between text-sm">
                <span className="text-gray-400">Current Balance</span>
                <span className="text-white font-medium">
                  {user ? formatCurrency(Number(user.availableBalance)) : '₦0.00'}
                </span>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-black uppercase tracking-wider text-xs"
                disabled={isSubmitting || !amount || !proofFile}
                loading={isSubmitting}
              >
                Submit Deposit Request
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
                      <th className="pb-4 font-black border-b border-white/5">Method</th>
                      <th className="pb-4 font-black text-right border-b border-white/5">Amount</th>
                      <th className="pb-4 font-black text-center border-b border-white/5">Proof</th>
                      <th className="pb-4 font-black text-center border-b border-white/5">Status</th>
                      <th className="pb-4 font-black text-right border-b border-white/5">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deposits.map((deposit) => (
                      <tr key={deposit.id} className="text-sm group hover:bg-white/[0.01] transition-colors">
                        <td className="py-4 border-b border-white/[0.03]">
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-[11px] text-gray-400 bg-white/[0.03] px-2 py-1 rounded w-fit">
                              {deposit.reference}
                            </span>
                            {deposit.customerReference && (
                              <span className="text-[10px] text-gray-500 truncate max-w-[120px]" title={deposit.customerReference}>
                                Ref: {deposit.customerReference}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 border-b border-white/[0.03]">
                          <span className="text-xs text-text-secondary font-bold">
                            {deposit.method}
                          </span>
                        </td>
                        <td className="py-4 text-right font-bold text-white border-b border-white/[0.03]">
                          {formatCurrency(Number(deposit.amount))}
                        </td>
                        <td className="py-4 border-b border-white/[0.03]">
                          <div className="flex justify-center">
                            {deposit.proofImageUrl ? (
                              <a
                                href={getFileUrl(deposit.proofImageUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[11px] text-purple-soft hover:text-white font-bold transition-all"
                              >
                                <FileText className="w-4 h-4" />
                                View File
                              </a>
                            ) : (
                              <span className="text-xs text-gray-600">No proof</span>
                            )}
                          </div>
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
