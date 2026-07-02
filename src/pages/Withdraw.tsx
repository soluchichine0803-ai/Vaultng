import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '../lib/animations';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { withdrawalService } from '../services/withdrawalService';
import { toast } from 'react-hot-toast';

const Withdraw: React.FC = () => {
  const { user, fetchUser } = useAuthStore();
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !bankName || !accountNumber || !accountName) {
      toast.error('Please fill in all fields');
      return;
    }

    const withdrawalAmount = Number(amount);
    if (isNaN(withdrawalAmount)) {
      toast.error('Invalid withdrawal amount');
      return;
    }

    // 1. Minimum withdrawal
    if (withdrawalAmount < 3000) {
      toast.error('Minimum withdrawal amount is ₦3,000');
      return;
    }

    // 2. Sufficient Balance
    if (user && withdrawalAmount > Number(user.availableBalance)) {
      toast.error('Insufficient available balance');
      return;
    }

    // 3. Time and Day Validation (WAT)
    const now = new Date();
    const lagosFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Lagos',
      hour: 'numeric',
      hour12: false,
      weekday: 'long',
    });

    const parts = lagosFormatter.formatToParts(now);
    const lagosHour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
    const lagosDay = parts.find(p => p.type === 'weekday')?.value || '';

    // Time window: 10:00 AM – 6:00 PM
    if (lagosHour < 10 || lagosHour >= 18) {
      toast.error('Withdrawals are only allowed between 10:00 AM and 6:00 PM WAT');
      return;
    }

    // Day restriction
    if (withdrawalAmount >= 3000 && withdrawalAmount <= 50000) {
      if (lagosDay !== 'Tuesday') {
        toast.error('Withdrawals between ₦3,000 and ₦50,000 are only allowed on Tuesdays');
        return;
      }
    } else if (withdrawalAmount > 50000) {
      if (lagosDay !== 'Thursday') {
        toast.error('Withdrawals above ₦50,000 are only allowed on Thursdays');
        return;
      }
    }

    try {
      setIsLoading(true);
      await withdrawalService.createWithdrawal({
        amount: Number(amount),
        bankName,
        accountNumber,
        accountName,
      });
      toast.success('Withdrawal request submitted successfully');
      setAmount('');
      setBankName('');
      setAccountNumber('');
      setAccountName('');
      fetchUser();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit withdrawal request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <header className="flex flex-col gap-0.5 lg:gap-1">
        <h1 className="text-lg lg:text-xl font-bold tracking-tight">Withdraw Assets</h1>
        <p className="text-text-muted text-[10px] lg:text-xs font-black opacity-60 uppercase tracking-tighter">Operational: Liquidity Outflow</p>
      </header>

      <div className="max-w-md mx-auto w-full pt-4 lg:pt-8">
        <Card className="p-6 lg:p-8 space-y-6 border-white/[0.02]">
          <div className="p-4 lg:p-5 bg-white/[0.03] border border-white/[0.05] rounded-xl">
            <p className="text-[9px] uppercase font-black text-text-muted tracking-widest mb-1">Available Liquidity</p>
            <p className="text-2xl lg:text-3xl font-bold text-white font-mono">₦{(user?.availableBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>

          <form onSubmit={handleWithdraw} className="space-y-4">
            <Input
              label="Withdrawal Amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="no-spinner"
            />

            <Input
              label="Bank Name"
              placeholder="Enter bank name"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              required
            />

            <Input
              label="Account Number"
              placeholder="Enter account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />

            <Input
              label="Account Name"
              placeholder="Enter account name"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full h-14 font-black uppercase text-xs tracking-widest"
                loading={isLoading}
              >
                Confirm Withdrawal
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </motion.div>
  );
};

export default Withdraw;
