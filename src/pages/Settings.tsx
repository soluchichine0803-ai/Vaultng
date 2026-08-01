import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Bell, HelpCircle, Wallet, X } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { pageTransition } from '../lib/animations';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { toast } from 'react-hot-toast';

const Settings: React.FC = () => {
  const { user, fetchUser } = useAuthStore();
  const [activeModal, setActiveModal] = useState<'profile' | 'password' | 'account' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Profile Form State
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const SUPPORT_NUMBER = '2349049804438';

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await authService.updateProfile({ username, email, phone });
      toast.success('Profile updated successfully');
      await fetchUser();
      setActiveModal(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      setIsLoading(true);
      await authService.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setActiveModal(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactSupport = () => {
    window.open(`https://wa.me/${SUPPORT_NUMBER}`, '_blank');
  };

  const settingsSections = [
    {
      title: 'Account',
      icon: <User size={18} />,
      items: [
        {
          label: 'Profile Information',
          description: 'Update your username and contact details.',
          action: () => setActiveModal('profile'),
          actionLabel: 'Edit'
        },
        {
          label: 'Withdrawal Account',
          description: 'Manage your primary bank account for withdrawals.',
          action: () => setActiveModal('account'),
          actionLabel: 'Manage'
        },
      ]
    },
    {
      title: 'Security',
      icon: <Shield size={18} />,
      items: [
        {
          label: 'Security Password',
          description: 'Change your account password regularly.',
          action: () => setActiveModal('password'),
          actionLabel: 'Change'
        },
      ]
    },
    {
      title: 'Notifications',
      icon: <Bell size={18} />,
      items: [
        {
          label: 'Push Notifications',
          description: 'Receive real-time alerts on your browser/device.',
          status: 'Active',
          action: () => toast.success('Notifications are enabled'),
          actionLabel: 'Verify'
        },
      ]
    }
  ];

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 max-w-4xl mx-auto pb-20 lg:pb-0"
    >
      <header className="flex flex-col gap-0.5 lg:gap-1">
        <h1 className="text-lg lg:text-xl font-bold tracking-tight">System Settings</h1>
        <p className="text-text-muted text-[10px] lg:text-xs font-black opacity-60 uppercase tracking-tighter">Preferences & Configuration</p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {settingsSections.map((section, idx) => (
          <section key={idx} className="space-y-4">
            <div className="flex items-center gap-3 px-1">
              <div className="p-2 rounded-lg bg-purple-primary/10 text-purple-soft">
                {section.icon}
              </div>
              <h2 className="text-sm lg:text-base font-bold tracking-tight">{section.title}</h2>
            </div>

            <Card className="divide-y divide-white/[0.03] overflow-hidden">
              {section.items.map((item, itemIdx) => (
                <div key={itemIdx} className="p-5 flex items-center justify-between group hover:bg-white/[0.01] transition-colors">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white group-hover:text-purple-soft transition-colors">{item.label}</h4>
                    <p className="text-xs text-text-muted leading-relaxed max-w-md">{item.description}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    {('status' in item) && (
                      <span className="px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-success/10 text-success border border-success/20">
                        {item.status}
                      </span>
                    )}
                    <button
                      onClick={item.action}
                      className="text-[10px] font-black text-purple-soft hover:text-white transition-colors uppercase tracking-widest opacity-0 group-hover:opacity-100"
                    >
                      {item.actionLabel}
                    </button>
                  </div>
                </div>
              ))}
            </Card>
          </section>
        ))}

        <Card className="p-6 bg-purple-primary/5 border-purple-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="p-3 rounded-2xl bg-purple-primary/20 text-purple-soft">
                <HelpCircle size={24} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Need assistance?</h3>
                <p className="text-xs text-text-muted">Our support team is available 24/7 for any configuration help.</p>
              </div>
           </div>
           <button
             onClick={handleContactSupport}
             className="px-6 py-2.5 rounded-xl bg-purple-primary text-white text-xs font-black uppercase tracking-widest hover:bg-purple-600 transition-colors shadow-lg shadow-purple-primary/20"
           >
              Contact Support
           </button>
        </Card>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md"
            >
              <Card className="p-6 lg:p-8 space-y-6 relative border-white/[0.08]">
                <button
                  onClick={() => setActiveModal(null)}
                  className="absolute top-4 right-4 p-1 hover:bg-white/5 rounded-lg text-text-muted"
                >
                  <X size={20} />
                </button>

                {activeModal === 'profile' && (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white">Edit Profile</h3>
                      <p className="text-xs text-text-muted">Update your public identity and contact info.</p>
                    </div>
                    <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    <div className="pt-2">
                      <Button type="submit" loading={isLoading} className="w-full">Save Changes</Button>
                    </div>
                  </form>
                )}

                {activeModal === 'password' && (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white">Change Password</h3>
                      <p className="text-xs text-text-muted">Ensure your account remains secure.</p>
                    </div>
                    <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                    <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    <div className="pt-2">
                      <Button type="submit" loading={isLoading} className="w-full">Update Password</Button>
                    </div>
                  </form>
                )}

                {activeModal === 'account' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white">Withdrawal Account</h3>
                      <p className="text-xs text-text-muted">Settings for your automated liquidity outflow.</p>
                    </div>
                    <Card className="p-4 bg-white/[0.02] border-white/[0.05] flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-purple-primary/10 text-purple-soft">
                        <Wallet size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">No bank linked</p>
                        <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">Connect account during withdrawal</p>
                      </div>
                    </Card>
                    <div className="pt-2">
                      <Button onClick={() => setActiveModal(null)} variant="secondary" className="w-full">Done</Button>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Settings;
