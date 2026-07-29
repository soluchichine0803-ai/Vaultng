/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState, useCallback } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { adminService } from '../../services/adminService';
import type { AdminDeposit } from '../../services/adminService';
import {
  Check,
  RotateCcw,
  ExternalLink,
  AlertTriangle,
  Search,
  SlidersHorizontal,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDeposits: React.FC = () => {
  const [deposits, setDeposits] = useState<AdminDeposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REVERSED'>('ALL');

  // Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'APPROVE' | 'REVERSE';
    deposit: AdminDeposit | null;
    reason: string;
  }>({
    isOpen: false,
    type: 'APPROVE',
    deposit: null,
    reason: '',
  });

  const fetchDeposits = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getDeposits();
      setDeposits(data);
    } catch {
      toast.error('Failed to load manual deposits queue');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  // Compute filtered deposits dynamically during render (removes setState in useEffect warning)
  const filteredDeposits = deposits.filter((d) => {
    if (statusFilter !== 'ALL' && d.status !== statusFilter) {
      return false;
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      return (
        d.user.username.toLowerCase().includes(term) ||
        d.user.email.toLowerCase().includes(term) ||
        d.reference.toLowerCase().includes(term) ||
        (d.customerReference && d.customerReference.toLowerCase().includes(term))
      );
    }
    return true;
  });

  const handleOpenConfirm = (type: 'APPROVE' | 'REVERSE', deposit: AdminDeposit) => {
    setConfirmDialog({
      isOpen: true,
      type,
      deposit,
      reason: '',
    });
  };

  const handleCloseConfirm = () => {
    setConfirmDialog({
      isOpen: false,
      type: 'APPROVE',
      deposit: null,
      reason: '',
    });
  };

  const handleActionSubmit = async () => {
    const { type, deposit, reason } = confirmDialog;
    if (!deposit) return;

    if (type === 'REVERSE' && !reason.trim()) {
      toast.error('A reversal reason is required');
      return;
    }

    try {
      if (type === 'APPROVE') {
        await adminService.approveDeposit(deposit.id);
        toast.success(`Deposit ${deposit.reference} approved successfully`);
      } else {
        await adminService.reverseDeposit(deposit.id, reason.trim());
        toast.success(`Deposit ${deposit.reference} reversed successfully`);
      }
      handleCloseConfirm();
      fetchDeposits();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Action failed to execute');
    }
  };

  const handleViewProof = (proofUrl: string | null) => {
    if (!proofUrl) {
      toast.error('No proof file exists for this deposit');
      return;
    }
    // Determine absolute path
    const isAbsolute = proofUrl.startsWith('http');
    const absoluteUrl = isAbsolute ? proofUrl : `${import.meta.env.VITE_API_URL.replace('/api', '')}${proofUrl}`;
    window.open(absoluteUrl, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black uppercase tracking-wider text-white">Deposits Registry</h1>
          <p className="text-xs text-text-muted mt-1 uppercase tracking-widest font-black opacity-60">Review manual user deposits and credit wallets</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input
            type="text"
            placeholder="Search by User, Reference, Cust Ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/[0.04] rounded-xl pl-10 pr-4 py-2.5 text-xs font-black uppercase tracking-widest text-white placeholder:text-text-muted focus:outline-none focus:border-purple-primary/30 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <SlidersHorizontal size={14} className="text-purple-bright shrink-0" />
          <select
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as 'ALL' | 'PENDING' | 'APPROVED' | 'REVERSED')}
            className="bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:border-purple-primary/30 transition-colors cursor-pointer"
          >
            <option value="ALL">ALL STATUSES</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REVERSED">REVERSED</option>
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
                  <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Method</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Reference</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Customer Ref</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Proof</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Date</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Status</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-wider text-text-muted text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {filteredDeposits.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-xs text-text-muted font-bold uppercase tracking-widest">
                      No matching deposits found.
                    </td>
                  </tr>
                ) : (
                  filteredDeposits.map((dep) => (
                    <tr key={dep.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4">
                        <div className="min-w-[150px]">
                          <p className="text-xs text-white font-bold">{dep.user.username}</p>
                          <p className="text-[10px] text-text-muted">{dep.user.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs text-white font-bold leading-none">
                          ₦{Number(dep.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-white/5 border border-white/5 text-text-muted">
                          {dep.method}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-black uppercase tracking-widest text-text-muted">
                        {dep.reference}
                      </td>
                      <td className="p-4 text-xs text-white font-medium">
                        {dep.customerReference || <span className="opacity-40">-</span>}
                      </td>
                      <td className="p-4">
                        {dep.proofImageUrl ? (
                          <button
                            onClick={() => handleViewProof(dep.proofImageUrl)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-primary/10 border border-purple-primary/20 text-purple-bright hover:bg-purple-primary/20 text-[9px] font-black uppercase tracking-widest transition-colors"
                          >
                            <ExternalLink size={10} />
                            View
                          </button>
                        ) : (
                          <span className="text-[9px] font-black uppercase tracking-widest text-text-muted opacity-45">No File</span>
                        )}
                      </td>
                      <td className="p-4 text-[10px] text-text-muted font-bold">
                        {new Date(dep.createdAt).toLocaleString('en-GB')}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          dep.status === 'APPROVED'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : dep.status === 'REVERSED'
                            ? 'bg-red-500/10 border-red-500/20 text-red-400'
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}>
                          {dep.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {dep.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenConfirm('APPROVE', dep)}
                              className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                              title="Approve Manual Deposit"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => handleOpenConfirm('REVERSE', dep)}
                              className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                              title="Reverse Deposit"
                            >
                              <RotateCcw size={14} />
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
      {confirmDialog.isOpen && confirmDialog.deposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-primary/80 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-md border-white/[0.04] p-6 lg:p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 text-white">
                <div className={`p-2.5 rounded-xl ${
                  confirmDialog.type === 'APPROVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="font-black text-xs uppercase tracking-wider">Confirm Operation</h3>
                  <p className="text-[9px] text-text-muted uppercase tracking-widest font-black opacity-60">Financial Review Layer</p>
                </div>
              </div>
              <button onClick={handleCloseConfirm} className="text-text-muted hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="bg-white/[0.01] border border-white/[0.03] rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-muted font-bold uppercase tracking-wider">Transaction Type</span>
                <span className="text-white font-black uppercase tracking-wider">Manual Deposit</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-muted font-bold uppercase tracking-wider">Depositor</span>
                <span className="text-white font-bold">{confirmDialog.deposit.user.username}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-muted font-bold uppercase tracking-wider">Reference</span>
                <span className="text-white font-black uppercase tracking-widest">{confirmDialog.deposit.reference}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-white/[0.04]">
                <span className="text-text-muted font-bold uppercase tracking-wider">Credit Amount</span>
                <span className="text-xl font-black text-white">
                  ₦{Number(confirmDialog.deposit.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {confirmDialog.type === 'REVERSE' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-text-muted block">Reversal Reason</label>
                <Input
                  variant="textarea"
                  placeholder="State the reason why this deposit is being reversed..."
                  value={confirmDialog.reason}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmDialog(prev => ({ ...prev, reason: e.target.value }))}
                  required
                />
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
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest ${
                  confirmDialog.type === 'APPROVE' ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-red-500 hover:bg-red-400'
                }`}
              >
                {confirmDialog.type === 'APPROVE' ? 'Approve & Credit' : 'Reverse request'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDeposits;
