/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { ShieldAlert, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import ParticleBackground from '../components/ui/ParticleBackground';
import { toast } from 'react-hot-toast';

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const { fetchUser, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsLoading(true);
      await authService.changePassword({
        newPassword: formData.newPassword,
      });

      toast.success('Password changed successfully! Welcome back.');

      // Fetch user to synchronize state
      await fetchUser();

      // Redirect to home/dashboard
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to change password';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background-primary relative overflow-hidden">
      <ParticleBackground />

      <Card className="w-full max-w-md p-8 lg:p-10 space-y-8 border-white/[0.02] relative z-10">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <ShieldAlert className="text-amber-400 w-6 h-6" />
          </div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Security Required</h1>
          <p className="text-text-muted text-[10px] lg:text-xs font-black opacity-60 uppercase tracking-widest">
            Mandatory Password Change
          </p>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 space-y-1 text-center">
          <p className="text-xs text-text-muted leading-relaxed font-semibold">
            An administrator has assigned you a temporary password. You must update your password to continue using the platform securely.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New Secure Password"
            name="newPassword"
            type="password"
            placeholder="••••••••••••"
            value={formData.newPassword}
            onChange={handleInputChange}
            error={validationErrors.newPassword}
            required
          />

          <Input
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            placeholder="••••••••••••"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            error={validationErrors.confirmPassword}
            required
          />

          <Button
            type="submit"
            loading={isLoading}
            className="w-full h-12 lg:h-14 font-black uppercase text-xs tracking-[0.2em]"
          >
            Update Password
          </Button>
        </form>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full text-center text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors"
        >
          <LogOut size={12} />
          Sign Out of Account
        </button>
      </Card>
    </div>
  );
};

export default ChangePassword;
