import React from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Bell, Lock, Palette, HelpCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import { pageTransition } from '../lib/animations';

const Settings: React.FC = () => {
  const settingsSections = [
    {
      title: 'Account',
      icon: <User size={18} />,
      items: [
        { label: 'Profile Information', description: 'Update your username and contact details.', status: 'Active' },
        { label: 'Bank Accounts', description: 'Manage your linked bank accounts for withdrawals.', status: 'Placeholder' },
        { label: 'KYC Verification', description: 'Complete your identity verification for higher limits.', status: 'Coming Soon' },
      ]
    },
    {
      title: 'Security',
      icon: <Shield size={18} />,
      items: [
        { label: 'Password', description: 'Change your account password regularly.', status: 'Active' },
        { label: 'Two-Factor Authentication', description: 'Add an extra layer of security to your account.', status: 'Planned' },
        { label: 'Active Sessions', description: 'Monitor and manage devices logged into your account.', status: 'Planned' },
      ]
    },
    {
      title: 'Notifications',
      icon: <Bell size={18} />,
      items: [
        { label: 'Push Notifications', description: 'Receive real-time alerts on your browser/device.', status: 'Active' },
        { label: 'Email Alerts', description: 'Configure which activities trigger email updates.', status: 'Placeholder' },
      ]
    },
    {
      title: 'Appearance',
      icon: <Palette size={18} />,
      items: [
        { label: 'Theme Preferences', description: 'Switch between dark, light, and system themes.', status: 'System' },
        { label: 'Layout Density', description: 'Choose between compact or spacious interface views.', status: 'Coming Soon' },
      ]
    },
    {
      title: 'Privacy',
      icon: <Lock size={18} />,
      items: [
        { label: 'Data Sharing', description: 'Manage how your data is used for analytics.', status: 'Restricted' },
        { label: 'Marketing Emails', description: 'Opt-in or out of promotional communications.', status: 'Placeholder' },
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
                    <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      item.status === 'Active' || item.status === 'System'
                        ? 'bg-success/10 text-success border border-success/20'
                        : 'bg-white/5 text-text-muted border border-white/10'
                    }`}>
                      {item.status}
                    </span>
                    <button className="text-[10px] font-bold text-purple-soft hover:text-white transition-colors uppercase tracking-widest opacity-0 group-hover:opacity-100">
                      Manage
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
           <button className="px-6 py-2.5 rounded-xl bg-purple-primary text-white text-xs font-black uppercase tracking-widest hover:bg-purple-600 transition-colors shadow-lg shadow-purple-primary/20">
              Contact Support
           </button>
        </Card>
      </div>
    </motion.div>
  );
};

export default Settings;
