import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Gift,
  Users,
  CheckCircle2
} from 'lucide-react';

interface TickerItem {
  id: string;
  type: 'deposit' | 'withdrawal' | 'reward' | 'referral' | 'checkin';
  message: string;
}

const ActivityTicker: React.FC = () => {
  // Static dummy data for Phase 3
  const items: TickerItem[] = [
    { id: '1', type: 'deposit', message: 'User ***42 deposited ₦50,000' },
    { id: '2', type: 'withdrawal', message: 'User ***18 withdrew ₦12,400' },
    { id: '3', type: 'reward', message: 'User ***99 earned check-in bonus' },
    { id: '4', type: 'referral', message: 'User ***21 invited a new partner' },
    { id: '5', type: 'checkin', message: 'User ***77 checked in today' },
  ];

  const icons = {
    deposit: <ArrowUpCircle size={12} className="text-success" />,
    withdrawal: <ArrowDownCircle size={12} className="text-danger" />,
    reward: <Gift size={12} className="text-purple-soft" />,
    referral: <Users size={12} className="text-info" />,
    checkin: <CheckCircle2 size={12} className="text-success" />,
  };

  // Duplicate items for infinite scroll effect
  const displayItems = [...items, ...items];

  return (
    <div className="w-full bg-white/[0.01] backdrop-blur-md border-b border-white/[0.04] overflow-hidden h-9 flex items-center">
      <motion.div
        animate={{ x: [0, "-50%"] }}
        transition={{
          x: {
            repeat: Infinity,
            duration: 40,
            ease: "linear",
          },
        }}
        className="flex whitespace-nowrap gap-8 pl-8 w-max"
      >
        {displayItems.map((item, idx) => (
          <div key={`${item.id}-${idx}`} className="flex items-center gap-2">
            {icons[item.type]}
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider opacity-90">
              {item.message}
            </span>
            <div className="w-1 h-1 rounded-full bg-purple-primary/30 ml-4"></div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default ActivityTicker;
