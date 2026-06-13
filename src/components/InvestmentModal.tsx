import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import type { InvestmentPlan } from '../types/plan';
import { formatCurrency, formatDuration } from '../utils/formatters';
import { Zap, ShieldCheck, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { investmentService } from '../services/investmentService';
import { toast } from '../store/toastStore';

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: InvestmentPlan | null;
  onSuccess: () => void;
}

const InvestmentModal: React.FC<InvestmentModalProps> = ({
  isOpen,
  onClose,
  plan,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!plan) return null;

  const handleNext = () => setStep(2);
  const handleBack = () => {
    setStep(1);
    setError(null);
  };

  const handleClose = () => {
    setStep(1);
    setAmount('');
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);

    const investmentAmount = Number(amount);

    // Client-side validation
    if (isNaN(investmentAmount)) {
      setError('Please enter a valid amount.');
      return;
    }
    if (investmentAmount < Number(plan.minAmount)) {
      setError(`Minimum investment is ${formatCurrency(plan.minAmount)}.`);
      return;
    }
    if (investmentAmount > Number(plan.maxAmount)) {
      setError(`Maximum investment is ${formatCurrency(plan.maxAmount)}.`);
      return;
    }

    try {
      setIsSubmitting(true);
      await investmentService.createInvestment({
        planId: plan.id,
        amount: investmentAmount,
      });
      toast.success('Investment created successfully!');
      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error('Investment error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to create investment. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 1 ? 'Plan Details' : `Invest in ${plan.name}`}
    >
      <div className="space-y-6">
        {step === 1 ? (
          <>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-primary/5 border border-purple-primary/10">
                <div className="w-10 h-10 rounded-full bg-purple-primary/10 flex items-center justify-center flex-shrink-0">
                  <Zap size={20} className="text-purple-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary">{plan.name} Protocol</h4>
                  <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Active Yield Channel</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-white/[0.04] bg-white/[0.01] space-y-1">
                  <div className="flex items-center gap-1.5 opacity-50">
                    <TrendingUp size={12} className="text-success" />
                    <span className="text-[9px] font-black uppercase tracking-tighter">ROI Yield</span>
                  </div>
                  <p className="text-lg font-bold text-success">{plan.roiPercent}%</p>
                </div>
                <div className="p-3 rounded-xl border border-white/[0.04] bg-white/[0.01] space-y-1">
                  <div className="flex items-center gap-1.5 opacity-50">
                    <Clock size={12} className="text-purple-soft" />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Duration</span>
                  </div>
                  <p className="text-lg font-bold text-text-primary">{formatDuration(plan.durationHours)}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-text-muted uppercase">Min commitment</span>
                  <span className="text-sm font-bold text-white tracking-tight">{formatCurrency(plan.minAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-text-muted uppercase">Max commitment</span>
                  <span className="text-sm font-bold text-white tracking-tight">{formatCurrency(plan.maxAmount)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 px-1 opacity-70">
                <ShieldCheck size={14} className="text-success mt-0.5" />
                <p className="text-[10px] leading-relaxed text-text-muted font-medium italic">
                  Snapshotted returns: Your ROI and maturity terms are locked in at the moment of commitment.
                </p>
              </div>
            </div>

            <Button onClick={handleNext} className="w-full h-12 font-black uppercase tracking-widest text-[11px]">
              Continue to Invest
            </Button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">
                Amount to Invest (NGN)
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={plan.minAmount}
                max={plan.maxAmount}
                autoFocus
                className="text-lg font-bold h-14"
              />
              <div className="flex justify-between px-1">
                <span className="text-[9px] text-text-muted font-bold">
                  Range: {formatCurrency(plan.minAmount)} - {formatCurrency(plan.maxAmount)}
                </span>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-[10px] font-bold">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleBack}
                disabled={isSubmitting}
                className="w-1/3 h-12 font-bold uppercase tracking-widest text-[10px] bg-white/[0.02]"
              >
                Back
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
                className="flex-1 h-12 font-black uppercase tracking-widest text-[11px]"
              >
                Confirm Investment
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default InvestmentModal;
