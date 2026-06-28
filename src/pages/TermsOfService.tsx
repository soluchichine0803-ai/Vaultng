import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '../lib/animations';
import Card from '../components/ui/Card';

const TermsOfService: React.FC = () => {
  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <header className="flex flex-col gap-0.5 lg:gap-1">
        <h1 className="text-lg lg:text-xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-text-muted text-[10px] lg:text-xs font-black opacity-60 uppercase tracking-tighter">Legal: Agreement & Protocols</p>
      </header>

      <Card className="p-6 lg:p-8 border-white/[0.02] prose prose-invert max-w-none">
        <div className="space-y-4 text-text-muted text-sm leading-relaxed">
          <p>[Legal text for Terms of Service will be inserted here]</p>
        </div>
      </Card>
    </motion.div>
  );
};

export default TermsOfService;
