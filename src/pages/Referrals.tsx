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
      <header>
        <h1 className="text-2xl font-bold">Referral Ecosystem</h1>
        <p className="text-text-muted text-sm">Expand the VaultNG network and earn premium rewards.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 flex flex-col items-center text-center space-y-2 border-purple-primary/5">
          <Users className="text-purple-primary mb-2" size={32} />
          <h3 className="font-bold">12</h3>
          <p className="text-xs text-text-muted">Total Referrals</p>
        </Card>
        <Card className="p-6 flex flex-col items-center text-center space-y-2 border-purple-primary/5">
          <Award className="text-success mb-2" size={32} />
          <h3 className="font-bold text-success">₦45,000</h3>
          <p className="text-xs text-text-muted">Total Commissions</p>
        </Card>
        <Card className="p-6 flex flex-col items-center text-center space-y-2 border-purple-primary/5">
          <Gift className="text-info mb-2" size={32} />
          <h3 className="font-bold text-info">Elite</h3>
          <p className="text-xs text-text-muted">Referrer Tier</p>
        </Card>
      </div>

      <Card className="p-8 space-y-4">
        <h3 className="text-lg font-bold">Your Invite Link</h3>
        <p className="text-sm text-text-muted">Share this link with your network to earn 5% on their first investment.</p>

        <div className="flex gap-2">
          <div className="flex-1 bg-background-secondary border border-purple-primary/20 rounded-lg px-4 py-3 text-sm font-mono text-purple-soft overflow-hidden whitespace-nowrap">
            vaultng.com/ref/jdoe123
          </div>
          <Button onClick={copyLink} icon={<Copy size={18} />}>Copy</Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default Referrals;
