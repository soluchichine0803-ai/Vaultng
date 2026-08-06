/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { adminService } from '../../services/adminService';
import { Users, Search, Eye, Calendar, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserItem {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  role: string;
  frozen: boolean;
  mustChangePassword?: boolean;
  createdAt: string;
  availableBalance: number;
  lockedBalance: number;
  totalBalance: number;
  activeInvestmentsCount: number;
  totalReferralsCount: number;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch {
      toast.error('Failed to retrieve system user registry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.username.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.phone && u.phone.includes(term))
    );
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-purple-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Upper Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black uppercase tracking-wider text-white flex items-center gap-2">
            <Users size={22} className="text-purple-bright" />
            User Accounts Registry
          </h1>
          <p className="text-xs text-text-muted mt-1 uppercase tracking-widest font-black opacity-60">
            Operations Console: Auditing & Account Management Node
          </p>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="max-w-md">
        <div className="relative">
          <Input
            placeholder="Search by name, email, or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
          <Search size={16} className="absolute left-3.5 top-3.5 text-text-muted opacity-60" />
        </div>
      </div>

      {/* Users Registry List Card */}
      <Card className="overflow-hidden border-white/[0.04]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.04] bg-white/[0.01]">
                <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Full Name</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Email / Phone</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted text-right">Wallet Balance</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted text-center">Active Invests</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted text-center">Referrals</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted text-center">Status</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Joined Date</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-xs text-text-muted font-bold uppercase tracking-wider">
                    No registered user accounts match search query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  return (
                    <tr key={u.id} className="hover:bg-white/[0.01] transition-colors">
                      {/* Name */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-primary/10 border border-purple-primary/20 flex items-center justify-center text-purple-bright font-black uppercase text-sm">
                            {u.username.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white capitalize leading-none">{u.username}</p>
                            <span className="text-[9px] text-text-muted uppercase tracking-wider font-bold opacity-60">
                              {u.role}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <p className="text-xs font-medium text-white">{u.email}</p>
                          <p className="text-[10px] text-text-muted font-mono">{u.phone || 'None'}</p>
                        </div>
                      </td>

                      {/* Wallet Balance */}
                      <td className="p-4 text-right">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-white">
                            ₦{u.totalBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-[9px] text-text-muted font-semibold uppercase tracking-tighter">
                            Avail: ₦{u.availableBalance.toLocaleString('en-NG')}
                          </p>
                        </div>
                      </td>

                      {/* Active Investments */}
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                          <ArrowUpRight size={12} className="text-purple-bright" />
                          <span className="text-xs font-bold text-white">{u.activeInvestmentsCount}</span>
                        </div>
                      </td>

                      {/* Referrals */}
                      <td className="p-4 text-center">
                        <span className="text-xs font-bold text-text-secondary">{u.totalReferralsCount}</span>
                      </td>

                      {/* Account Status */}
                      <td className="p-4 text-center">
                        {u.frozen ? (
                          <Badge variant="danger">FROZEN</Badge>
                        ) : u.mustChangePassword ? (
                          <Badge variant="warning">MUST CHG PW</Badge>
                        ) : (
                          <Badge variant="success">ACTIVE</Badge>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="p-4 text-xs font-medium text-text-secondary">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-text-muted" />
                          <span>{new Date(u.createdAt).toLocaleDateString('en-GB')}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <Link
                          to={`/admin/users/${u.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-primary/10 border border-purple-primary/20 text-[10px] font-black uppercase tracking-wider text-purple-bright hover:bg-purple-primary hover:text-white transition-all"
                        >
                          <Eye size={12} />
                          Profile
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminUsers;
