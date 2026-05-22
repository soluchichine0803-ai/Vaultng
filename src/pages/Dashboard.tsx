import React from 'react';
import Card from '../components/ui/Card';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { TrendingUp, ArrowUpRight, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { pageTransition } from '../lib/animations';

const Dashboard: React.FC = () => {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <header>
        <h1 className="text-2xl font-bold">Welcome back, Investor</h1>
        <p className="text-text-muted text-sm">Your portfolio is performing with 12.5% efficiency today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card variant="elevated" className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Balance</span>
            <Badge variant="purple" pulse>Active</Badge>
          </div>
          <div className="space-y-1">
            <AnimatedCounter value={42500.50} currency="₦" className="text-3xl font-bold" />
            <div className="flex items-center gap-1 text-success text-xs font-bold">
              <ArrowUpRight size={14} />
              <span>+₦1,240.00 today</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1">Deposit</Button>
            <Button size="sm" variant="secondary" className="flex-1">Withdraw</Button>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Active Investments</span>
            <TrendingUp size={18} className="text-purple-primary" />
          </div>
          <div className="space-y-1">
            <AnimatedCounter value={12} decimals={0} className="text-3xl font-bold" />
            <p className="text-text-muted text-xs">Spread across 4 asset classes</p>
          </div>
          <Button size="sm" variant="ghost" className="w-full border border-white/5">View Portfolio</Button>
        </Card>

        <Card className="p-6 space-y-4 hidden lg:block">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Security Status</span>
            <Shield size={18} className="text-success" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold">Encrypted</h3>
            <p className="text-text-muted text-xs">Biometric verification enabled</p>
          </div>
          <Button size="sm" variant="ghost" className="w-full border border-white/5">Manage Security</Button>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Zap size={18} className="text-purple-primary" />
            Recommended Plans
          </h2>
          <Button variant="ghost" size="sm" className="text-purple-soft">See all</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} hoverable className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-bold">Premium Growth {i}</h4>
                <p className="text-xs text-text-muted">ROI: 15% / 30 Days</p>
              </div>
              <Button size="sm" variant="secondary">Details</Button>
            </Card>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default Dashboard;
