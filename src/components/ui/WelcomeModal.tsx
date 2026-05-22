import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Accordion from './Accordion';
import Button from './Button';
import Badge from './Badge';
import { Gift, Sparkles, ArrowDownCircle, Info } from 'lucide-react';

const WelcomeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('welcomeModalDismissed');
    if (!isDismissed) {
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('welcomeModalDismissed', 'true');
    setIsOpen(false);
  };

  const onboardingItems = [
    {
      title: 'Starter Rewards',
      content: 'New users receive a ₦1,000 welcome bonus upon first successful deposit of ₦10,000 or more. Daily check-ins earn you points towards VIP upgrades.'
    },
    {
      title: 'Referral System',
      content: 'Invite friends using your unique link. Earn 5% commission on their first investment and 2% on subsequent top-ups. Elite referrers get monthly stipends.'
    },
    {
      title: 'VIP Benefits',
      content: 'Higher tiers unlock reduced withdrawal fees, early access to new investment strategies, and a dedicated account manager.'
    },
    {
      title: 'Withdrawal Rules',
      content: 'Standard withdrawals are processed within 24 hours. Minimum withdrawal is ₦2,000. For security, large withdrawals may require 2FA verification.'
    },
    {
      title: 'Platform Policies',
      content: 'VaultNG is committed to financial transparency. All investments carry risk. We use military-grade encryption to secure your assets and data.'
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleDismiss}
      title="Welcome to VaultNG"
    >
      <div className="space-y-6">
        {/* Initial Summary */}
        <div className="bg-purple-primary/5 border border-purple-primary/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-primary flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h4 className="font-bold text-text-primary">Your Premium Journey Begins</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Investor Status:</span>
                <Badge variant="purple" size="sm">Provisional</Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-card border border-white/5 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-purple-soft">
                <Gift size={14} />
                <span className="text-[10px] font-bold uppercase">Starter Bonus</span>
              </div>
              <p className="text-sm font-bold font-mono">₦1,000.00</p>
            </div>
            <div className="p-3 bg-card border border-white/5 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-success">
                <ArrowDownCircle size={14} />
                <span className="text-[10px] font-bold uppercase">Min. Invest</span>
              </div>
              <p className="text-sm font-bold font-mono">₦5,000.00</p>
            </div>
          </div>
        </div>

        {/* Guided Sections */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Info size={16} className="text-purple-primary" />
            <h5 className="text-xs font-bold uppercase tracking-widest text-text-secondary">Onboarding Guide</h5>
          </div>
          <Accordion items={onboardingItems} />
        </div>

        <div className="pt-4">
          <Button onClick={handleDismiss} className="w-full py-4 text-base font-bold">
            Start Investing
          </Button>
          <p className="text-center text-[11px] text-text-muted mt-4 px-6">
            By proceeding, you acknowledge that you have read and understood our investment guidelines and risk disclosures.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default WelcomeModal;
