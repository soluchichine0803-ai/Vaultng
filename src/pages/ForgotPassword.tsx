import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Wallet, CheckCircle2, ArrowLeft } from 'lucide-react';
import { authService } from '../services/authService';
import ParticleBackground from '../components/ui/ParticleBackground';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background-primary relative overflow-hidden">
      <ParticleBackground />

      <Card className="w-full max-w-md p-8 lg:p-10 space-y-8 border-white/[0.02] relative z-10">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-purple-primary flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(124,58,237,0.3)]">
            <Wallet className="text-white w-7 h-7" />
          </div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Recovery</h1>
          <p className="text-text-muted text-[10px] lg:text-xs font-black opacity-60 uppercase tracking-widest">Restore Access to Infrastructure</p>
        </div>

        {isSubmitted ? (
          <div className="space-y-6 py-4">
            <div className="bg-purple-primary/10 border border-purple-primary/20 rounded-2xl p-6 text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-purple-primary/20 flex items-center justify-center">
                <CheckCircle2 className="text-purple-primary w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">Reset Link Sent</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                If an account exists for <span className="text-white font-medium">{email}</span>, you will receive a password reset link shortly.
              </p>
            </div>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-xs font-bold text-purple-soft hover:text-purple-bright transition-colors uppercase tracking-widest"
            >
              <ArrowLeft size={14} />
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-xs text-text-muted text-center leading-relaxed">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {error && <p className="text-[10px] text-red-500 font-bold uppercase">{error}</p>}

            <Button
              type="submit"
              loading={isLoading}
              className="w-full h-14 font-black uppercase text-xs tracking-[0.2em]"
            >
              Send Reset Link
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60 hover:opacity-100 transition-opacity"
              >
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;
