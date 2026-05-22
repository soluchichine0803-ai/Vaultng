import React from 'react';
import { Bell, User, Wallet } from 'lucide-react';
import AnimatedCounter from '../ui/AnimatedCounter';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 w-full bg-background-primary/80 backdrop-blur-lg border-b border-purple-primary/10 h-16">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-primary flex items-center justify-center">
            <Wallet className="text-white w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-text-primary">
            Vault<span className="text-purple-primary">NG</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-card rounded-full border border-purple-primary/10">
            <span className="text-[10px] uppercase font-bold text-text-muted">Balance</span>
            <AnimatedCounter
              value={12450.75}
              currency="₦"
              className="text-sm font-bold text-purple-soft"
            />
          </div>

          <button className="p-2 relative rounded-xl hover:bg-purple-primary/10 text-text-secondary transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-purple-primary rounded-full border-2 border-background-primary"></span>
          </button>

          <button className="p-1 rounded-xl border border-purple-primary/20 hover:border-purple-primary/40 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-card-elevated flex items-center justify-center">
              <User className="text-text-secondary w-5 h-5" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
