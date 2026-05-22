import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '../lib/animations';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Withdraw: React.FC = () => {
  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Withdraw Assets</h1>
        <p className="text-text-muted text-sm">Securely transfer your earnings to your bank or wallet.</p>
      </header>

      <div className="max-w-md mx-auto w-full">
        <Card className="p-8 space-y-6">
          <div className="p-4 bg-purple-primary/5 border border-purple-primary/10 rounded-xl">
            <p className="text-[10px] uppercase font-bold text-text-muted">Withdrawable Balance</p>
            <p className="text-2xl font-bold text-purple-soft font-mono">₦24,500.00</p>
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
              { value: 'primary_bank', label: 'Primary Bank (**** 4592)' },
              { value: 'usdt_wallet', label: 'USDT Wallet (TRC-20)' },
            ]}
          />

          <div className="pt-2">
            <Button variant="primary" className="w-full h-12">Confirm Withdrawal</Button>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default Withdraw;
