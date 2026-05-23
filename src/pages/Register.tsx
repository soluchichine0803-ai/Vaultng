import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Wallet } from 'lucide-react';

const Register: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background-primary">
      <Card className="w-full max-w-md p-8 lg:p-10 space-y-8 border-white/[0.02]">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-purple-primary flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(124,58,237,0.3)]">
            <Wallet className="text-white w-7 h-7" />
          </div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Initiate Account</h1>
          <p className="text-text-muted text-[10px] lg:text-xs font-black opacity-60 uppercase tracking-widest">Operational: Node Initialization</p>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" placeholder="John" />
            <Input label="Last Name" placeholder="Doe" />
          </div>
          <Input label="Email Address" type="email" placeholder="john@example.com" />
          <Input label="Password" type="password" placeholder="••••••••" />

          <div className="flex items-start gap-2 pt-2">
            <input type="checkbox" id="terms" className="mt-1 accent-purple-primary" />
            <label htmlFor="terms" className="text-[11px] text-text-muted leading-relaxed">
              I agree to the Terms of Service and Privacy Policy, acknowledging the financial risks involved in investments.
            </label>
          </div>

          <Button className="w-full h-14 font-black uppercase text-xs tracking-[0.2em]">Create Account</Button>
        </div>

        <p className="text-center text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60">
          Already a member?{' '}
          <Link to="/login" className="text-purple-soft font-bold hover:underline">
            Log In
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Register;
