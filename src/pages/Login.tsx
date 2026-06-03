import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Wallet, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import ParticleBackground from '../components/ui/ParticleBackground';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, setError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by the store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background-primary relative overflow-hidden">
      <ParticleBackground />

      <Card className="w-full max-w-md p-8 lg:p-10 space-y-8 lg:space-y-10 border-white/[0.02] relative z-10">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-purple-primary flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(124,58,237,0.3)]">
            <Wallet className="text-white w-7 h-7" />
          </div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Access Ecosystem</h1>
          <p className="text-text-muted text-[10px] lg:text-xs font-black opacity-60 uppercase tracking-widest">Operational: Security Node Alpha</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="text-red-500 w-5 h-5 shrink-0" />
            <p className="text-xs text-red-200 leading-relaxed font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleInputChange}
            required
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-purple-primary focus:ring-purple-primary/30"
              />
              <label htmlFor="rememberMe" className="text-[11px] font-bold text-text-muted uppercase tracking-wider cursor-pointer">
                Remember Me
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="text-xs font-bold text-purple-soft hover:text-purple-bright transition-colors uppercase tracking-wider"
            >
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            loading={isLoading}
            className="w-full h-14 font-black uppercase text-xs tracking-[0.2em]"
          >
            Sign In
          </Button>
        </form>

        <p className="text-center text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60">
          Don't have an account?{' '}
          <Link to="/register" className="text-purple-soft font-bold hover:underline">
            Create one
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;
