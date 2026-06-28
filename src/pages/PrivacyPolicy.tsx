import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '../lib/animations';
import Card from '../components/ui/Card';

const PrivacyPolicy: React.FC = () => {
  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <header className="flex flex-col gap-0.5 lg:gap-1">
        <h1 className="text-lg lg:text-xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-text-muted text-[10px] lg:text-xs font-black opacity-60 uppercase tracking-tighter">Legal: Data Governance</p>
      </header>

      <Card className="p-6 lg:p-8 border-white/[0.02] max-w-none">
        <div className="space-y-6 text-text-muted text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-bold mb-2 uppercase tracking-wider text-xs">VAULTNG PRIVACY POLICY</h2>
            <p className="text-[10px] opacity-60">Last Updated: June 2026</p>
          </section>

          <p>VaultNG respects your privacy and is committed to protecting your personal information.</p>

          <section className="space-y-2">
            <h3 className="text-white font-bold text-xs">1. Information We Collect</h3>
            <p>We may collect: Full Name, Email Address, Phone Number, Date of Birth, Bank Account Details, BVN or NIN where required, Transaction History, Device Information, and Usage Information.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-white font-bold text-xs">2. How We Use Your Information</h3>
            <p>Your information is used to: create and manage your account, process deposits and withdrawals, verify your identity, prevent fraud and financial crime, improve our services, and communicate with you.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-white font-bold text-xs">3. Sharing Your Information</h3>
            <p>We may share your information with payment processors, banking partners, regulatory authorities, service providers assisting our operations, and law enforcement agencies where required by law. We do not sell your personal information.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-white font-bold text-xs">4. Data Security</h3>
            <p>We implement reasonable administrative, technical, and physical safeguards to protect your information.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-white font-bold text-xs">5. Cookies and Analytics</h3>
            <p>VaultNG may use cookies and similar technologies to improve user experience and monitor platform performance.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-white font-bold text-xs">6. Data Retention</h3>
            <p>We retain personal information only for as long as necessary to satisfy legal, regulatory, and operational requirements.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-white font-bold text-xs">7. Your Rights</h3>
            <p>You may request to access your personal information, correct inaccurate information, delete information where legally permissible, or withdraw marketing consent.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-white font-bold text-xs">8. Third-Party Services</h3>
            <p>VaultNG may integrate with third-party providers. We are not responsible for the privacy practices of external services.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-white font-bold text-xs">9. Policy Updates</h3>
            <p>This Privacy Policy may be updated periodically. Continued use of the platform constitutes acceptance of the updated policy.</p>
          </section>

          <section className="space-y-1">
            <h3 className="text-white font-bold text-xs">10. Contact</h3>
            <p>Email: privacy@vaultng.com</p>
            <p>Website: www.vaultng.com</p>
          </section>
        </div>
      </Card>
    </motion.div>
  );
};

export default PrivacyPolicy;
