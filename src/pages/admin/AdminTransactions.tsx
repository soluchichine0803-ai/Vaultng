/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState, useCallback } from 'react';
import Card from '../../components/ui/Card';
import { adminService } from '../../services/adminService';
import type { AdminTimelineItem } from '../../services/adminService';
import {
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownLeft,
  Briefcase,
  Layers,
  HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminTransactions: React.FC = () => {
  const [timeline, setTimeline] = useState<AdminTimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'investment' | 'wallet'>('all');

  const fetchTimeline = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getTransactionsTimeline(searchTerm, typeFilter);
      setTimeline(data);
    } catch {
      toast.error('Failed to load transaction audit timeline');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, typeFilter]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  return (
    <div className="space-y-8">
      {/* Header Area */}
      <div>
        <h1 className="text-xl lg:text-2xl font-black uppercase tracking-wider text-white">Timeline Explorer</h1>
        <p className="text-xs text-text-muted mt-1 uppercase tracking-widest font-black opacity-60">Cross-examine user accounts, manual financial requests, and wallet operations</p>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input
            type="text"
            placeholder="Search by Username, Email, Reference..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/[0.04] rounded-xl pl-10 pr-4 py-2.5 text-xs font-black uppercase tracking-widest text-white placeholder:text-text-muted focus:outline-none focus:border-purple-primary/30 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <SlidersHorizontal size={14} className="text-purple-bright shrink-0" />
          <select
            value={typeFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTypeFilter(e.target.value as 'all' | 'deposit' | 'withdrawal' | 'investment' | 'wallet')}
            className="bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:border-purple-primary/30 transition-colors cursor-pointer"
          >
            <option value="all">ALL EVENT TYPES</option>
            <option value="deposit">DEPOSITS ONLY</option>
            <option value="withdrawal">WITHDRAWALS ONLY</option>
            <option value="investment">INVESTMENTS ONLY</option>
            <option value="wallet">WALLET MOVEMENTS</option>
          </select>
        </div>
      </Card>

      {/* Timeline List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-purple-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <Card className="divide-y divide-white/[0.04]">
          {timeline.length === 0 ? (
            <div className="p-12 text-center text-xs text-text-muted font-bold uppercase tracking-widest">
              No matching activity records found on the system.
            </div>
          ) : (
            timeline.map((item, idx) => {
              // Custom layout logic per Event Node Type
              let Icon = HelpCircle;
              let iconColor = 'text-text-muted';
              let badgeColor = 'bg-white/5 border-white/5 text-text-muted';

              if (item.type === 'Deposit') {
                Icon = ArrowUpRight;
                iconColor = 'text-emerald-400';
                badgeColor = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
              } else if (item.type === 'Withdrawal') {
                Icon = ArrowDownLeft;
                iconColor = 'text-amber-400';
                badgeColor = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
              } else if (item.type === 'Transaction') {
                if (item.subType === 'INVESTMENT_CREATED') {
                  Icon = Briefcase;
                  iconColor = 'text-purple-bright';
                  badgeColor = 'bg-purple-primary/10 border-purple-primary/20 text-purple-bright';
                } else {
                  Icon = Layers;
                  iconColor = 'text-blue-400';
                  badgeColor = 'bg-blue-500/10 border-blue-500/20 text-blue-400';
                }
              }

              return (
                <div key={`${item.type}-${item.id}-${idx}`} className="p-5 flex items-start gap-5 hover:bg-white/[0.01] transition-colors">
                  <div className={`p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] ${iconColor}`}>
                    <Icon size={16} />
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${badgeColor}`}>
                          {item.type} {item.subType !== 'Payout' && `• ${item.subType}`}
                        </span>
                        {item.reference && (
                          <span className="text-[10px] text-text-muted font-black uppercase tracking-widest">
                            Ref: {item.reference}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-text-muted font-bold">
                        {new Date(item.createdAt).toLocaleString('en-GB')}
                      </span>
                    </div>

                    <p className="text-xs text-white leading-relaxed font-bold">
                      {item.description}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2 text-[10px] text-text-muted font-black uppercase tracking-wider">
                        <span>User: {item.user.username}</span>
                        <span className="opacity-40">•</span>
                        <span>{item.user.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-text-muted uppercase tracking-wider font-bold">Amount:</span>
                        <span className="text-xs text-white font-black">
                          ₦{item.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                        </span>
                        <span className={`inline-block ml-1.5 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                          item.status === 'COMPLETED' || item.status === 'APPROVED' || item.status === 'PAID'
                            ? 'bg-emerald-500/10 border-emerald-500/10 text-emerald-400'
                            : item.status === 'FAILED' || item.status === 'REJECTED' || item.status === 'REVERSED'
                            ? 'bg-red-500/10 border-red-500/10 text-red-400'
                            : 'bg-amber-500/10 border-amber-500/10 text-amber-400'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </Card>
      )}
    </div>
  );
};

export default AdminTransactions;
