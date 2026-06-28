import api from '../lib/api';

export const withdrawalService = {
  createWithdrawal: async (data: {
    amount: number;
    bankName: string;
    accountNumber: string;
    accountName: string;
  }) => {
    const response = await api.post('/api/withdrawals', data);
    return response.data;
  },

  getMyWithdrawals: async () => {
    const response = await api.get('/api/withdrawals/me');
    return response.data.data;
  },
};
