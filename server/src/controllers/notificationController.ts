import { Response } from 'express';
import { NotificationService } from '../services/notificationService';
import { AuthRequest } from '../types/auth';

export class NotificationController {
  static async getMyNotifications(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

      const notifications = await NotificationService.getUserNotifications(userId);
      const unreadCount = await NotificationService.getUnreadCount(userId);

      return res.json({
        status: 'success',
        data: {
          notifications,
          unreadCount,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  static async markAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      if (typeof id !== 'string') return res.status(400).json({ status: 'error', message: 'Invalid ID' });

      await NotificationService.markAsRead(userId, id);

      return res.json({ status: 'success', message: 'Notification marked as read' });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  static async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

      await NotificationService.markAllAsRead(userId);

      return res.json({ status: 'success', message: 'All notifications marked as read' });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }
}
