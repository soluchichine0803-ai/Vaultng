import api from '../lib/api';

export const withdrawalService = {
  getWithdrawalConfig: async () => {
    const response = await api.get('/withdrawals/config');
    return response.data.data;
  },

  getBanks: async () => {
    const response = await api.get('/withdrawals/banks');
    return response.data.data;
  },

  resolveAccount: async (accountNumber: string, bankCode: string) => {
    const response = await api.post('/withdrawals/resolve', { accountNumber, bankCode });
    return response.data.data;
  },

  createWithdrawal: async (data: {
    amount: number;
    bankCode: string;
    accountNumber: string;
  }) => {
    const response = await api.post('/withdrawals', data);
    return response.data;
  },

  getMyWithdrawals: async () => {
    const response = await api.get('/withdrawals/me');
    return response.data.data;
  },
};
