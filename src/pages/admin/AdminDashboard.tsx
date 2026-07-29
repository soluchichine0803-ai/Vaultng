/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import { adminService } from '../../services/adminService';
import type { AdminDashboardStats } from '../../services/adminService';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch {
      toast.error('Failed to load operations stats');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-purple-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Pending Deposits',
      value: stats.pendingDeposits,
      icon: ArrowUpRight,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      title: 'Pending Withdrawals',
      value: stats.pendingWithdrawals,
      icon: ArrowDownLeft,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20'
    },
    {
      title: 'Deposits Today',
      value: `₦${stats.depositsTodayAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'text-purple-bright',
      bgColor: 'bg-purple-primary/10 border-purple-primary/20'
    },
    {
      title: 'Withdrawals Today',
      value: `₦${stats.withdrawalsTodayAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
      icon: Activity,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Upper Area */}
      <div>
        <h1 className="text-xl lg:text-2xl font-black uppercase tracking-wider text-white">Operations Dashboard</h1>
        <p className="text-xs text-text-muted mt-1 uppercase tracking-widest font-black opacity-60">System Workload Monitoring Node</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className={`p-6 border flex items-center justify-between ${card.bgColor}`}>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">{card.title}</span>
                <p className="text-xl lg:text-2xl font-bold tracking-tight text-white">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-white/[0.02] flex items-center justify-center border border-white/[0.04] ${card.color}`}>
                <Icon size={20} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Content Area: Recent Activity Feed */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Clock size={16} className="text-purple-bright" />
          <h2 className="text-xs font-black uppercase tracking-widest text-white">Recent Administrative Events</h2>
        </div>

        <Card className="divide-y divide-white/[0.04]">
          {stats.recentActivity.length === 0 ? (
            <div className="p-8 text-center text-xs text-text-muted font-bold uppercase tracking-wider">
              No recent administrative actions recorded.
            </div>
          ) : (
            stats.recentActivity.map((log) => {
              let Icon = ShieldAlert;
              let iconColor = 'text-purple-bright';

              if (log.action.includes('Approve')) {
                Icon = CheckCircle2;
                iconColor = 'text-emerald-400';
              } else if (log.action.includes('Reverse') || log.action.includes('Fail')) {
                Icon = XCircle;
                iconColor = 'text-red-400';
              }

              return (
                <div key={log.id} className="p-4 flex items-start gap-4 transition-colors hover:bg-white/[0.01]">
                  <div className={`mt-0.5 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] ${iconColor}`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white leading-relaxed font-bold">
                      {log.details}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-text-muted font-black uppercase tracking-wider">
                      <span>By: {log.admin?.username || 'Unknown Admin'}</span>
                      <span className="opacity-40">•</span>
                      <span>{new Date(log.createdAt).toLocaleString('en-GB')}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
