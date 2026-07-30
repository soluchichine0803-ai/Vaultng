import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '../lib/animations';
import {
  ArrowDownCircle,
  History,
  Loader2,
  Wallet,
  FileText,
  Clock,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { withdrawalService } from '../services/withdrawalService';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../utils/formatters';
import { NIGERIAN_BANKS } from '../utils/banks';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Withdraw: React.FC = () => {
  const { user, fetchUser } = useAuthStore();
  const [amount, setAmount] = useState('');
  const [banks] = useState<any[]>(NIGERIAN_BANKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBankCode, setSelectedBankCode] = useState('');
  const [selectedBankName, setSelectedBankName] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  const withdrawalAmount = Number(amount);

  // Fetch History
  const fetchHistory = async () => {
    try {
      setIsHistoryLoading(true);
      const data = await withdrawalService.getMyWithdrawals();
      setWithdrawals(data);
    } catch (error) {
      console.error('Failed to fetch withdrawal history', error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Time and Day Calculation (WAT)
  const now = new Date();
  const lagosFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Lagos',
    hour: 'numeric',
    hour12: false,
    weekday: 'long',
  });

  const parts = lagosFormatter.formatToParts(now);
  const lagosHour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
  const lagosDay = parts.find(p => p.type === 'weekday')?.value || '';

  const isTimeValid = lagosHour >= 10 && lagosHour < 18;

  // Eligibility Checks
  const getEligibilityError = () => {
    if (!isTimeValid) {
      return "Withdrawals are available daily between 10:00 AM and 6:00 PM (Africa/Lagos).";
    }

    if (amount) {
      if (withdrawalAmount < 3000) {
        return "Minimum withdrawal amount is ₦3,000.";
      }

      if (withdrawalAmount <= 50000 && lagosDay !== 'Tuesday') {
        return "Withdrawals between ₦3,000 and ₦50,000 are processed on Tuesdays.";
      }

      if (withdrawalAmount > 50000 && lagosDay !== 'Thursday') {
        return "Withdrawals above ₦50,000 are processed on Thursdays.";
      }

      if (user && withdrawalAmount > Number(user.availableBalance)) {
        return "Insufficient available balance.";
      }
    }

    return null;
  };

  const eligibilityError = getEligibilityError();
  const amountNum = Number(amount);
  const isAmountInvalid = !amount || isNaN(amountNum) || amountNum <= 0;

  const isSubmitDisabled =
    isAmountInvalid ||
    !selectedBankCode ||
    !accountNumber ||
    !accountName.trim() ||
    isLoading;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !selectedBankCode || !accountNumber || !accountName.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      await withdrawalService.createWithdrawal({
        amount: Number(amount),
        bankCode: selectedBankCode,
        accountNumber,
        accountName: accountName.trim(),
      });
      toast.success('Withdrawal request submitted successfully');
      setAmount('');
      setSelectedBankCode('');
      setSelectedBankName('');
      setSearchQuery('');
      setAccountNumber('');
      setAccountName('');
      fetchUser();
      fetchHistory();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit withdrawal request');
    } finally {
      setIsLoading(false);
    }
  };

  const getFileUrl = (pathStr: string) => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const backendBase = apiBase.replace('/api', '');
    return `${backendBase}${pathStr}`;
  };

  const filteredBanks = banks.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'PAID':
        return 'text-green-400 bg-green-400/10';
      case 'REJECTED':
      case 'FAILED':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-yellow-400 bg-yellow-400/10';
    }
  };

  const maskAccountNumber = (acc: string) => {
    if (!acc) return 'N/A';
    return `******${acc.slice(-4)}`;
  };

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <header className="flex flex-col gap-0.5 lg:gap-1">
        <h1 className="text-lg lg:text-xl font-bold tracking-tight flex items-center gap-2">
          <ArrowDownCircle className="w-5 h-5 text-purple-primary" />
          Withdraw Assets
        </h1>
        <p className="text-text-muted text-[10px] lg:text-xs font-black opacity-60 uppercase tracking-tighter">Operational: Liquidity Outflow</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        {/* Withdrawal Form */}
        <div className="md:col-span-1">
          <Card className="h-full p-5 lg:p-6 space-y-6">
            <form onSubmit={handleWithdraw} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">
                  Withdrawal Amount (NGN)
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isLoading}
                  className="text-lg font-semibold no-spinner"
                  required
                />
              </div>

              {withdrawalAmount > 0 && (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Requested Amount</span>
                    <span className="text-white font-mono font-bold">₦{withdrawalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Withdrawal Charge (20%)</span>
                    <span className="text-danger font-mono font-bold">- ₦{(withdrawalAmount * 0.2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/[0.04] text-sm">
                    <span className="text-text-muted font-bold">Net Amount to Pay</span>
                    <span className="text-success font-mono font-black">₦{(withdrawalAmount * 0.8).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}

              {/* Windows & Guidelines */}
              <div className="space-y-2">
                <div className={`p-3 rounded-lg border flex items-start gap-3 transition-colors ${isTimeValid ? 'bg-success/5 border-success/10' : 'bg-danger/5 border-danger/10'}`}>
                  <Clock size={16} className={`shrink-0 mt-0.5 ${isTimeValid ? 'text-success' : 'text-danger'}`} />
                  <div className="space-y-1">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isTimeValid ? 'text-success' : 'text-danger'}`}>
                      Withdrawal Window
                    </p>
                    <p className="text-[11px] text-text-muted leading-tight">
                      Withdrawals are available daily between <span className="text-white font-bold">10:00 AM and 6:00 PM (WAT)</span>.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-white/[0.05] bg-white/[0.02] flex items-start gap-3">
                  <Calendar size={16} className="text-purple-soft shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-purple-soft">
                      Processing Schedule
                    </p>
                    <div className="text-[11px] text-text-muted leading-relaxed">
                      <p>• ₦3,000 – ₦50,000: <span className="text-white font-bold">Tuesdays</span></p>
                      <p>• ₦50,001 and above: <span className="text-white font-bold">Thursdays</span></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Searchable Bank Dropdown */}
              <div className="relative space-y-1.5">
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1">
                  Bank Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Type to search bank..."
                    value={searchQuery}
                    onFocus={() => setIsDropdownOpen(true)}
                    onBlur={() => {
                      setTimeout(() => setIsDropdownOpen(false), 200);
                    }}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsDropdownOpen(true);
                      if (selectedBankName && e.target.value !== selectedBankName) {
                        setSelectedBankCode('');
                        setSelectedBankName('');
                      }
                    }}
                    disabled={isLoading}
                    className="w-full h-12 bg-white/[0.02] border border-white/[0.08] focus:border-purple-primary/50 focus:bg-white/[0.05] focus:shadow-[0_0_30px_rgba(124,58,237,0.08)] transition-all duration-300 outline-none px-4 py-3 text-sm rounded-lg text-text-primary placeholder:text-text-muted/40"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                {isDropdownOpen && filteredBanks.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto bg-card border border-white/[0.08] rounded-lg shadow-xl divide-y divide-white/[0.03]">
                    {filteredBanks.map((b) => (
                      <button
                        key={b.code}
                        type="button"
                        onClick={() => {
                          setSelectedBankCode(b.code);
                          setSelectedBankName(b.name);
                          setSearchQuery(b.name);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-text-primary hover:bg-white/[0.05] transition-colors focus:outline-none focus:bg-white/[0.05]"
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Input
                label="Account Number"
                placeholder="Enter 10-digit account number"
                value={accountNumber}
                maxLength={10}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                disabled={isLoading}
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider ml-1">
                  Account Name
                </label>
                <input
                  type="text"
                  placeholder="Enter account holder name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full h-12 bg-white/[0.02] border border-white/[0.08] focus:border-purple-primary/50 focus:bg-white/[0.05] focus:shadow-[0_0_30px_rgba(124,58,237,0.08)] transition-all duration-300 outline-none px-4 py-3 text-sm rounded-lg text-text-primary placeholder:text-text-muted/40"
                />
              </div>

              {eligibilityError && (
                <div className="p-4 rounded-xl bg-danger/5 border border-danger/10 flex items-start gap-3 mt-2">
                  <AlertCircle size={16} className="text-danger shrink-0 mt-0.5" />
                  <p className="text-[11px] font-bold text-danger leading-tight">{eligibilityError}</p>
                </div>
              )}

              <div className="p-4 rounded-xl bg-purple-primary/5 border border-purple-primary/10 flex justify-between text-sm">
                <span className="text-gray-400">Available Liquidity</span>
                <span className="text-white font-medium font-mono">
                  ₦{(user?.availableBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-black uppercase tracking-wider text-xs"
                disabled={isSubmitDisabled}
                loading={isLoading}
              >
                Confirm Withdrawal
              </Button>
            </form>
          </Card>
        </div>

        {/* Withdrawal History */}
        <div className="md:col-span-2">
          <Card className="h-full flex flex-col p-5 lg:p-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-purple-primary" />
                Withdrawal History
              </h3>
            </div>

            <div className="flex-1 overflow-x-auto -mx-1 px-1">
              {isHistoryLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <Loader2 className="w-8 h-8 text-purple-primary animate-spin" />
                  <span className="text-gray-400 text-sm">Loading history...</span>
                </div>
              ) : withdrawals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-white/[0.03] flex items-center justify-center mb-3">
                    <Wallet className="w-6 h-6 text-gray-500" />
                  </div>
                  <p className="text-gray-400">No withdrawal requests found</p>
                </div>
              ) : (
                <table className="w-full text-left border-separate border-spacing-0">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest text-text-muted/60 border-b border-white/5">
                      <th className="pb-4 font-black border-b border-white/5">Transaction</th>
                      <th className="pb-4 font-black border-b border-white/5">Destination</th>
                      <th className="pb-4 font-black text-right border-b border-white/5">Amount</th>
                      <th className="pb-4 font-black text-center border-b border-white/5">Proof</th>
                      <th className="pb-4 font-black text-center border-b border-white/5">Status</th>
                      <th className="pb-4 font-black text-right border-b border-white/5">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="text-sm group hover:bg-white/[0.01] transition-colors">
                        <td className="py-4 border-b border-white/[0.03]">
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-white text-xs">
                              Withdrawal Outflow
                            </span>
                          </div>
                        </td>
                        <td className="py-4 border-b border-white/[0.03]">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-text-secondary font-bold">
                              {w.bankName}
                            </span>
                            <span className="text-[10px] text-text-muted font-mono">
                              {maskAccountNumber(w.accountNumber)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-right border-b border-white/[0.03]">
                          <div className="flex flex-col gap-0.5 items-end">
                            <span className="text-sm font-bold text-white" title="Requested Amount">
                              {formatCurrency(Number(w.amount))}
                            </span>
                            <span className="text-[10px] text-text-muted" title="Net Paid Amount">
                              Net: {formatCurrency(Number(w.netAmount) > 0 ? Number(w.netAmount) : Number(w.amount) * 0.8)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 border-b border-white/[0.03]">
                          <div className="flex justify-center">
                            {w.status === 'PAID' && w.proofOfPaymentUrl ? (
                              <a
                                href={getFileUrl(w.proofOfPaymentUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[11px] text-purple-soft hover:text-white font-bold transition-all"
                              >
                                <FileText className="w-4 h-4" />
                                View Proof
                              </a>
                            ) : (
                              <span className="text-xs text-gray-600">—</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 border-b border-white/[0.03]">
                          <div className="flex justify-center">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${getStatusColor(w.status)}`}>
                              {w.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-right text-gray-400 text-[11px] font-medium border-b border-white/[0.03]">
                          {new Date(w.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default Withdraw;
