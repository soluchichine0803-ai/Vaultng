import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '../lib/animations';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Invest: React.FC = () => {
  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Investment Hub</h1>
        <p className="text-text-muted text-sm">Explore diverse opportunities tailored for premium growth.</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">Strategy Alpha {i}</h3>
                  <span className="px-2 py-0.5 bg-purple-primary/10 text-purple-soft text-[10px] font-bold rounded uppercase">High Yield</span>
                </div>
                <p className="text-sm text-text-muted max-w-md">
                  A high-frequency algorithmic strategy focused on stablecoin arbitrage and yield optimization.
                </p>
                <div className="flex gap-4 pt-2">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-text-muted">Min. Deposit</p>
                    <p className="font-mono text-sm font-bold">₦50,000</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-text-muted">Duration</p>
                    <p className="font-mono text-sm font-bold">60 Days</p>
                  </div>
                </div>
              </div>
              <Button className="w-full md:w-auto">Invest Now</Button>
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

export default Invest;
