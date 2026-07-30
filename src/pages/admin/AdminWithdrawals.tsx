/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState, useCallback } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { adminService } from '../../services/adminService';
import type { AdminWithdrawal } from '../../services/adminService';
import {
  Check,
  X,
  AlertTriangle,
  Search,
  SlidersHorizontal
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminWithdrawals: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'PAID' | 'FAILED'>('ALL');

  // Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'PAY' | 'FAIL';
    withdrawal: AdminWithdrawal | null;
    reason: string;
  }>({
    isOpen: false,
    type: 'PAY',
    withdrawal: null,
    reason: '',
  });

  const [proofFile, setProofFile] = useState<File | null>(null);

  const fetchWithdrawals = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getWithdrawals();
      setWithdrawals(data);
    } catch {
      toast.error('Failed to load manual payout withdrawals queue');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  // Compute filtered withdrawals dynamically during render phase
  const filteredWithdrawals = withdrawals.filter((w) => {
    if (statusFilter !== 'ALL' && w.status !== statusFilter) {
      return false;
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      return (
        w.user.username.toLowerCase().includes(term) ||
        w.user.email.toLowerCase().includes(term) ||
        w.bankName.toLowerCase().includes(term) ||
        w.accountNumber.includes(term) ||
        w.accountName.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const handleOpenConfirm = (type: 'PAY' | 'FAIL', withdrawal: AdminWithdrawal) => {
    setConfirmDialog({
      isOpen: true,
      type,
      withdrawal,
      reason: '',
    });
    setProofFile(null);
  };

  const handleCloseConfirm = () => {
    setConfirmDialog({
      isOpen: false,
      type: 'PAY',
      withdrawal: null,
      reason: '',
    });
    setProofFile(null);
  };

  const handleActionSubmit = async () => {
    const { type, withdrawal, reason } = confirmDialog;
    if (!withdrawal) return;

    if (type === 'FAIL' && !reason.trim()) {
      toast.error('A failure description reason is required');
      return;
    }

    if (type === 'PAY' && !proofFile) {
      toast.error('Proof of payment file is required');
      return;
    }

    try {
      if (type === 'PAY') {
        const formData = new FormData();
        if (proofFile) {
          formData.append('proofOfPayment', proofFile);
        }
        await adminService.payWithdrawal(withdrawal.id, formData);
        toast.success(`Withdrawal marked as PAID successfully`);
      } else {
        await adminService.failWithdrawal(withdrawal.id, reason.trim());
        toast.success(`Withdrawal failed and user balance refunded successfully`);
      }
      handleCloseConfirm();
      fetchWithdrawals();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Action failed to execute');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Area */}
      <div>
        <h1 className="text-xl lg:text-2xl font-black uppercase tracking-wider text-white">Withdrawals Desk</h1>
        <p className="text-xs text-text-muted mt-1 uppercase tracking-widest font-black opacity-60">Fulfill pending manual payout withdrawals or process cancellations</p>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input
            type="text"
            placeholder="Search by User, Bank, Account details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/[0.04] rounded-xl pl-10 pr-4 py-2.5 text-xs font-black uppercase tracking-widest text-white placeholder:text-text-muted focus:outline-none focus:border-purple-primary/30 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <SlidersHorizontal size={14} className="text-purple-bright shrink-0" />
          <select
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as 'ALL' | 'PENDING' | 'PAID' | 'FAILED')}
            className="bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:border-purple-primary/30 transition-colors cursor-pointer"
          >
            <option value="ALL">ALL STATUSES</option>
            <option value="PENDING">PENDING</option>
            <option value="PAID">PAID</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
      </Card>

      {/* Main Table Queue */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-purple-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <Card className="overflow-hidden border-white/[0.04]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.04] bg-white/[0.01]">
                  <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted">User</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Amount</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Bank Details</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Account Number</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Account Name</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Date Requested</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Status</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {filteredWithdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-xs text-text-muted font-bold uppercase tracking-widest">
                      No matching withdrawals found.
                    </td>
                  </tr>
                ) : (
                  filteredWithdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4">
                        <div className="min-w-[150px]">
                          <p className="text-xs text-white font-bold">{w.user.username}</p>
                          <p className="text-[10px] text-text-muted">{w.user.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="min-w-[120px] space-y-0.5">
                          <p className="text-xs text-white font-bold" title="Gross Requested Amount">
                            Gross: ₦{Number(w.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-[10px] text-red-400 font-medium">
                            Fee (20%): ₦{Number(w.fee || Number(w.amount) * 0.2).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-[11px] text-emerald-400 font-bold">
                            Net: ₦{Number(w.netAmount || Number(w.amount) * 0.8).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-bold text-white">
                        {w.bankName}
                      </td>
                      <td className="p-4 text-xs font-black uppercase tracking-widest text-text-muted">
                        {w.accountNumber}
                      </td>
                      <td className="p-4 text-xs text-white font-medium">
                        {w.accountName}
                      </td>
                      <td className="p-4 text-[10px] text-text-muted font-bold">
                        {new Date(w.createdAt).toLocaleString('en-GB')}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          w.status === 'PAID'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : w.status === 'FAILED'
                            ? 'bg-red-500/10 border-red-500/20 text-red-400'
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {w.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenConfirm('PAY', w)}
                              className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                              title="Mark as Paid"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => handleOpenConfirm('FAIL', w)}
                              className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                              title="Mark as Failed (Refund User)"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[9px] font-black uppercase tracking-widest text-text-muted opacity-50">Locked</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Confirmation Modal */}
      {confirmDialog.isOpen && confirmDialog.withdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-primary/80 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-md border-white/[0.04] p-6 lg:p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 text-white">
                <div className={`p-2.5 rounded-xl ${
                  confirmDialog.type === 'PAY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="font-black text-xs uppercase tracking-wider">Confirm Operation</h3>
                  <p className="text-[9px] text-text-muted uppercase tracking-widest font-black opacity-60">Financial Payout Review</p>
                </div>
              </div>
              <button onClick={handleCloseConfirm} className="text-text-muted hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="bg-white/[0.01] border border-white/[0.03] rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-muted font-bold uppercase tracking-wider">Recipient</span>
                <span className="text-white font-bold">{confirmDialog.withdrawal.user.username}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-muted font-bold uppercase tracking-wider">Bank Name</span>
                <span className="text-white font-bold">{confirmDialog.withdrawal.bankName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-muted font-bold uppercase tracking-wider">Account Number</span>
                <span className="text-white font-black uppercase tracking-widest">{confirmDialog.withdrawal.accountNumber}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-muted font-bold uppercase tracking-wider">Account Name</span>
                <span className="text-white font-bold truncate max-w-[200px]">{confirmDialog.withdrawal.accountName}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-white/[0.04]">
                <span className="text-text-muted font-bold uppercase tracking-wider">Requested Gross</span>
                <span className="text-white font-bold">
                  ₦{Number(confirmDialog.withdrawal.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-red-400">
                <span className="font-bold uppercase tracking-wider">Withdrawal Fee (20%)</span>
                <span className="font-bold">
                  ₦{Number(confirmDialog.withdrawal.fee || Number(confirmDialog.withdrawal.amount) * 0.2).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-white/[0.04] text-emerald-400">
                <span className="font-black uppercase tracking-wider text-xs">Net Amount to Pay</span>
                <span className="text-xl font-black">
                  ₦{Number(confirmDialog.withdrawal.netAmount || Number(confirmDialog.withdrawal.amount) * 0.8).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {confirmDialog.type === 'FAIL' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-text-muted block">Rejection/Failure Reason</label>
                <Input
                  variant="textarea"
                  placeholder="Specify why this payout is failed. This reason is shown to the user."
                  value={confirmDialog.reason}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmDialog(prev => ({ ...prev, reason: e.target.value }))}
                  required
                />
              </div>
            )}

            {confirmDialog.type === 'PAY' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-text-muted block">
                  Proof of Payment (Required)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        if (file.size > 10 * 1024 * 1024) {
                          toast.error("File size must not exceed 10MB");
                          e.target.value = "";
                        } else {
                          setProofFile(file);
                        }
                      }
                    }}
                    required
                    className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-purple-primary/50 focus:bg-white/[0.05] transition-all outline-none px-4 py-3 text-xs rounded-lg text-text-primary file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-purple-primary/20 file:text-purple-bright hover:file:bg-purple-primary/30 file:cursor-pointer"
                  />
                </div>
                <p className="text-[9px] text-text-muted uppercase tracking-widest opacity-60">
                  Supported formats: JPG, JPEG, PNG, PDF (Max 10MB)
                </p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={handleCloseConfirm}
                className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest"
              >
                Cancel
              </Button>
              <Button
                onClick={handleActionSubmit}
                disabled={confirmDialog.type === 'PAY' && !proofFile}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest ${
                  confirmDialog.type === 'PAY' ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-red-500 hover:bg-red-400'
                }`}
              >
                {confirmDialog.type === 'PAY' ? 'Mark Paid' : 'Reject & Refund'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminWithdrawals;
