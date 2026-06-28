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
