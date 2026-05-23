import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '../lib/animations';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Copy, Users, Award, Gift } from 'lucide-react';
import { toast } from '../store/toastStore';

const Referrals: React.FC = () => {
  const copyLink = () => {
    navigator.clipboard.writeText('https://vaultng.com/ref/jdoe123');
    toast.success('Referral link copied to clipboard!');
  };

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <header className="flex flex-col gap-0.5 lg:gap-1">
        <h1 className="text-lg lg:text-xl font-bold tracking-tight">Partner Network</h1>
        <p className="text-text-muted text-[10px] lg:text-xs font-black opacity-60 uppercase tracking-tighter">Operational: Network Growth</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
        <Card className="p-5 lg:p-6 flex flex-col items-center text-center space-y-2 border-white/[0.02]">
          <div className="w-12 h-12 rounded-2xl bg-purple-primary/10 flex items-center justify-center mb-1">
            <Users className="text-purple-primary" size={24} />
          </div>
          <h3 className="text-xl font-bold tracking-tight">12</h3>
          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60">Total Partners</p>
        </Card>
        <Card className="p-5 lg:p-6 flex flex-col items-center text-center space-y-2 border-white/[0.02]">
          <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center mb-1">
            <Award className="text-success" size={24} />
          </div>
          <h3 className="text-xl font-bold text-success tracking-tight">₦45,000.00</h3>
          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60">Revenue Yield</p>
        </Card>
        <Card className="p-5 lg:p-6 flex flex-col items-center text-center space-y-2 border-white/[0.02]">
          <div className="w-12 h-12 rounded-2xl bg-info/10 flex items-center justify-center mb-1">
            <Gift className="text-info" size={24} />
          </div>
          <h3 className="text-xl font-bold text-info tracking-tight">Elite</h3>
          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60">Status Tier</p>
        </Card>
      </div>

      <Card className="p-6 lg:p-8 space-y-4 lg:space-y-5 border-white/[0.02]">
        <div className="space-y-1">
          <h3 className="text-sm lg:text-base font-bold tracking-tight">Network Expansion Link</h3>
          <p className="text-xs lg:text-sm text-text-muted opacity-80">Expand your partner circle to earn protocol yield on their initial commitments.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-lg px-4 py-4 text-xs lg:text-sm font-mono text-purple-soft overflow-hidden whitespace-nowrap">
            vaultng.com/ref/jdoe123
          </div>
          <Button onClick={copyLink} size="lg" className="h-14 sm:h-auto px-10 font-black uppercase text-[10px] tracking-widest" icon={<Copy size={14} />}>Copy Link</Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default Referrals;
