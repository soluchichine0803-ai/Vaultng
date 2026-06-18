import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '../lib/animations';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';

const Withdraw: React.FC = () => {
  const { user } = useAuthStore();

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

          <Input
            label="Withdrawal Amount"
            type="number"
            placeholder="0.00"
          />

          <Input
            label="Destination Account"
            variant="select"
            options={[
              { value: 'primary_bank', label: 'Primary Bank' },
              { value: 'usdt_wallet', label: 'USDT Wallet (TRC-20)' },
            ]}
          />

          <div className="pt-2">
            <Button variant="primary" className="w-full h-14 font-black uppercase text-xs tracking-widest">Confirm Withdrawal</Button>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default Withdraw;
