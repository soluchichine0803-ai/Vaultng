import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '../lib/animations';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Deposit: React.FC = () => {
  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <header className="flex flex-col gap-0.5 lg:gap-1">
        <h1 className="text-lg lg:text-xl font-bold tracking-tight">Deposit Funds</h1>
        <p className="text-text-muted text-[10px] lg:text-xs font-black opacity-60 uppercase tracking-tighter">Operational: Liquidity Inflow</p>
      </header>

      <div className="max-w-md mx-auto w-full pt-4 lg:pt-8">
        <Card className="p-6 lg:p-8 space-y-6 border-white/[0.02]">
          <Input
            label="Amount (NGN)"
            type="number"
            placeholder="Min. ₦1,000"
          />

          <Input
            label="Payment Method"
            variant="select"
            options={[
              { value: 'bank_transfer', label: 'Bank Transfer' },
              { value: 'card', label: 'Credit/Debit Card' },
              { value: 'usdt', label: 'USDT (Tether)' },
            ]}
          />

          <div className="pt-2">
            <Button className="w-full h-14 font-black uppercase text-xs tracking-widest">Initialize Deposit</Button>
          </div>

          <p className="text-center text-[10px] font-bold text-text-muted px-4 opacity-60 uppercase tracking-tight">
            By clicking "Initialize", you agree to our terms of service regarding financial transactions.
          </p>
        </Card>
      </div>
    </motion.div>
  );
};

export default Deposit;
