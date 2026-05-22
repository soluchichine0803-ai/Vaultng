import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '../lib/animations';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Deposit: React.FC = () => {
  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Fund Your Wallet</h1>
        <p className="text-text-muted text-sm">Add funds securely via our premium payment gateways.</p>
      </header>

      <div className="max-w-md mx-auto w-full">
        <Card className="p-8 space-y-6">
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
            <Button className="w-full h-12">Initialize Deposit</Button>
          </div>

          <p className="text-center text-[11px] text-text-muted px-4">
            By clicking "Initialize", you agree to our terms of service regarding financial transactions.
          </p>
        </Card>
      </div>
    </motion.div>
  );
};

export default Deposit;
