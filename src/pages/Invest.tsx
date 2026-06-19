import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '../lib/animations';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { AlertCircle, Zap } from 'lucide-react';
import { planService } from '../services/planService';
import type { InvestmentPlan } from '../types/plan';
import { formatCurrency, formatDuration, formatPercentage } from '../utils/formatters';
import InvestmentModal from '../components/InvestmentModal';

const InvestSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 gap-3 lg:gap-4">
    {[1, 2, 3, 4].map((i) => (
      <Card key={i} className="p-5 lg:p-6 border-white/[0.02]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-4 w-full max-w-md">
            <div className="h-6 bg-white/5 rounded-full w-1/2 animate-pulse" />
            <div className="h-4 bg-white/5 rounded-full w-full animate-pulse" />
            <div className="flex gap-6">
              <div className="space-y-2 w-24">
                <div className="h-2 bg-white/5 rounded-full w-full animate-pulse" />
                <div className="h-4 bg-white/5 rounded-full w-2/3 animate-pulse" />
              </div>
              <div className="space-y-2 w-24">
                <div className="h-2 bg-white/5 rounded-full w-full animate-pulse" />
                <div className="h-4 bg-white/5 rounded-full w-2/3 animate-pulse" />
              </div>
            </div>
          </div>
          <div className="w-full md:w-32 h-12 bg-white/5 rounded-lg animate-pulse" />
        </div>
      </Card>
    ))}
  </div>
);

const Invest: React.FC = () => {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const data = await planService.getAllPlans();
      setPlans(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch plans:', err);
      setError('Unable to load investment plans. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleInvestClick = (plan: InvestmentPlan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <header className="flex flex-col gap-0.5 lg:gap-1 mb-2">
        <h1 className="text-lg lg:text-xl font-bold tracking-tight">Investment Channels</h1>
        <p className="text-text-muted text-[10px] lg:text-xs font-black opacity-60 uppercase tracking-tighter">Operational: Active Market Channels</p>
      </header>

      {isLoading ? (
        <InvestSkeleton />
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
          {plans.map((plan) => (
            <Card key={plan.id} className={`p-5 lg:p-6 border-white/[0.02] ${!plan.active ? 'opacity-50' : ''}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-sm lg:text-base font-bold tracking-tight">{plan.name} Protocol</h3>
                    <span className="px-2 py-0.5 bg-success/10 text-success text-[9px] font-black rounded uppercase tracking-widest border border-success/10">
                      {formatPercentage(plan.roiPercent)} ROI
                    </span>
                    {!plan.active && (
                      <span className="px-2 py-0.5 bg-white/5 text-text-muted text-[9px] font-black rounded uppercase tracking-widest border border-white/10">
                        Unavailable
                      </span>
                    )}
                  </div>
                  <p className="text-xs lg:text-sm text-text-muted max-w-md leading-relaxed opacity-80">
                    Precision yield optimization through structured {plan.name.toLowerCase()} protocols and liquidity aggregation over a {formatDuration(plan.durationHours).toLowerCase()} cycle.
                  </p>
                  <div className="flex gap-6 lg:gap-8 pt-1">
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase font-black text-text-muted tracking-widest">Commitment Range</p>
                      <p className="font-mono text-xs lg:text-sm font-bold text-text-primary">
                        {formatCurrency(plan.minAmount)} - {formatCurrency(plan.maxAmount)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase font-black text-text-muted tracking-widest">Duration</p>
                      <p className="font-mono text-xs lg:text-sm font-bold text-text-primary">{formatDuration(plan.durationHours)}</p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleInvestClick(plan)}
                  disabled={!plan.active}
                  className="w-full md:w-auto h-12 px-8 font-black uppercase text-[10px] tracking-widest"
                >
                  {plan.active ? 'Invest Now' : 'Closed'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <InvestmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plan={selectedPlan}
        onSuccess={() => {
          // In a real app, we might refresh balances or investments here.
          // For now, just being consistent.
        }}
      />
    </motion.div>
  );
};

export default Invest;
