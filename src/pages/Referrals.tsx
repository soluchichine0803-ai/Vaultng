import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '../lib/animations';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Copy, Users, Award, Gift, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from '../store/toastStore';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { formatCurrency } from '../utils/formatters';

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
}

interface TeamMember {
  id: string;
  username: string;
  joinDate: string;
  status: string;
  commissionEarned: number;
}

const Referrals: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Updated link format to always use production domain: https://vault-ng.com
  const referralLink = `https://vault-ng.com/register?ref=${user?.referralCode || ''}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied to clipboard!');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, teamRes] = await Promise.all([
          api.get('/referrals/stats'),
          api.get('/referrals/team')
        ]);
        setStats(statsRes.data.data);
        setTeam(teamRes.data.data);
      } catch (error) {
        console.error('Error fetching referral data:', error);
        toast.error('Failed to load referral data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <header className="flex flex-col gap-0.5 lg:gap-1 mb-2">
        <h1 className="text-lg lg:text-xl font-bold tracking-tight">Partner Network</h1>
        <p className="text-text-muted text-[10px] lg:text-xs font-black opacity-60 uppercase tracking-tighter">Operational: Network Growth</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
        <Card className="p-5 lg:p-6 flex flex-col items-center text-center space-y-2 border-white/[0.02]">
          <div className="w-12 h-12 rounded-2xl bg-purple-primary/10 flex items-center justify-center mb-1">
            <Users className="text-purple-primary" size={24} />
          </div>
          <h3 className="text-xl font-bold tracking-tight">{loading ? '...' : stats?.totalReferrals || 0}</h3>
          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60">Total Partners</p>
        </Card>
        <Card className="p-5 lg:p-6 flex flex-col items-center text-center space-y-2 border-white/[0.02]">
          <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center mb-1">
            <Award className="text-success" size={24} />
          </div>
          <h3 className="text-xl font-bold text-success tracking-tight">
            {loading ? '...' : formatCurrency(stats?.totalEarnings || 0)}
          </h3>
          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60">Revenue Yield</p>
        </Card>
        <Card className="p-5 lg:p-6 flex flex-col items-center text-center space-y-2 border-white/[0.02]">
          <div className="w-12 h-12 rounded-2xl bg-info/10 flex items-center justify-center mb-1">
            <Gift className="text-info" size={24} />
          </div>
          <h3 className="text-xl font-bold text-info tracking-tight">{loading ? '...' : stats?.activeReferrals || 0}</h3>
          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60">Active Partners</p>
        </Card>
      </div>

      <Card className="p-6 lg:p-8 space-y-4 lg:space-y-5 border-white/[0.02]">
        <div className="space-y-1">
          <h3 className="text-sm lg:text-base font-bold tracking-tight">Network Expansion Link</h3>
          <p className="text-xs lg:text-sm text-text-muted opacity-80">Expand your partner circle to earn protocol yield on their initial commitments.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-lg px-4 py-4 text-xs lg:text-sm font-mono text-purple-soft overflow-hidden whitespace-nowrap flex items-center">
            vault-ng.com/register?ref={user?.referralCode}
          </div>

          <Button
            onClick={copyLink}
            size="lg"
            className="h-12 sm:h-auto px-10 font-black uppercase text-[10px] tracking-widest"
            icon={<Copy size={14} />}
          >
            Copy Link
          </Button>
        </div>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm lg:text-base font-bold tracking-tight">Recent Partners</h2>
        </div>

        <Card className="overflow-hidden border-white/[0.02]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.05] bg-white/[0.01]">
                  <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60">Username</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60">Join Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60 text-right">Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-white/5 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-32 bg-white/5 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-white/5 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-20 bg-white/5 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : team.length > 0 ? (
                  team.map((member) => (
                    <tr key={member.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4 text-xs font-bold">{member.username}</td>
                      <td className="px-6 py-4 text-[10px] text-text-muted">
                        {new Date(member.joinDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                          member.status === 'EARNED'
                            ? 'bg-success/10 text-success'
                            : 'bg-white/5 text-text-muted'
                        }`}>
                          {member.status === 'EARNED' ? (
                            <>
                              <CheckCircle2 size={10} />
                              Earned
                            </>
                          ) : (
                            <>
                              <Clock size={10} />
                              Pending
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-right font-bold text-purple-soft">
                        {formatCurrency(member.commissionEarned)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-text-muted text-xs opacity-60 italic">
                      No partners recruited yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </motion.div>
  );
};

export default Referrals;
