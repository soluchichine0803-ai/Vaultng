import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Wallet } from 'lucide-react';

const Login: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-purple-primary flex items-center justify-center mb-4">
            <Wallet className="text-white w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold">Access VaultNG</h1>
          <p className="text-text-muted text-sm">Enter your credentials to manage your portfolio.</p>
        </div>

        <div className="space-y-4">
          <Input label="Email Address" type="email" placeholder="name@example.com" />
          <Input label="Password" type="password" placeholder="••••••••" />

          <div className="flex justify-end">
            <button className="text-xs font-bold text-purple-soft hover:text-purple-bright transition-colors uppercase tracking-wider">
              Forgot Password?
            </button>
          </div>

          <Button className="w-full h-12 text-base">Sign In</Button>
        </div>

        <p className="text-center text-sm text-text-muted">
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
