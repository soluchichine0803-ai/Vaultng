import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Clock, X } from 'lucide-react';
import { type Notification, notificationService } from '../../services/notificationService';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onRefresh: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, notifications, onRefresh }) => {
  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      onRefresh();
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      onRefresh();
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-50 lg:hidden bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-80 lg:w-96 z-50"
          >
            <Card className="border-white/[0.08] shadow-2xl overflow-hidden flex flex-col max-h-[500px]">
              <div className="p-4 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-purple-primary" />
                  <h3 className="text-sm font-bold">Notifications</h3>
                </div>
                <div className="flex items-center gap-2">
                  {notifications.some(n => !n.read) && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-black uppercase tracking-widest text-purple-soft hover:text-white transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                  <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg text-text-muted">
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto p-2 space-y-1">
                {notifications.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
                    <Bell size={32} className="mb-2 text-text-muted" />
                    <p className="text-xs font-bold uppercase tracking-tighter text-text-muted">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => !notification.read && handleMarkRead(notification.id)}
                      className={`p-3 rounded-xl transition-all cursor-pointer group relative ${
                        notification.read ? 'opacity-60 grayscale-[0.5]' : 'bg-white/[0.03] border border-white/[0.05] shadow-sm'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notification.read ? 'bg-white/10' : 'bg-purple-primary shadow-[0_0_8px_rgba(124,58,237,0.8)]'}`} />
                        <div className="space-y-1 pr-4">
                          <h4 className={`text-xs font-bold tracking-tight ${notification.read ? 'text-text-secondary' : 'text-white'}`}>
                            {notification.title}
                          </h4>
                          <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-1.5 pt-1 text-[9px] font-black uppercase tracking-tighter text-text-muted/60">
                            <Clock size={10} />
                            <span>{new Date(notification.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-3 border-t border-white/[0.05] bg-white/[0.01]">
                   <Button variant="ghost" size="sm" className="w-full text-[10px] font-black h-9" onClick={onClose}>
                      Dismiss Panel
                   </Button>
                </div>
              )}
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
