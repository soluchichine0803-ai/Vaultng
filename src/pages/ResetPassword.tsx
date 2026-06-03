import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Wallet, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService';
import ParticleBackground from '../components/ui/ParticleBackground';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await authService.resetPassword(password, token || 'mock-token');
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
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
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Security Update</h1>
          <p className="text-text-muted text-[10px] lg:text-xs font-black opacity-60 uppercase tracking-widest">Finalizing Credentials Update</p>
        </div>

        {isSuccess ? (
          <div className="space-y-6 py-4">
            <div className="bg-purple-primary/10 border border-purple-primary/20 rounded-2xl p-6 text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-purple-primary/20 flex items-center justify-center">
                <CheckCircle2 className="text-purple-primary w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">Password Reset</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Your password has been updated successfully. Redirecting you to login...
              </p>
            </div>
            <Link
              to="/login"
              className="block w-full text-center py-4 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-text-primary uppercase tracking-widest hover:bg-white/10 transition-colors"
            >
              Go to Login Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {error && <p className="text-[10px] text-red-500 font-bold uppercase">{error}</p>}

            <Button
              type="submit"
              loading={isLoading}
              className="w-full h-14 font-black uppercase text-xs tracking-[0.2em]"
            >
              Update Password
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ResetPassword;
