import api from '../lib/api';

export interface AdminDashboardStats {
  pendingDeposits: number;
  pendingWithdrawals: number;
  depositsTodayAmount: number;
  withdrawalsTodayAmount: number;
  recentActivity: Array<{
    id: string;
    adminId: string;
    action: string;
    targetUser: string | null;
    details: string;
    createdAt: string;
    admin?: { username: string; email: string };
    target?: { username: string; email: string };
  }>;
}

export interface AdminUser {
  username: string;
  email: string;
}

export interface AdminDeposit {
  id: string;
  userId: string;
  amount: string;
  method: string;
  reference: string;
  customerReference: string | null;
  proofImageUrl: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FAILED' | 'REVERSED';
  rejectionReason: string | null;
  reviewDate: string | null;
  createdAt: string;
  user: AdminUser;
}

export interface AdminWithdrawal {
  id: string;
  userId: string;
  amount: string;
  bankName: string;
  bankCode: string | null;
  accountNumber: string;
  accountName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FAILED' | 'PAID';
  isLargeWithdrawal: boolean;
  rejectionReason: string | null;
  completionDate: string | null;
  createdAt: string;
  user: AdminUser;
}

export interface AdminTimelineItem {
  id: string;
  userId: string;
  user: AdminUser;
  amount: number;
  type: 'Transaction' | 'Deposit' | 'Withdrawal';
  subType: string;
  description: string;
  reference: string | null;
  status: string;
  createdAt: string;
}

export const adminService = {
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const response = await api.get('/admin/dashboard-stats');
    return response.data.data;
  },

  getDeposits: async (): Promise<AdminDeposit[]> => {
    const response = await api.get('/admin/deposits');
    return response.data.data;
  },

  getWithdrawals: async (): Promise<AdminWithdrawal[]> => {
    const response = await api.get('/admin/withdrawals');
    return response.data.data;
  },

  getTransactionsTimeline: async (search?: string, type?: string): Promise<AdminTimelineItem[]> => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (type) params.type = type;
    const response = await api.get('/admin/transactions', { params });
    return response.data.data;
  },

  approveDeposit: async (id: string): Promise<void> => {
    await api.put(`/admin/deposits/${id}/approve`);
  },

  reverseDeposit: async (id: string, rejectionReason: string): Promise<void> => {
    await api.put(`/admin/deposits/${id}/reverse`, { rejectionReason });
  },

  payWithdrawal: async (id: string): Promise<void> => {
    await api.put(`/admin/withdrawals/${id}/pay`);
  },

  failWithdrawal: async (id: string, rejectionReason: string): Promise<void> => {
    await api.put(`/admin/withdrawals/${id}/fail`, { rejectionReason });
  }
};
