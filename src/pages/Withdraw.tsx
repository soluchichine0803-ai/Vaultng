import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from '../lib/animations';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuthStore } from '../store/authStore';
import { withdrawalService } from '../services/withdrawalService';
import { toast } from 'react-hot-toast';
import { AlertCircle, Clock, Calendar, History, CheckCircle2, XCircle, Timer, Search, ChevronDown, Check, Loader2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const Withdraw: React.FC = () => {
  const { user, fetchUser } = useAuthStore();
  const [amount, setAmount] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  // Bank & Resolution states
  const [banks, setBanks] = useState<{ name: string; code: string }[]>([]);
  const [isBanksLoading, setIsBanksLoading] = useState(true);
  const [isResolving, setIsResolving] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  const [devBypassActive, setDevBypassActive] = useState(false);

  // Custom Dropdown Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const withdrawalAmount = Number(amount);

  // Fetch initial configuration, banks, and history
  const initPage = async () => {
    try {
      setIsHistoryLoading(true);
      setIsBanksLoading(true);

      const [historyData, configData, banksList] = await Promise.all([
        withdrawalService.getMyWithdrawals(),
        withdrawalService.getConfig().catch((e) => {
          console.error('Failed to fetch config', e);
          return { devBypassActive: false };
        }),
        withdrawalService.getBanks().catch((e) => {
          console.error('Failed to fetch banks', e);
          return [];
        }),
      ]);

      setWithdrawals(historyData);
      setDevBypassActive(configData.devBypassActive);
      setBanks(banksList);
    } catch (error) {
      console.error('Failed to initialize page data', error);
    } finally {
      setIsHistoryLoading(false);
      setIsBanksLoading(false);
    }
  };

  useEffect(() => {
    initPage();
  }, []);

  // Handle clicking outside custom dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle automatic account name resolution
  useEffect(() => {
    if (!bankCode || accountNumber.length !== 10 || !/^\d+$/.test(accountNumber)) {
      setIsResolved(false);
      setAccountName('');
      return;
    }

    const resolve = async () => {
      try {
        setIsResolving(true);
        setIsResolved(false);
        setAccountName('');
        const res = await withdrawalService.resolveAccount(accountNumber, bankCode);
        setAccountName(res.accountName);
        setIsResolved(true);
        toast.success('Account resolved successfully');
      } catch (error: any) {
        console.error('Account resolution failed:', error);
        const msg = error.response?.data?.message || 'Could not resolve bank account details. Verify bank and account number.';
        toast.error(msg);
      } finally {
        setIsResolving(false);
      }
    };

    resolve();
  }, [bankCode, accountNumber]);

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
    if (devBypassActive) return null;

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
  const balanceError = user && amount && withdrawalAmount > Number(user.availableBalance) ? "Insufficient available balance." : null;
  const devMinError = devBypassActive && amount && withdrawalAmount < 3000 ? "Minimum withdrawal amount is ₦3,000." : null;

  const activeError = eligibilityError || balanceError || devMinError;

  const isSubmitDisabled =
    !!activeError ||
    !amount ||
    !bankCode ||
    !accountNumber ||
    !accountName ||
    !isResolved ||
    isLoading ||
    isResolving;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !bankCode || !accountNumber || !accountName) {
      toast.error('Please fill in all fields and resolve account');
      return;
    }

    if (activeError) {
      toast.error(activeError);
      return;
    }

    try {
      setIsLoading(true);
      await withdrawalService.createWithdrawal({
        amount: Number(amount),
        bankName,
        bankCode,
        accountNumber,
        accountName,
      });
      toast.success('Withdrawal request processed successfully');
      setAmount('');
      setBankCode('');
      setBankName('');
      setAccountNumber('');
      setAccountName('');
      setIsResolved(false);
      setSearchQuery('');
      fetchUser();
      const updatedHistory = await withdrawalService.getMyWithdrawals();
      setWithdrawals(updatedHistory);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit withdrawal request');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBanks = banks.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <header className="flex flex-col gap-0.5 lg:gap-1">
        <h1 className="text-lg lg:text-xl font-bold tracking-tight">Withdraw Assets</h1>
        <p className="text-text-muted text-[10px] lg:text-xs font-black opacity-60 uppercase tracking-tighter">Operational: Liquidity Outflow</p>
      </header>

      <div className="max-w-md mx-auto w-full pt-4 lg:pt-8">
        <Card className="p-6 lg:p-8 space-y-6 border-white/[0.02]">
          <div className="p-4 lg:p-5 bg-white/[0.03] border border-white/[0.05] rounded-xl">
            <p className="text-[9px] uppercase font-black text-text-muted tracking-widest mb-1">Available Liquidity</p>
            <p className="text-2xl lg:text-3xl font-bold text-white font-mono">₦{(user?.availableBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>

          <form onSubmit={handleWithdraw} className="space-y-4">
            {devBypassActive && (
              <div className="p-3 rounded-lg bg-purple-primary/10 border border-purple-primary/20 flex items-center gap-2 mb-2">
                <AlertCircle size={14} className="text-purple-soft" />
                <p className="text-[10px] font-black uppercase text-purple-soft tracking-widest">Dev Mode: Schedule Bypass Active</p>
              </div>
            )}

            {!devBypassActive && (
              <div className="space-y-2 mb-2">
                <div className={`p-3 rounded-lg border flex items-start gap-3 transition-colors ${isTimeValid ? 'bg-success/5 border-success/10' : 'bg-danger/5 border-danger/10'}`}>
                  <Clock size={16} className={isTimeValid ? 'text-success' : 'text-danger'} />
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
                  <Calendar size={16} className="text-purple-soft" />
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
            )}

            <Input
              label="Withdrawal Amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="no-spinner text-white"
            />

            {/* Custom Searchable Bank Dropdown */}
            <div className="space-y-1.5" ref={dropdownRef}>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">Bank Name</label>
              <div className="relative">
                <button
                  type="button"
                  disabled={isBanksLoading}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex h-11 w-full items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.02] px-3.5 py-2 text-left text-xs font-medium text-white shadow-sm ring-offset-background placeholder:text-text-muted/40 focus:outline-none focus:ring-1 focus:ring-purple-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className={bankName ? 'text-white' : 'text-text-muted/50'}>
                    {isBanksLoading ? 'Loading bank list...' : (bankName || 'Select bank')}
                  </span>
                  <ChevronDown className="h-4 w-4 text-text-muted/60" aria-hidden="true" />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-30 mt-1.5 max-h-56 w-full overflow-hidden rounded-lg border border-white/[0.08] bg-background-secondary shadow-lg ring-1 ring-black ring-opacity-5"
                    >
                      <div className="flex items-center border-b border-white/[0.08] px-3">
                        <Search className="h-3.5 w-3.5 text-text-muted shrink-0" />
                        <input
                          type="text"
                          placeholder="Search banks..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="h-10 w-full bg-transparent px-3 text-xs text-white placeholder-text-muted/40 outline-none"
                        />
                      </div>
                      <div className="max-h-44 overflow-y-auto py-1 divide-y divide-white/[0.02]">
                        {filteredBanks.length === 0 ? (
                          <div className="px-4 py-3 text-center text-xs text-text-muted/60">No banks found</div>
                        ) : (
                          filteredBanks.map((bank) => (
                            <button
                              key={bank.code}
                              type="button"
                              onClick={() => {
                                setBankCode(bank.code);
                                setBankName(bank.name);
                                setIsDropdownOpen(false);
                                setSearchQuery('');
                              }}
                              className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-xs text-gray-300 hover:bg-purple-primary/10 hover:text-white transition-colors"
                            >
                              <span>{bank.name}</span>
                              {bankCode === bank.code && <Check className="h-3.5 w-3.5 text-purple-soft" />}
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <Input
              label="Account Number"
              placeholder="Enter 10-digit account number"
              value={accountNumber}
              maxLength={10}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
              required
              className="text-white"
            />

            <div className="space-y-1">
              <div className="relative">
                <Input
                  label="Account Name"
                  placeholder={isResolving ? 'Resolving account details...' : 'Resolved account holder name'}
                  value={accountName}
                  required
                  readOnly
                  disabled
                  className="bg-white/[0.01] border-white/[0.05] text-white opacity-80 cursor-not-allowed select-none font-bold"
                />
                {isResolving && (
                  <div className="absolute right-3.5 bottom-3.5">
                    <Loader2 className="w-4 h-4 text-purple-primary animate-spin" />
                  </div>
                )}
                {isResolved && !isResolving && (
                  <div className="absolute right-3.5 bottom-3.5">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  </div>
                )}
              </div>
              {isResolving && (
                <p className="text-[10px] text-purple-soft/80 font-black tracking-widest animate-pulse">VERIFYING ACCOUNT VIA PAYSTACK SECURE GATEWAY...</p>
              )}
            </div>

            {activeError && (
              <div className="p-4 rounded-xl bg-danger/5 border border-danger/10 flex items-start gap-3 mt-2">
                <AlertCircle size={16} className="text-danger shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold text-danger leading-tight">{activeError}</p>
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full h-14 font-black uppercase text-xs tracking-widest disabled:opacity-40"
                loading={isLoading}
                disabled={isSubmitDisabled}
              >
                {!isResolved && accountNumber.length === 10 ? 'Awaiting Resolution' : 'Confirm Withdrawal'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Withdrawal History Section */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold flex items-center gap-2 tracking-tight">
              <History size={18} className="text-purple-primary" />
              Withdrawal History
            </h2>
            <Badge variant="purple" size="sm" className="text-[8px] px-1.5 py-0">RECENT</Badge>
          </div>

          <Card className="overflow-hidden border-white/[0.02]">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/[0.03]">
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-widest text-text-muted">Transaction</th>
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-widest text-text-muted">Destination</th>
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-widest text-text-muted">Status</th>
                    <th className="px-6 py-4 text-right text-[9px] font-black uppercase tracking-widest text-text-muted">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {isHistoryLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={4} className="px-6 py-4"><div className="h-10 bg-white/5 rounded-lg" /></td>
                      </tr>
                    ))
                  ) : withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center opacity-30">
                          <History size={32} className="mb-2" />
                          <p className="text-xs font-bold uppercase tracking-tighter">No withdrawal records found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    withdrawals.map((w) => {
                      const getStatusIcon = (status: string) => {
                        switch (status) {
                          case 'APPROVED': return <CheckCircle2 size={14} className="text-success" />;
                          case 'REJECTED': return <XCircle size={14} className="text-danger" />;
                          case 'PENDING': return <Timer size={14} className="text-purple-soft" />;
                          default: return <History size={14} className="text-text-muted" />;
                        }
                      };

                      const maskAccountNumber = (acc: string) => {
                        if (!acc) return 'N/A';
                        return `******${acc.slice(-4)}`;
                      };

                      return (
                        <tr key={w.id} className="hover:bg-white/[0.01] transition-colors group">
                          <td className="px-6 py-4">
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-white">Withdrawal Outflow</p>
                              <p className="text-[10px] text-text-muted">{new Date(w.createdAt).toLocaleDateString()} • {new Date(w.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-text-secondary">{w.bankName}</p>
                              <p className="text-[10px] text-text-muted font-mono">{maskAccountNumber(w.accountNumber)}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(w.status)}
                              <span className={`text-[10px] font-black uppercase tracking-widest ${
                                w.status === 'APPROVED' ? 'text-success' :
                                w.status === 'REJECTED' ? 'text-danger' :
                                'text-purple-soft'
                              }`}>
                                {w.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="text-sm font-bold text-white">{formatCurrency(w.amount)}</p>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </div>
    </motion.div>
  );
};

export default Withdraw;
