import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Wallet } from 'lucide-react';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background-primary">
      <Card className="w-full max-w-md p-8 lg:p-10 space-y-8 lg:space-y-10 border-white/[0.02]">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-purple-primary flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(124,58,237,0.3)]">
            <Wallet className="text-white w-7 h-7" />
          </div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Access Ecosystem</h1>
          <p className="text-text-muted text-[10px] lg:text-xs font-black opacity-60 uppercase tracking-widest">Operational: Security Node Alpha</p>
        </div>

        <div className="space-y-5">
          <Input label="Email Address" type="email" placeholder="name@example.com" />
          <Input label="Password" type="password" placeholder="••••••••" />

          <div className="flex justify-end">
            <button className="text-xs font-bold text-purple-soft hover:text-purple-bright transition-colors uppercase tracking-wider">
              Forgot Password?
            </button>
          </div>

          <Button className="w-full h-14 font-black uppercase text-xs tracking-[0.2em]">Sign In</Button>
        </div>

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
