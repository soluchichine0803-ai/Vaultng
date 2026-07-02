import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, Shield, LogOut, Wallet, TrendingUp, ArrowUpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { pageTransition } from '../lib/animations';
import { formatCurrency } from '../utils/formatters';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const accountStats = [
    { label: 'Available Balance', value: formatCurrency(user?.availableBalance || 0), icon: <Wallet size={18} />, color: 'text-purple-soft' },
    { label: 'Locked Balance', value: formatCurrency(user?.lockedBalance || 0), icon: <TrendingUp size={18} />, color: 'text-success' },
    { label: 'Total Net Assets', value: formatCurrency(Number(user?.availableBalance || 0) + Number(user?.lockedBalance || 0)), icon: <ArrowUpCircle size={18} />, color: 'text-white' },
  ];

  const userInfo = [
    { label: 'Username', value: user?.username, icon: <User size={18} /> },
    { label: 'Email Address', value: user?.email, icon: <Mail size={18} /> },
    { label: 'Phone Number', value: user?.phone || 'Not provided', icon: <Phone size={18} /> },
    { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A', icon: <Calendar size={18} /> },
  ];

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 max-w-4xl mx-auto"
    >
      <header className="flex flex-col gap-0.5 lg:gap-1">
        <h1 className="text-lg lg:text-xl font-bold tracking-tight">Account Profile</h1>
        <p className="text-text-muted text-[10px] lg:text-xs font-black opacity-60 uppercase tracking-tighter">Identity & Financial Summary</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-8 flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-3xl bg-purple-primary/10 border border-purple-primary/20 flex items-center justify-center relative group">
              <User size={48} className="text-purple-primary group-hover:scale-110 transition-transform" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-success border-4 border-background-primary flex items-center justify-center">
                <Shield size={10} className="text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.username}</h2>
              <p className="text-xs font-black uppercase tracking-widest text-text-muted opacity-60 mt-1">{user?.role}</p>
            </div>
            <div className="pt-2 w-full">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/settings')}
                className="w-full text-[10px] font-black uppercase tracking-widest h-10 border-white/[0.05]"
              >
                Edit Profile
              </Button>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Quick Actions</h3>
             <div className="space-y-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/deposit')}
                  className="w-full justify-start gap-3 h-11 text-xs font-bold hover:bg-white/[0.03]"
                >
                  <ArrowUpCircle size={16} className="text-purple-soft" />
                  Add Funds
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start gap-3 h-11 text-xs font-bold text-danger/80 hover:text-danger hover:bg-danger/5"
                >
                  <LogOut size={16} />
                  Sign Out
                </Button>
             </div>
          </Card>
        </div>

        {/* Right Column: Detailed Info & Stats */}
        <div className="lg:col-span-2 space-y-6">
          <section className="space-y-3">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted px-1">Financial Summary</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {accountStats.map((stat, i) => (
                  <Card key={i} className="p-5 space-y-3">
                    <div className="p-2 w-fit rounded-lg bg-white/[0.03] text-text-muted">
                      {stat.icon}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black uppercase tracking-tighter text-text-muted opacity-60">{stat.label}</p>
                      <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                  </Card>
                ))}
             </div>
          </section>

          <section className="space-y-3">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted px-1">Personal Information</h3>
             <Card className="divide-y divide-white/[0.03]">
                {userInfo.map((info, i) => (
                  <div key={i} className="p-4 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-white/[0.02] text-text-muted group-hover:text-purple-soft transition-colors">
                        {info.icon}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-black uppercase tracking-tighter text-text-muted opacity-60">{info.label}</p>
                        <p className="text-sm font-bold text-text-primary">{info.value}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-black uppercase tracking-widest">
                       Verify
                    </Button>
                  </div>
                ))}
             </Card>
          </section>

          <section className="space-y-3">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted px-1">Security Status</h3>
             <Card className="p-5 flex items-center justify-between bg-success/[0.02] border-success/10">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-success/10 text-success">
                    <Shield size={20} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">Account Secured</h4>
                    <p className="text-xs text-text-muted">Your account is currently protected by standard encryption.</p>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <span className="px-3 py-1 rounded-full bg-success/20 text-success text-[10px] font-black uppercase tracking-widest">
                    Verified
                  </span>
                </div>
             </Card>
          </section>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
