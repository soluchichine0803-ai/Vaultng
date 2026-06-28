import React from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '../lib/animations';
import Card from '../components/ui/Card';

const TermsOfService: React.FC = () => {
  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="space-y-6">
      <header className="flex flex-col gap-0.5 lg:gap-1">
        <h1 className="text-lg lg:text-xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-text-muted text-[10px] lg:text-xs font-black opacity-60 uppercase tracking-tighter">Legal: Agreement & Protocols</p>
      </header>

      <Card className="p-6 lg:p-8 border-white/[0.02] max-w-none">
        <div className="space-y-6 text-text-muted text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-bold mb-2 uppercase tracking-wider text-xs">VAULTNG TERMS OF SERVICE</h2>
            <p className="text-[10px] opacity-60">Last Updated: June 2026</p>
          </section>

          <p>Welcome to VaultNG ("VaultNG," "we," "our," or "us"). By accessing or using our platform, you agree to be bound by these Terms of Service.</p>

          <section className="space-y-2">
            <h3 className="text-white font-bold text-xs">1. Eligibility</h3>
            <p>To use VaultNG, you must:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Be at least 18 years old;</li>
              <li>Have the legal capacity to enter into legally binding agreements;</li>
              <li>Provide accurate and complete information during registration.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-white font-bold text-xs">2. Account Registration</h3>
            <p>Users are required to provide accurate information, including Full Name, Email Address, Phone Number, and identification information where required. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-white font-bold text-xs">3. Wallet Funding</h3>
            <p>Users may fund their wallets using payment methods supported by VaultNG. All deposits are subject to verification and compliance checks.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-white font-bold text-xs">4. Investment Packages</h3>
            <p>VaultNG provides investment opportunities available on the platform. Investment returns, durations, and eligibility are determined by the investment package selected or automatically assigned based on platform rules. Past performance does not guarantee future returns.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-white font-bold text-xs">5. Withdrawals</h3>
            <p>Withdrawal requests are subject to verification procedures, platform withdrawal schedules, applicable holding periods, and anti-fraud and compliance checks. VaultNG reserves the right to delay or reject suspicious transactions.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-white font-bold text-xs">6. Daily Rewards</h3>
            <p>VaultNG may provide promotional rewards such as Daily Login Bonuses. These rewards are promotional benefits and may be modified or discontinued at any time.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-white font-bold text-xs">7. Prohibited Activities</h3>
            <p>Users shall not provide false information, engage in fraudulent activity, attempt unauthorized access to the platform, or use the platform for money laundering or illegal activities.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-white font-bold text-xs">8. Suspension or Termination</h3>
            <p>VaultNG reserves the right to suspend or terminate accounts that violate these Terms or applicable laws.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-white font-bold text-xs">9. Intellectual Property</h3>
            <p>All trademarks, logos, software, branding, and content remain the exclusive property of VaultNG.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-white font-bold text-xs">10. Limitation of Liability</h3>
            <p>VaultNG shall not be liable for investment losses, market fluctuations, service interruptions beyond our reasonable control, or losses arising from user negligence.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-white font-bold text-xs">11. Amendments</h3>
            <p>VaultNG may update these Terms at any time. Continued use of the platform constitutes acceptance of any revised Terms.</p>
          </section>

          <section className="space-y-2">
            <h3 className="text-white font-bold text-xs">12. Governing Law</h3>
            <p>These Terms shall be governed by the laws of the Federal Republic of Nigeria.</p>
          </section>

          <section className="space-y-1">
            <h3 className="text-white font-bold text-xs">13. Contact</h3>
            <p>Email: support@vaultng.com</p>
            <p>Website: www.vaultng.com</p>
          </section>
        </div>
      </Card>
    </motion.div>
  );
};

export default TermsOfService;
