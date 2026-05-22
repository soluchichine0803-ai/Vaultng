import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Wallet } from 'lucide-react';

const Register: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-purple-primary flex items-center justify-center mb-4">
            <Wallet className="text-white w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold">Start Your Journey</h1>
          <p className="text-text-muted text-sm">Join the elite community of VaultNG investors.</p>
        </div>

        <div className="space-y-4">
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

          <Button className="w-full h-12 text-base">Create Account</Button>
        </div>

        <p className="text-center text-sm text-text-muted">
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
