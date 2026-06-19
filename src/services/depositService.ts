import api from '../lib/api';

export interface DepositRequest {
  id: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reference: string;
  createdAt: string;
}

export const depositService = {
  createDeposit: async (amount: number): Promise<DepositRequest> => {
    const response = await api.post('/deposits', { amount });
    return response.data;
  },

  getDepositHistory: async (): Promise<DepositRequest[]> => {
    const response = await api.get('/deposits/me');
    return response.data;
  }
};
