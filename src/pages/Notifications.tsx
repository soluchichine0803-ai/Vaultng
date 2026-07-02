import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { type Notification, notificationService } from '../services/notificationService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { pageTransition } from '../lib/animations';

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-xl transition-colors lg:hidden">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col gap-0.5 lg:gap-1">
            <h1 className="text-lg lg:text-xl font-bold tracking-tight">Notification Centre</h1>
            <p className="text-text-muted text-[10px] lg:text-xs font-black opacity-60 uppercase tracking-tighter">
              Updates & Activity Alerts
            </p>
          </div>
        </div>
        {notifications.some(n => !n.read) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            className="text-[10px] font-black uppercase tracking-widest text-purple-soft"
          >
            Mark All Read
          </Button>
        )}
      </header>

      <div className="max-w-2xl mx-auto w-full space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
          ))
        ) : notifications.length === 0 ? (
          <Card className="py-20 flex flex-col items-center justify-center text-center space-y-4 border-dashed border-white/10">
            <div className="w-16 h-16 rounded-full bg-white/[0.02] flex items-center justify-center">
              <Bell size={32} className="text-text-muted opacity-20" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-text-primary">No notifications yet</p>
              <p className="text-xs text-text-muted max-w-[200px]">We'll alert you here when something important happens.</p>
            </div>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              onClick={() => !notification.read && handleMarkRead(notification.id)}
              className={`p-5 transition-all cursor-pointer relative overflow-hidden group ${
                notification.read ? 'opacity-60' : 'bg-white/[0.03] border-white/[0.08]'
              }`}
            >
              {!notification.read && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-primary shadow-[0_0_15px_rgba(124,58,237,0.5)]" />
              )}
              <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  notification.read ? 'bg-white/5' : 'bg-purple-primary/10'
                }`}>
                  <Bell size={18} className={notification.read ? 'text-text-muted' : 'text-purple-primary'} />
                </div>
                <div className="space-y-1 flex-grow">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className={`text-sm font-bold tracking-tight ${notification.read ? 'text-text-secondary' : 'text-white'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-[10px] font-black uppercase tracking-tighter text-text-muted/40 whitespace-nowrap">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-1.5 pt-2 text-[10px] font-bold text-text-muted/60 uppercase tracking-widest">
                    <Clock size={12} />
                    <span>{new Date(notification.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default Notifications;
