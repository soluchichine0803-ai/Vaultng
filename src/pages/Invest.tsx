import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '../lib/animations';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Invest: React.FC = () => {
  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <header className="flex flex-col gap-0.5 lg:gap-1">
        <h1 className="text-lg lg:text-xl font-bold tracking-tight">Investment Channels</h1>
        <p className="text-text-muted text-[10px] lg:text-xs font-black opacity-60 uppercase tracking-tighter">Operational: Active Market Channels</p>
      </header>

      <div className="grid grid-cols-1 gap-3 lg:gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-5 lg:p-6 border-white/[0.02]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm lg:text-base font-bold tracking-tight">Vault Protocol Delta {i}</h3>
                  <span className="px-2 py-0.5 bg-purple-primary/10 text-purple-soft text-[9px] font-black rounded uppercase tracking-widest border border-purple-primary/10">High Yield</span>
                </div>
                <p className="text-xs lg:text-sm text-text-muted max-w-md leading-relaxed opacity-80">
                  Precision yield optimization through structured vault protocols and liquidity aggregation.
                </p>
                <div className="flex gap-6 lg:gap-8 pt-1">
                  <div>
                    <p className="text-[9px] uppercase font-black text-text-muted tracking-widest">Min. Commitment</p>
                    <p className="font-mono text-xs lg:text-sm font-bold text-text-primary">₦50,000.00</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-black text-text-muted tracking-widest">Cycle</p>
                    <p className="font-mono text-xs lg:text-sm font-bold text-text-primary">60 Days</p>
                  </div>
                </div>
              </div>
              <Button className="w-full md:w-auto h-12 px-8 font-black uppercase text-[10px] tracking-widest">Invest Now</Button>
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

export default Invest;
