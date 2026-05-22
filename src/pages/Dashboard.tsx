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
      className="space-y-6 lg:space-y-8"
    >
      <header className="flex flex-col gap-1">
        <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Welcome back, Investor</h1>
        <p className="text-text-muted text-xs lg:text-sm font-medium opacity-80 uppercase tracking-tighter">Performance: 12.5% Efficiency Today</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card variant="elevated" className="p-5 lg:p-6 space-y-5 border-white/[0.03]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter">Total Balance</span>
            <Badge variant="purple" size="sm" pulse>Active</Badge>
          </div>
          <div className="space-y-1">
            <AnimatedCounter value={42500.50} currency="₦" className="text-3xl lg:text-4xl font-bold tracking-tight text-white" />
            <div className="flex items-center gap-1.5 text-success text-[10px] font-black uppercase tracking-tighter">
              <ArrowUpRight size={14} strokeWidth={3} />
              <span>+₦1,240.00 Yield Today</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button size="md" className="flex-1 font-bold">Deposit</Button>
            <Button size="md" variant="secondary" className="flex-1 font-bold">Withdraw</Button>
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

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base lg:text-lg font-bold flex items-center gap-2 tracking-tight">
            <Zap size={18} className="text-purple-primary fill-purple-primary/20" />
            Priority Investment Channels
          </h2>
          <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-tighter text-purple-soft">View Market</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} hoverable className="p-5 flex items-center justify-between border-white/[0.03] hover:bg-white/[0.01]">
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold tracking-tight">Vault Protocol Alpha {i}</h4>
                <div className="flex items-center gap-3">
                  <p className="text-[10px] font-black uppercase tracking-tighter text-text-muted">Yield: 15%</p>
                  <div className="w-1 h-1 rounded-full bg-white/10" />
                  <p className="text-[10px] font-black uppercase tracking-tighter text-text-muted">Cycle: 30D</p>
                </div>
              </div>
              <Button size="sm" variant="secondary" className="px-5 font-bold h-9">Details</Button>
            </Card>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default Dashboard;
