/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { adminService } from '../../services/adminService';
import {
  ArrowLeft,
  User,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Lock,
  ExternalLink,
  DollarSign,
  AlertCircle,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserDetail {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  role: string;
  frozen: boolean;
  mustChangePassword?: boolean;
  createdAt: string;
}

interface WalletSummary {
  availableBalance: number;
  lockedBalance: number;
  totalBalance: number;
  lifetimeDeposits: number;
  lifetimeWithdrawals: number;
  lifetimeInvestments: number;
}

interface InvestmentHistoryItem {
  id: string;
  amount: number;
  expectedProfit: number;
  roiPercentSnapshot: number;
  durationHoursSnapshot: number;
  status: string;
  maturityDate: string;
  nextRoiPayoutAt: string | null;
  createdAt: string;
  planName: string;
}

interface DepositHistoryItem {
  id: string;
  amount: number;
  method: string;
  reference: string;
  customerReference: string | null;
  proofImageUrl: string | null;
  status: string;
  rejectionReason: string | null;
  reviewDate: string | null;
  createdAt: string;
}

interface WithdrawalHistoryItem {
  id: string;
  amount: number;
  fee: number;
  netAmount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: string;
  rejectionReason: string | null;
  completionDate: string | null;
  proofOfPaymentUrl: string | null;
  createdAt: string;
}

const AdminUserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [investments, setInvestments] = useState<InvestmentHistoryItem[]>([]);
  const [deposits, setDeposits] = useState<DepositHistoryItem[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'investments' | 'deposits' | 'withdrawals'>('investments');

  // Password reset modal states
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [generatedTempPassword, setGeneratedTempPassword] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const fetchProfile = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await adminService.getUserProfile(id);
      setUser(data.user);
      setWallet(data.wallet);
      setInvestments(data.investments);
      setDeposits(data.deposits);
      setWithdrawals(data.withdrawals);
    } catch {
      toast.error('Failed to retrieve target user account profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const handleResetPassword = async () => {
    if (!id) return;
    try {
      setIsResetting(true);
      const res = await adminService.resetUserPassword(id);
      setGeneratedTempPassword(res.temporaryPassword);
      setIsResetConfirmOpen(false);
      toast.success('Password reset initiated successfully!');
      fetchProfile(); // reload to sync mustChangePassword
    } catch {
      toast.error('Failed to trigger administrator-assisted password recovery');
    } finally {
      setIsResetting(false);
    }
  };

  const handleCloseTempPasswordModal = () => {
    setGeneratedTempPassword(null);
  };

  if (isLoading || !user || !wallet) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-purple-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Back Button and Header */}
      <div className="space-y-4">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          Back to User Registry
        </Link>
        <div>
          <h1 className="text-xl lg:text-2xl font-black uppercase tracking-wider text-white capitalize flex items-center gap-2">
            Profile Node: {user.username}
          </h1>
          <p className="text-xs text-text-muted uppercase tracking-widest font-black opacity-60">
            Operations: Account Isolation & Financial Analysis Node
          </p>
        </div>
      </div>

      {/* Grid of Profile Summary & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Details Card */}
        <Card className="p-6 space-y-6 border-white/[0.04] bg-white/[0.01]">
          <div className="flex items-center gap-3 border-b border-white/[0.04] pb-4">
            <div className="p-2.5 rounded-xl bg-purple-primary/15 text-purple-bright border border-purple-primary/20">
              <User size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">Identity Details</h2>
              <span className="text-[10px] text-text-muted font-mono">{user.id}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-text-muted block">Full Name</span>
              <p className="text-sm font-bold text-white capitalize mt-0.5">{user.username}</p>
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-text-muted block">Email Address</span>
              <p className="text-sm font-semibold text-white mt-0.5">{user.email}</p>
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-text-muted block">Phone Connection</span>
              <p className="text-sm font-semibold text-white mt-0.5">{user.phone || 'No phone listed'}</p>
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-text-muted block">Security Node Role</span>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-purple-primary/10 text-purple-bright border border-purple-primary/20">
                {user.role}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-text-muted block">Initialization Stamp</span>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-text-secondary font-medium">
                <Calendar size={14} className="text-text-muted" />
                <span>{new Date(user.createdAt).toLocaleString('en-GB')}</span>
              </div>
            </div>
          </div>

          {/* Action Panel */}
          <div className="pt-4 border-t border-white/[0.04] space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Security Controls</h3>

            {user.mustChangePassword && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-200/80 leading-relaxed font-bold">
                  User is in mandatory password-change enforcement state.
                </p>
              </div>
            )}

            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-purple-primary/30 bg-purple-primary/5 text-purple-bright text-xs font-black uppercase tracking-widest hover:bg-purple-primary hover:text-white transition-all shadow-md hover:shadow-purple-primary/10"
            >
              <Lock size={14} />
              Reset Password
            </button>
          </div>
        </Card>

        {/* Financial Wallet Details Card */}
        <Card className="lg:col-span-2 p-6 space-y-6 border-white/[0.04] bg-white/[0.01]">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-primary/15 text-purple-bright border border-purple-primary/20">
                <Wallet size={18} />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-white">Financial Balances</h2>
                <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Asset Breakdown & Liquidity Ledger</p>
              </div>
            </div>
          </div>

          {/* Core Balances Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.03]">
              <span className="text-[9px] font-black uppercase tracking-widest text-text-muted block">Available Balance</span>
              <p className="text-lg lg:text-xl font-bold tracking-tight text-white mt-1">
                ₦{wallet.availableBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.03]">
              <span className="text-[9px] font-black uppercase tracking-widest text-text-muted block">Locked Balance</span>
              <p className="text-lg lg:text-xl font-bold tracking-tight text-text-muted mt-1">
                ₦{wallet.lockedBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-purple-primary/5 border border-purple-primary/10">
              <span className="text-[9px] font-black uppercase tracking-widest text-purple-soft block">Total Net Assets</span>
              <p className="text-lg lg:text-xl font-black tracking-tight text-purple-bright mt-1">
                ₦{wallet.totalBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Operational Metrics (Lifetime sums) */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Lifetime Ledger Audit</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-emerald-500/[0.02] border border-emerald-500/10 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Lifetime Deposits</span>
                  <p className="text-sm lg:text-base font-bold text-emerald-400 mt-1">
                    ₦{wallet.lifetimeDeposits.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <ArrowUpRight size={16} />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-red-500/[0.02] border border-red-500/10 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Lifetime Withdrawals</span>
                  <p className="text-sm lg:text-base font-bold text-red-400 mt-1">
                    ₦{wallet.lifetimeWithdrawals.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-red-500/5 border border-red-500/10 flex items-center justify-center text-red-400">
                  <ArrowDownLeft size={16} />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/[0.02] border border-blue-500/10 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Lifetime Investments</span>
                  <p className="text-sm lg:text-base font-bold text-blue-400 mt-1">
                    ₦{wallet.lifetimeInvestments.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-blue-500/5 border border-blue-500/10 flex items-center justify-center text-blue-400">
                  <DollarSign size={16} />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Interactive Tabs and Lists */}
      <div className="space-y-4">
        {/* Tab Selection Navigation */}
        <div className="flex border-b border-white/[0.04]">
          <button
            onClick={() => setActiveTab('investments')}
            className={`px-6 py-3.5 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
              activeTab === 'investments'
                ? 'border-purple-bright text-purple-bright'
                : 'border-transparent text-text-muted hover:text-white'
            }`}
          >
            Investments History ({investments.length})
          </button>
          <button
            onClick={() => setActiveTab('deposits')}
            className={`px-6 py-3.5 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
              activeTab === 'deposits'
                ? 'border-purple-bright text-purple-bright'
                : 'border-transparent text-text-muted hover:text-white'
            }`}
          >
            Deposits ({deposits.length})
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-6 py-3.5 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
              activeTab === 'withdrawals'
                ? 'border-purple-bright text-purple-bright'
                : 'border-transparent text-text-muted hover:text-white'
            }`}
          >
            Withdrawals ({withdrawals.length})
          </button>
        </div>

        {/* Tab Panels */}
        <Card className="overflow-hidden border-white/[0.04]">
          {activeTab === 'investments' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.04] bg-white/[0.01]">
                    <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Package</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted text-right">Amount</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted text-right">ROI (%)</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted text-right">Expected Profit</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted text-center">Status</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Created Stamp</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Maturity Stamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {investments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-xs text-text-muted font-bold uppercase tracking-wider">
                        No recorded investment packages found for this account.
                      </td>
                    </tr>
                  ) : (
                    investments.map((inv) => (
                      <tr key={inv.id} className="hover:bg-white/[0.005] transition-colors">
                        <td className="p-4 text-xs font-bold text-white capitalize">{inv.planName}</td>
                        <td className="p-4 text-xs font-bold text-white text-right">
                          ₦{inv.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 text-xs font-bold text-purple-bright text-right">
                          {inv.roiPercentSnapshot}%
                        </td>
                        <td className="p-4 text-xs font-bold text-emerald-400 text-right">
                          ₦{inv.expectedProfit.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 text-center">
                          {inv.status === 'ACTIVE' ? (
                            <Badge variant="success">ACTIVE</Badge>
                          ) : inv.status === 'COMPLETED' ? (
                            <Badge variant="info">COMPLETED</Badge>
                          ) : (
                            <Badge variant="danger">CANCELLED</Badge>
                          )}
                        </td>
                        <td className="p-4 text-xs text-text-secondary font-medium">
                          {new Date(inv.createdAt).toLocaleString('en-GB')}
                        </td>
                        <td className="p-4 text-xs text-text-secondary font-medium">
                          {new Date(inv.maturityDate).toLocaleString('en-GB')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'deposits' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.04] bg-white/[0.01]">
                    <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Reference</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Customer Ref</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted text-right">Amount</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Method</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted text-center">Status</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Submitted Date</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted text-center">Proof</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {deposits.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-xs text-text-muted font-bold uppercase tracking-wider">
                        No manual deposits have been initiated by this account.
                      </td>
                    </tr>
                  ) : (
                    deposits.map((dep) => (
                      <tr key={dep.id} className="hover:bg-white/[0.005] transition-colors">
                        <td className="p-4 text-xs font-mono font-bold text-white uppercase">{dep.reference}</td>
                        <td className="p-4 text-xs font-medium text-text-secondary">{dep.customerReference || 'None'}</td>
                        <td className="p-4 text-xs font-bold text-white text-right">
                          ₦{dep.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 text-xs font-bold text-text-secondary capitalize">{dep.method}</td>
                        <td className="p-4 text-center">
                          {dep.status === 'APPROVED' ? (
                            <Badge variant="success">APPROVED</Badge>
                          ) : dep.status === 'PENDING' ? (
                            <Badge variant="warning">PENDING</Badge>
                          ) : (
                            <Badge variant="danger">{dep.status}</Badge>
                          )}
                        </td>
                        <td className="p-4 text-xs text-text-secondary font-medium">
                          {new Date(dep.createdAt).toLocaleString('en-GB')}
                        </td>
                        <td className="p-4 text-center">
                          {dep.proofImageUrl ? (
                            <a
                              href={dep.proofImageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-white/[0.02] hover:bg-purple-primary/10 hover:text-purple-bright text-[10px] font-bold text-text-muted transition-colors border border-white/[0.04]"
                            >
                              <FileText size={12} />
                              View
                              <ExternalLink size={10} />
                            </a>
                          ) : (
                            <span className="text-[10px] text-text-muted italic">None</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'withdrawals' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.04] bg-white/[0.01]">
                    <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Account Details</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted text-right">Gross Amount</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted text-right">Fee (20%)</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted text-right">Net Paid</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted text-center">Status</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Requested Stamp</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-xs text-text-muted font-bold uppercase tracking-wider">
                        No manual withdrawals have been requested by this account.
                      </td>
                    </tr>
                  ) : (
                    withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-white/[0.005] transition-colors">
                        {/* Account details */}
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-white capitalize">{w.bankName}</p>
                            <p className="text-[10px] text-text-muted font-mono">
                              {w.accountNumber} • <span className="capitalize">{w.accountName}</span>
                            </p>
                          </div>
                        </td>
                        <td className="p-4 text-xs font-bold text-text-secondary text-right">
                          ₦{w.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 text-xs font-bold text-red-400 text-right">
                          ₦{w.fee.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 text-xs font-bold text-emerald-400 text-right">
                          ₦{w.netAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 text-center">
                          {w.status === 'PAID' ? (
                            <Badge variant="success">PAID</Badge>
                          ) : w.status === 'PENDING' ? (
                            <Badge variant="warning">PENDING</Badge>
                          ) : (
                            <Badge variant="danger">{w.status}</Badge>
                          )}
                        </td>
                        <td className="p-4 text-xs text-text-secondary font-medium">
                          {new Date(w.createdAt).toLocaleString('en-GB')}
                        </td>
                        <td className="p-4 text-center">
                          {w.proofOfPaymentUrl ? (
                            <a
                              href={w.proofOfPaymentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-white/[0.02] hover:bg-purple-primary/10 hover:text-purple-bright text-[10px] font-bold text-text-muted transition-colors border border-white/[0.04]"
                            >
                              <FileText size={12} />
                              Proof
                              <ExternalLink size={10} />
                            </a>
                          ) : (
                            <span className="text-[10px] text-text-muted italic">None</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Confirmation Password Reset Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 lg:p-8 space-y-6 relative border-white/[0.08]">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-xl bg-purple-primary/10 border border-purple-primary/20 flex items-center justify-center text-purple-bright shadow-[0_0_15px_rgba(124,58,237,0.15)]">
                <Lock size={20} />
              </div>
              <h3 className="text-base lg:text-lg font-black uppercase tracking-wider text-white">Reset User Password?</h3>
              <p className="text-xs text-text-muted leading-relaxed max-w-sm font-semibold">
                This will generate a strong, cryptographically secure temporary password and set the mandatory password-change requirement flag on this account.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                disabled={isResetting}
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] rounded-xl"
              >
                Cancel
              </button>
              <button
                disabled={isResetting}
                onClick={handleResetPassword}
                className="flex-1 py-3 text-xs font-black uppercase tracking-widest bg-purple-primary text-white hover:bg-purple-600 transition-colors rounded-xl shadow-lg shadow-purple-primary/20 flex items-center justify-center gap-2"
              >
                {isResetting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Reset'
                )}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Temporary Password Display Modal (Shown ONLY ONCE) */}
      {generatedTempPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <Card className="w-full max-w-md p-6 lg:p-8 space-y-6 relative border-purple-primary/30 bg-background-primary shadow-[0_0_50px_rgba(124,58,237,0.15)]">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <Lock size={20} />
              </div>
              <h3 className="text-base lg:text-lg font-black uppercase tracking-wider text-white">Temporary Password Generated</h3>
              <p className="text-xs text-text-muted leading-relaxed font-semibold">
                Copy this password and deliver it securely to <strong className="text-white capitalize">{user.username}</strong>.
                <br />
                <span className="text-red-400 font-bold uppercase tracking-wider text-[10px] mt-2 block">
                  Security Warning: This password is shown once. It will never be stored or shown again.
                </span>
              </p>
            </div>

            {/* Display Box */}
            <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl text-center select-all cursor-pointer group hover:bg-white/[0.05] transition-colors relative">
              <p className="text-lg font-mono font-bold tracking-wider text-purple-bright">
                {generatedTempPassword}
              </p>
              <span className="absolute right-2.5 bottom-1.5 text-[8px] font-black uppercase text-text-muted opacity-40 group-hover:opacity-100 transition-opacity">
                Double click to select
              </span>
            </div>

            <button
              onClick={handleCloseTempPasswordModal}
              className="w-full py-3 text-xs font-black uppercase tracking-widest bg-emerald-500 text-white hover:bg-emerald-600 transition-colors rounded-xl shadow-lg shadow-emerald-500/20"
            >
              I Have Securely Copied This Password
            </button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminUserProfile;
