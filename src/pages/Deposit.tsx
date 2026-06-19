import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  const { user, token } = useAuthStore();
  const { addToast } = useToastStore();
  const [amount, setAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      addToast('Please enter a valid amount greater than zero', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await depositService.createDeposit(numericAmount);
      addToast('Deposit request submitted successfully', 'success');
      setAmount('');
      // Refresh history
      setDeposits([data, ...deposits]);
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
      case 'REJECTED':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-yellow-400 bg-yellow-400/10';
    }
  };

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="space-y-6">
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
          <Card className="h-full">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Amount (NGN)
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isSubmitting}
                  className="text-lg font-semibold"
                />
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
                disabled={isSubmitting || !amount}
                loading={isSubmitting}
              >
                Submit Request
              </Button>
            </form>
          </Card>
        </div>

        {/* Deposit History */}
        <div className="md:col-span-2">
          <Card className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-purple-primary" />
                Deposit History
              </h3>
            </div>

            <div className="flex-1 overflow-x-auto">
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
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs uppercase tracking-wider text-gray-500 border-b border-white/5">
                      <th className="pb-3 font-medium">Reference</th>
                      <th className="pb-3 font-medium text-right">Amount</th>
                      <th className="pb-3 font-medium text-center">Status</th>
                      <th className="pb-3 font-medium text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {deposits.map((deposit) => (
                      <tr key={deposit.id} className="text-sm">
                        <td className="py-4">
                          <span className="font-mono text-xs text-gray-300">
                            {deposit.reference}
                          </span>
                        </td>
                        <td className="py-4 text-right font-medium text-white">
                          {formatCurrency(Number(deposit.amount))}
                        </td>
                        <td className="py-4">
                          <div className="flex justify-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(deposit.status)}`}>
                              {deposit.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-right text-gray-400 text-xs">
                          {new Date(deposit.createdAt).toLocaleDateString()}
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
