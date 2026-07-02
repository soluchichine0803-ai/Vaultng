import React, { useState, useEffect } from 'react';
import { Bell, User, Wallet } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import AnimatedCounter from '../ui/AnimatedCounter';
import { useAuthStore } from '../../store/authStore';
import NotificationPanel from './NotificationPanel';
import { notificationService, type Notification } from '../../services/notificationService';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const handleNotificationClick = () => {
    if (window.innerWidth < 1024) {
      navigate('/notifications');
    } else {
      setIsNotificationsOpen(!isNotificationsOpen);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background-primary/60 backdrop-blur-xl border-b border-white/[0.03] h-14 lg:h-16">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-purple-primary flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.3)]">
            <Wallet className="text-white w-4 h-4 lg:w-5 lg:h-5" />
          </div>
          <span className="text-base lg:text-lg font-bold tracking-tight text-text-primary">
            Vault<span className="text-purple-primary">NG</span>
          </span>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1 bg-white/[0.03] rounded-full border border-white/[0.05]">
            <span className="text-[9px] lg:text-[10px] uppercase font-black text-text-muted tracking-tighter">Vault</span>
            <AnimatedCounter
              value={user?.availableBalance || 0}
              currency="₦"
              className="text-xs lg:text-sm font-bold text-purple-soft"
            />
          </div>

          <div className="relative">
            <button
              onClick={handleNotificationClick}
              className={`p-2 relative rounded-xl transition-colors ${
                isNotificationsOpen ? 'bg-white/[0.08] text-purple-soft' : 'hover:bg-white/[0.05] text-text-secondary'
              }`}
            >
              <Bell size={18} className="lg:w-5 lg:h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-purple-primary rounded-full ring-2 ring-background-primary shadow-[0_0_8px_rgba(124,58,237,0.8)]"></span>
              )}
            </button>

            <div className="hidden lg:block">
              <NotificationPanel
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                notifications={notifications}
                onRefresh={fetchNotifications}
              />
            </div>
          </div>

          <button
            onClick={() => navigate('/profile')}
            className="p-0.5 rounded-xl border border-white/[0.05] hover:border-purple-primary/30 transition-colors"
          >
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-white/[0.03] flex items-center justify-center">
              <User className="text-text-secondary w-4 h-4 lg:w-5 lg:h-5" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
