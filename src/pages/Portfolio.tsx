import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from '../lib/animations';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { Briefcase, Calendar, TrendingUp, Clock, AlertCircle, Info, Zap } from 'lucide-react';
import { investmentService } from '../services/investmentService';
import type { Investment } from '../types/investment';
import { formatCurrency, formatDuration } from '../utils/formatters';

const PortfolioSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <Card key={i} className="p-5 lg:p-6 border-white/[0.02]">
        <div className="flex justify-between items-center">
          <div className="space-y-3 w-full max-w-md">
            <div className="h-5 bg-white/5 rounded-full w-1/3 animate-pulse" />
            <div className="flex gap-6">
              <div className="h-4 bg-white/5 rounded-full w-24 animate-pulse" />
              <div className="h-4 bg-white/5 rounded-full w-24 animate-pulse" />
            </div>
          </div>
          <div className="w-20 h-8 bg-white/5 rounded-lg animate-pulse" />
        </div>
      </Card>
    ))}
  </div>
);

const InvestmentDetailModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  investment: Investment | null;
}> = ({ isOpen, onClose, investment }) => {
  if (!investment) return null;

  const statusMap = {
    ACTIVE: { label: 'Active', variant: 'purple' as const },
    COMPLETED: { label: 'Matured', variant: 'success' as const },
    CANCELLED: { label: 'Cancelled', variant: 'danger' as const },
  };

  const status = statusMap[investment.status] || { label: investment.status, variant: 'default' as const };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Investment Details">
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-primary/5 border border-purple-primary/10">
          <div className="w-10 h-10 rounded-full bg-purple-primary/10 flex items-center justify-center flex-shrink-0">
            <Zap size={20} className="text-purple-primary" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-primary">{investment.plan?.name} Protocol</h4>
            <Badge variant={status.variant} size="sm" className="mt-1">{status.label}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] space-y-1">
            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Amount Invested</p>
            <p className="text-base font-bold text-text-primary font-mono">{formatCurrency(investment.amount)}</p>
          </div>
          <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] space-y-1">
            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Expected Profit</p>
            <p className="text-base font-bold text-success font-mono">{formatCurrency(investment.expectedProfit)}</p>
          </div>
          <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] space-y-1">
            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">ROI Snapshot</p>
            <p className="text-base font-bold text-text-primary">{investment.roiPercentSnapshot.toFixed(2)}%</p>
          </div>
          <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] space-y-1">
            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Duration</p>
            <p className="text-base font-bold text-text-primary">{formatDuration(investment.durationHoursSnapshot)}</p>
          </div>
        </div>

        <div className="space-y-3 p-4 rounded-xl border border-white/[0.04] bg-white/[0.01]">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-text-muted">
              <Calendar size={14} />
              <span className="text-[10px] font-bold uppercase">Start Date</span>
            </div>
            <span className="text-xs font-medium text-text-primary">
              {new Date(investment.createdAt).toLocaleDateString()} {new Date(investment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-text-muted">
              <Clock size={14} />
              <span className="text-[10px] font-bold uppercase">Maturity Date</span>
            </div>
            <span className="text-xs font-medium text-text-primary">
              {new Date(investment.maturityDate).toLocaleDateString()} {new Date(investment.maturityDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 px-1 opacity-70">
          <Info size={14} className="text-purple-soft mt-0.5" />
          <p className="text-[10px] leading-relaxed text-text-muted font-medium italic">
            This is a read-only historical record of your commitment to the {investment.plan?.name} Protocol.
          </p>
        </div>

        <Button onClick={onClose} className="w-full h-12 font-black uppercase tracking-widest text-[11px]">
          Close Record
        </Button>
      </div>
    </Modal>
  );
};

const Portfolio: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchInvestments = async () => {
    try {
      setIsLoading(true);
      const data = await investmentService.getInvestments();
      setInvestments(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch investments:', err);
      setError('Unable to load your portfolio. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  const handleInspect = (investment: Investment) => {
    setSelectedInvestment(investment);
    setIsModalOpen(true);
  };

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <header className="flex flex-col gap-0.5 lg:gap-1">
        <h1 className="text-lg lg:text-xl font-bold tracking-tight">Active Portfolio</h1>
        <p className="text-text-muted text-[10px] lg:text-xs font-black opacity-60 uppercase tracking-tighter">
          Operational: Comprehensive Commitment Registry
        </p>
      </header>

      {isLoading ? (
        <PortfolioSkeleton />
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
              onClick={fetchInvestments}
            >
              Retry Connection
            </Button>
          </div>
        </Card>
      ) : investments.length === 0 ? (
        <Card className="p-10 flex flex-col items-center justify-center text-center space-y-4 border-dashed border-white/10">
          <div className="w-16 h-16 rounded-full bg-white/[0.02] flex items-center justify-center">
            <Briefcase size={32} className="text-text-muted opacity-20" />
          </div>
          <div className="space-y-2 max-w-xs">
            <p className="text-sm font-bold text-text-primary">No commitments detected</p>
            <p className="text-xs text-text-muted leading-relaxed">
              You haven't made any investments yet. Explore available plans to get started.
            </p>
          </div>
          <Button
            href="/invest"
            className="px-8 font-black uppercase text-[10px] tracking-widest"
          >
            Explore Channels
          </Button>
        </Card>
      ) : (
        <div className="space-y-3 lg:space-y-4">
          {investments.map((inv) => {
            const statusMap = {
              ACTIVE: { label: 'Active', variant: 'purple' as const },
              COMPLETED: { label: 'Matured', variant: 'success' as const },
              CANCELLED: { label: 'Cancelled', variant: 'danger' as const },
            };
            const status = statusMap[inv.status] || { label: inv.status, variant: 'default' as const };

            return (
              <Card key={inv.id} className="p-5 lg:p-6 border-white/[0.02] hover:border-white/[0.06] transition-colors group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm lg:text-base font-bold tracking-tight">{inv.plan?.name} Protocol</h3>
                      <Badge variant={status.variant} size="sm">{status.label}</Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-8">
                      <div>
                        <p className="text-[9px] uppercase font-black text-text-muted tracking-widest">Commitment</p>
                        <p className="font-mono text-xs lg:text-sm font-bold text-text-primary">{formatCurrency(inv.amount)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase font-black text-text-muted tracking-widest">Expected Profit</p>
                        <p className="font-mono text-xs lg:text-sm font-bold text-success">+{formatCurrency(inv.expectedProfit)}</p>
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-[9px] uppercase font-black text-text-muted tracking-widest">Yield Term</p>
                        <p className="text-xs lg:text-sm font-bold text-text-primary">{inv.roiPercentSnapshot.toFixed(1)}% / {formatDuration(inv.durationHoursSnapshot)}</p>
                      </div>
                      <div className="hidden sm:block text-right md:text-left">
                        <p className="text-[9px] uppercase font-black text-text-muted tracking-widest">Maturity Date</p>
                        <p className="text-xs lg:text-sm font-bold text-text-primary">
                          {new Date(inv.maturityDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleInspect(inv)}
                    variant="secondary"
                    className="w-full md:w-auto h-10 px-6 font-black uppercase text-[10px] tracking-widest bg-white/[0.02] group-hover:bg-white/[0.05]"
                  >
                    Inspect
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <InvestmentDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        investment={selectedInvestment}
      />
    </motion.div>
  );
};

export default Portfolio;
