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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Main Column: Dominant Balance Card */}
        <div className="lg:col-span-8 space-y-4 lg:space-y-6">
          <Card variant="elevated" className="p-6 lg:p-8 space-y-6 lg:space-y-8 border-white/[0.03] bg-gradient-to-br from-card-elevated to-card">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] lg:text-[11px] font-black text-text-muted uppercase tracking-[0.2em]">Asset Portfolio</span>
                <h3 className="text-sm lg:text-base font-bold text-text-secondary">Primary Vault Account</h3>
              </div>
              <Badge variant="purple" size="md" pulse className="px-4 py-1">Active</Badge>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Available Liquidity</span>
              <div className="flex flex-col lg:flex-row lg:items-end gap-2 lg:gap-4">
                <AnimatedCounter value={42498.74} currency="₦" className="text-4xl lg:text-6xl font-bold tracking-tighter text-white" />
                <div className="flex items-center gap-1.5 text-success text-[11px] font-black uppercase tracking-tighter mb-1.5 lg:mb-2.5">
                  <ArrowUpRight size={16} strokeWidth={3} />
                  <span>+₦1,240.00 Yield Today</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 lg:pt-4">
              <Button size="lg" className="flex-1 font-black uppercase tracking-widest text-xs h-14">Deposit</Button>
              <Button size="lg" variant="secondary" className="flex-1 font-black uppercase tracking-widest text-xs h-14 bg-white/[0.02]">Withdraw</Button>
            </div>
          </Card>

          {/* Mobile-Specific Information Continuity: Security status moved to a subtle horizontal bar on mobile, or just integrated better */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
             <Card className="p-4 flex items-center gap-4 bg-white/[0.02] border-white/[0.03]">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Shield size={20} className="text-success" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black text-text-muted uppercase tracking-tighter">Security</span>
                  <p className="text-xs font-bold text-text-primary">Encrypted & Active</p>
                </div>
             </Card>
             <Card className="p-4 flex items-center gap-4 bg-white/[0.02] border-white/[0.03]">
                <div className="w-10 h-10 rounded-xl bg-purple-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={20} className="text-purple-primary" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black text-text-muted uppercase tracking-tighter">Performance</span>
                  <p className="text-xs font-bold text-text-primary">+12.5% Efficiency</p>
                </div>
             </Card>
          </div>
        </div>

        {/* Desktop Sidebar: Secondary Metrics */}
        <div className="lg:col-span-4 space-y-4 lg:space-y-6">
          <Card className="p-6 space-y-6 bg-white/[0.01] border-white/[0.03]">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Allocations</span>
              <TrendingUp size={18} className="text-purple-primary opacity-50" />
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <AnimatedCounter value={12} decimals={0} className="text-4xl font-bold text-white tracking-tight" />
                <span className="text-xs font-bold text-text-muted">Positions</span>
              </div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Spread across 4 asset classes</p>
            </div>
            <div className="pt-2">
              <Button size="sm" variant="ghost" className="w-full border border-white/[0.05] font-bold text-[10px] uppercase tracking-widest h-10">
                Portfolio Analytics
              </Button>
            </div>
          </Card>

          <Card className="hidden lg:block p-6 space-y-6 bg-white/[0.01] border-white/[0.03]">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Infrastructure</span>
              <Shield size={18} className="text-success opacity-50" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-white tracking-tight">Encrypted</h3>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Biometric verification active</p>
            </div>
            <div className="pt-2">
              <Button size="sm" variant="ghost" className="w-full border border-white/[0.05] font-bold text-[10px] uppercase tracking-widest h-10">
                Security Node
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <section className="space-y-5 lg:w-2/3">
        <div className="flex items-center justify-between">
          <h2 className="text-base lg:text-lg font-bold flex items-center gap-2 tracking-tight">
            <Zap size={18} className="text-purple-primary fill-purple-primary/20" />
            Priority Investment Channels
          </h2>
          <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-tighter text-purple-soft">View Market</Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} hoverable className="p-5 lg:p-6 flex items-center justify-between border-white/[0.03] hover:bg-white/[0.01]">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h4 className="text-sm lg:text-base font-bold tracking-tight">Vault Protocol Alpha {i}</h4>
                  <Badge variant="purple" size="sm" className="text-[8px]">Featured</Badge>
                </div>
                <div className="flex items-center gap-4 lg:gap-6">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase tracking-tighter text-text-muted">Estimated Yield</p>
                    <p className="text-xs font-bold text-success">15.00% APR</p>
                  </div>
                  <div className="w-px h-6 bg-white/5" />
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase tracking-tighter text-text-muted">Term Cycle</p>
                    <p className="text-xs font-bold text-text-primary">30 Days</p>
                  </div>
                </div>
              </div>
              <Button size="md" variant="secondary" className="px-6 font-bold h-11 lg:h-12 border-white/[0.05]">Details</Button>
            </Card>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default Dashboard;
