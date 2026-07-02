import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '../lib/animations';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { withdrawalService } from '../services/withdrawalService';
import { toast } from 'react-hot-toast';
import { AlertCircle, Clock, Calendar } from 'lucide-react';

const Withdraw: React.FC = () => {
  const { user, fetchUser } = useAuthStore();
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const withdrawalAmount = Number(amount);

  // 1. Time and Day Calculation (WAT)
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

  const isTimeValid = lagosHour >= 10 && lagosHour < 18;
  const isDevelopment = import.meta.env.DEV;

  // Eligibility Checks
  const getEligibilityError = () => {
    // Development bypass
    if (isDevelopment) return null;

    if (!isTimeValid) {
      return "Withdrawals are available daily between 10:00 AM and 6:00 PM (Africa/Lagos).";
    }

    if (amount) {
      if (withdrawalAmount < 3000) {
        return "Minimum withdrawal amount is ₦3,000.";
      }

      if (withdrawalAmount <= 50000 && lagosDay !== 'Tuesday') {
        return "Withdrawals between ₦3,000 and ₦50,000 are processed on Tuesdays.";
      }

      if (withdrawalAmount > 50000 && lagosDay !== 'Thursday') {
        return "Withdrawals above ₦50,000 are processed on Thursdays.";
      }

      if (user && withdrawalAmount > Number(user.availableBalance)) {
        return "Insufficient available balance.";
      }
    }

    return null;
  };

  const eligibilityError = getEligibilityError();
  const isSubmitDisabled = !!eligibilityError || !amount || !bankName || !accountNumber || !accountName || isLoading;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !bankName || !accountNumber || !accountName) {
      toast.error('Please fill in all fields');
      return;
    }

    if (eligibilityError && !isDevelopment) {
      toast.error(eligibilityError);
      return;
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
            {isDevelopment && (
              <div className="p-3 rounded-lg bg-purple-primary/10 border border-purple-primary/20 flex items-center gap-2 mb-2">
                <AlertCircle size={14} className="text-purple-soft" />
                <p className="text-[10px] font-black uppercase text-purple-soft tracking-widest">Dev Mode: Schedule Bypass Active</p>
              </div>
            )}

            {!isDevelopment && (
              <div className="space-y-2 mb-2">
                <div className={`p-3 rounded-lg border flex items-start gap-3 transition-colors ${isTimeValid ? 'bg-success/5 border-success/10' : 'bg-danger/5 border-danger/10'}`}>
                  <Clock size={16} className={isTimeValid ? 'text-success' : 'text-danger'} />
                  <div className="space-y-1">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isTimeValid ? 'text-success' : 'text-danger'}`}>
                      Withdrawal Window
                    </p>
                    <p className="text-[11px] text-text-muted leading-tight">
                      Withdrawals are available daily between <span className="text-white font-bold">10:00 AM and 6:00 PM (WAT)</span>.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-white/[0.05] bg-white/[0.02] flex items-start gap-3">
                  <Calendar size={16} className="text-purple-soft" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-purple-soft">
                      Processing Schedule
                    </p>
                    <div className="text-[11px] text-text-muted leading-relaxed">
                      <p>• ₦3,000 – ₦50,000: <span className="text-white font-bold">Tuesdays</span></p>
                      <p>• ₦50,001 and above: <span className="text-white font-bold">Thursdays</span></p>
                    </div>
                  </div>
                </div>
              </div>
            )}
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

            {eligibilityError && !isDevelopment && (
              <div className="p-4 rounded-xl bg-danger/5 border border-danger/10 flex items-start gap-3 mt-2">
                <AlertCircle size={16} className="text-danger shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold text-danger leading-tight">{eligibilityError}</p>
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full h-14 font-black uppercase text-xs tracking-widest"
                loading={isLoading}
                disabled={isSubmitDisabled}
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
