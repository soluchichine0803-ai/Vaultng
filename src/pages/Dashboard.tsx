import React from 'react';
import Card from '../components/ui/Card';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { TrendingUp, ArrowUpRight, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { pageTransition } from '../lib/animations';
import { useAuthStore } from '../store/authStore';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-4 lg:space-y-6"
    >
      <header className="flex flex-col gap-0.5 lg:gap-1 mb-2 lg:mb-1">
        <h1 className="text-lg lg:text-xl font-bold tracking-tight">Welcome back, {user?.username || 'Investor'}</h1>
        <p className="text-text-muted text-[10px] lg:text-xs font-black opacity-60 uppercase tracking-tighter">
          Performance: 0% Efficiency Today | Role: <span className="text-purple-soft">{user?.role}</span>
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
        {/* Main Column: Dominant Balance Card */}
        <div className="lg:col-span-8 space-y-4 lg:space-y-5">
          <Card variant="elevated" className="p-6 lg:p-7 space-y-5 lg:space-y-6 border-white/[0.03] bg-white/[0.03]">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] lg:text-[11px] font-black text-text-muted uppercase tracking-[0.2em]">Asset Portfolio</span>
                <h3 className="text-sm lg:text-base font-bold text-text-secondary">Primary Vault Account</h3>
              </div>
              <Badge variant="purple" size="md" pulse className="px-4 py-1">Active</Badge>
            </div>

            <div className="space-y-1.5">
              <span className="text-[9px] lg:text-[10px] font-bold text-text-muted uppercase tracking-wider">Available Liquidity</span>
              <div className="flex flex-col lg:flex-row lg:items-end gap-1 lg:gap-3">
                <AnimatedCounter
                  value={user?.balance || 0}
                  currency="₦"
                  className="text-4xl lg:text-5xl font-bold tracking-tight text-white"
                />
                <div className="flex items-center gap-1 text-success text-[10px] font-black uppercase tracking-tighter mb-1 lg:mb-1.5">
                  <ArrowUpRight size={14} strokeWidth={3} />
                  <span>+₦0.00 Yield Today</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 lg:pt-3">
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
                  <span className="text-[9px] font-black text-text-muted uppercase tracking-tighter">Referral Code</span>
                  <p className="text-xs font-bold text-text-primary uppercase tracking-widest">{user?.referralCode || 'NONE'}</p>
                </div>
             </Card>
          </div>
        </div>

        {/* Desktop Supporting Rail: Secondary Metrics */}
        <div className="lg:col-span-4 flex flex-col gap-1 lg:pt-0.5">
          <Card className="p-4 lg:p-5 space-y-4 border-white/[0.02] bg-white/[0.01]">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Referral Link</span>
              <TrendingUp size={14} className="text-purple-primary opacity-30" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-base lg:text-lg font-bold text-white tracking-tight break-all">vaultng.com/ref/{user?.referralCode}</span>
              </div>
              <p className="text-[9px] font-bold text-text-muted uppercase tracking-tighter opacity-60">Earn commissions for every referral</p>
            </div>
            <div className="pt-0.5">
              <Button size="sm" variant="ghost" className="w-full border border-white/[0.04] font-black text-[8px] uppercase tracking-widest h-9 hover:bg-white/[0.02]">
                Copy Referral Link
              </Button>
            </div>
          </Card>

          <Card className="hidden lg:block p-4 lg:p-5 space-y-4 border-white/[0.02] bg-white/[0.01]">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Infrastructure</span>
              <Shield size={14} className="text-success opacity-30" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-lg lg:text-xl font-bold text-white tracking-tight">Encrypted</h3>
              <p className="text-[9px] font-bold text-text-muted uppercase tracking-tighter opacity-60">Biometric verification active</p>
            </div>
            <div className="pt-0.5">
              <Button size="sm" variant="ghost" className="w-full border border-white/[0.04] font-black text-[8px] uppercase tracking-widest h-9 hover:bg-white/[0.02]">
                Security Node
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <section className="space-y-4 lg:space-y-5 lg:w-2/3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm lg:text-base font-bold flex items-center gap-2 tracking-tight">
            <Zap size={16} className="text-purple-primary fill-purple-primary/20" />
            Priority Investment Channels
          </h2>
          <Button variant="ghost" size="sm" className="text-[9px] font-black uppercase tracking-widest text-purple-soft">View Market</Button>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:gap-4">
          {[1, 2].map((i) => (
            <Card key={i} hoverable className="p-5 flex items-center justify-between border-white/[0.02] hover:bg-white/[0.01]">
              <div className="space-y-1.5 lg:space-y-2">
                <div className="flex items-center gap-2.5">
                  <h4 className="text-xs lg:text-sm font-bold tracking-tight">Vault Protocol Alpha {i}</h4>
                  <Badge variant="purple" size="sm" className="text-[7px] px-2 py-0">Featured</Badge>
                </div>
                <div className="flex items-center gap-4 lg:gap-8">
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-black uppercase tracking-tighter text-text-muted">Yield</p>
                    <p className="text-[11px] font-bold text-success">15.00%</p>
                  </div>
                  <div className="w-px h-5 bg-white/5" />
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-black uppercase tracking-tighter text-text-muted">Cycle</p>
                    <p className="text-[11px] font-bold text-text-primary">30D</p>
                  </div>
                </div>
              </div>
              <Button size="sm" variant="secondary" className="px-5 font-bold h-10 lg:h-11 border-white/[0.05] text-[10px] uppercase tracking-widest">Details</Button>
            </Card>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default Dashboard;
