import React, { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { TrendingUp, ArrowUpRight, Shield, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { pageTransition } from '../lib/animations';
import { useAuthStore } from '../store/authStore';
import { toast } from '../store/toastStore';
import { planService } from '../services/planService';
import { investmentService } from '../services/investmentService';
import type { InvestmentPlan } from '../types/plan';
import type { Investment } from '../types/investment';
import { formatCurrency, formatDuration } from '../utils/formatters';
import InvestmentModal from '../components/InvestmentModal';

const PlanSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 gap-3 lg:gap-4">
    {[1, 2, 3].map((i) => (
      <Card key={i} className="p-5 flex items-center justify-between">
        <div className="space-y-3 w-full max-w-[200px]">
          <div className="h-4 bg-white/5 rounded-full w-2/3 animate-pulse" />
          <div className="flex gap-4">
            <div className="space-y-1 w-12">
              <div className="h-2 bg-white/5 rounded-full w-full animate-pulse" />
              <div className="h-3 bg-white/5 rounded-full w-2/3 animate-pulse" />
            </div>
            <div className="space-y-1 w-12">
              <div className="h-2 bg-white/5 rounded-full w-full animate-pulse" />
              <div className="h-3 bg-white/5 rounded-full w-2/3 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="w-24 h-10 lg:h-11 bg-white/5 rounded-lg animate-pulse" />
      </Card>
    ))}
  </div>
);

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvestmentsLoading, setIsInvestmentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const referralUrl = `https://vaultng.com/ref/${user?.referralCode || ''}`;

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const data = await planService.getPlans();
      setPlans(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch plans:', err);
      setError('Unable to load investment plans. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInvestments = async () => {
    try {
      setIsInvestmentsLoading(true);
      const data = await investmentService.getInvestments();
      setInvestments(data);
    } catch (err) {
      console.error('Failed to fetch investments:', err);
    } finally {
      setIsInvestmentsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchInvestments();
  }, []);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralUrl);
    toast.success('Referral link copied to clipboard!');
  };

  const handleInvestClick = (plan: InvestmentPlan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

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
          <Card variant="elevated" className="p-6 lg:p-7 space-y-5 lg:space-y-6">
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
                  value={Number(user?.balance) || 0}
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

          {/* Mobile-Specific Information Continuity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
             <Card className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Shield size={20} className="text-success" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black text-text-muted uppercase tracking-tighter">Security</span>
                  <p className="text-xs font-bold text-text-primary">Encrypted & Active</p>
                </div>
             </Card>
             <Card className="p-4 flex items-center gap-4">
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
          {/* My Investments Section */}
          <Card className="p-4 lg:p-5 space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Active Portfolio</span>
              <Badge variant="purple" size="sm" className="text-[8px] px-1.5 py-0">LIVE</Badge>
            </div>

            <div className="space-y-2.5">
              {isInvestmentsLoading ? (
                [1, 2].map((i) => (
                  <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />
                ))
              ) : investments.length === 0 ? (
                <div className="py-2 text-center">
                  <p className="text-[10px] font-bold text-text-muted opacity-40 uppercase">No active investments</p>
                </div>
              ) : (
                investments.slice(0, 3).map((inv) => {
                  const snapshottedROI = ((inv.expectedProfit / inv.amount) * 100).toFixed(1);
                  return (
                    <div key={inv.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-text-primary truncate max-w-[100px]">{inv.plan?.name}</p>
                        <p className="text-[8px] font-black text-text-muted uppercase tracking-tighter">{formatCurrency(inv.amount)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-success">+{snapshottedROI}%</p>
                        <p className="text-[8px] font-black text-text-muted uppercase tracking-tighter">Yield</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {investments.length > 0 && (
              <Button disabled variant="ghost" size="sm" className="w-full text-[8px] font-black uppercase tracking-widest h-8 border border-white/[0.04] opacity-40">
                View Full Portfolio
              </Button>
            )}
          </Card>

          <Card className="p-4 lg:p-5 space-y-4">
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
              <Button
                onClick={copyReferralLink}
                size="sm"
                variant="ghost"
                className="w-full border border-white/[0.04] font-black text-[8px] uppercase tracking-widest h-9 hover:bg-white/[0.02]"
              >
                Copy Referral Link
              </Button>
            </div>
          </Card>

          <Card className="hidden lg:block p-4 lg:p-5 space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Infrastructure</span>
              <Shield size={14} className="text-success opacity-30" />
            </div>
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-success" />
                <span className="text-[10px] font-bold text-text-primary tracking-tight">Encrypted Connection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-success" />
                <span className="text-[10px] font-bold text-text-primary tracking-tight">Biometric Verification Active</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-success" />
                <span className="text-[10px] font-bold text-text-primary tracking-tight">Vault Network Operational</span>
              </div>
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

        {isLoading ? (
          <PlanSkeleton />
        ) : error ? (
          <Card className="p-10 flex flex-col items-center justify-center text-center space-y-4 border-dashed border-white/10">
            <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
              <AlertCircle size={24} className="text-danger" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-text-primary">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] font-black uppercase tracking-widest text-purple-soft"
                onClick={() => window.location.reload()}
              >
                Retry Connection
              </Button>
            </div>
          </Card>
        ) : plans.length === 0 ? (
          <Card className="p-10 flex flex-col items-center justify-center text-center space-y-3 border-dashed border-white/10">
            <Zap size={32} className="text-text-muted opacity-20" />
            <p className="text-sm font-medium text-text-muted">No investment plans are currently available.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:gap-4">
            {plans.slice(0, 3).map((plan) => (
              <Card key={plan.id} hoverable className="p-5 flex items-center justify-between">
                <div className="space-y-1.5 lg:space-y-2">
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-xs lg:text-sm font-bold tracking-tight">{plan.name}</h4>
                    <span className="text-[9px] font-medium text-text-muted opacity-50">
                      {formatCurrency(plan.minAmount)} - {formatCurrency(plan.maxAmount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 lg:gap-8">
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black uppercase tracking-tighter text-text-muted">ROI Yield</p>
                      <p className="text-[11px] font-bold text-success">{plan.roiPercent.toFixed(2)}%</p>
                    </div>
                    <div className="w-px h-5 bg-white/5" />
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black uppercase tracking-tighter text-text-muted">Duration</p>
                      <p className="text-[11px] font-bold text-text-primary">{formatDuration(plan.durationHours)}</p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleInvestClick(plan)}
                  size="sm"
                  variant="secondary"
                  className="px-5 font-bold h-10 lg:h-11 border-white/[0.05] text-[10px] uppercase tracking-widest"
                >
                  Details
                </Button>
              </Card>
            ))}
          </div>
        )}
      </section>

      <InvestmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plan={selectedPlan}
        onSuccess={fetchInvestments}
      />
    </motion.div>
  );
};

export default Dashboard;
