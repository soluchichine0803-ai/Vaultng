import React from 'react';
import Badge from './ui/Badge';
import Button from './ui/Button';
import Modal from './ui/Modal';
import { Zap, Calendar, Clock, Info } from 'lucide-react';
import type { Investment } from '../types/investment';
import { formatCurrency, formatDuration, formatPercentage } from '../utils/formatters';

interface InvestmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  investment: Investment | null;
}

const InvestmentDetailModal: React.FC<InvestmentDetailModalProps> = ({ isOpen, onClose, investment }) => {
  if (!investment) return null;

  const statusMap = {
    ACTIVE: { label: 'Active', variant: 'purple' as const },
    COMPLETED: { label: 'Matured', variant: 'success' as const },
    CANCELLED: { label: 'Cancelled', variant: 'danger' as const },
  };

  const status = statusMap[investment.status] || { label: investment.status, variant: 'info' as const };

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
            <p className="text-base font-bold text-text-primary">{formatPercentage(investment.roiPercentSnapshot)}</p>
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
          {investment.nextRoiPayoutAt && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-text-muted">
                <Calendar size={14} />
                <span className="text-[10px] font-bold uppercase">Next ROI Payout</span>
              </div>
              <span className="text-xs font-medium text-text-primary">
                {new Date(investment.nextRoiPayoutAt).toLocaleDateString()}
              </span>
            </div>
          )}
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

export default InvestmentDetailModal;
