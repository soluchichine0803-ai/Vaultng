import api from '../lib/api';

export const withdrawalService = {
  createWithdrawal: async (data: {
    amount: number;
    bankName: string;
    accountNumber: string;
    accountName: string;
    bankCode?: string;
  }) => {
    const response = await api.post('/withdrawals', data);
    return response.data;
  },

  getMyWithdrawals: async () => {
    const response = await api.get('/withdrawals/me');
    return response.data.data;
  },

  getBanks: async (): Promise<{ name: string; code: string }[]> => {
    const response = await api.get('/withdrawals/banks');
    return response.data.data;
  },

  resolveAccount: async (accountNumber: string, bankCode: string): Promise<{ accountNumber: string; accountName: string }> => {
    const response = await api.get('/withdrawals/resolve-account', {
      params: { accountNumber, bankCode },
    });
    return response.data.data;
  },

  getConfig: async (): Promise<{ devBypassActive: boolean }> => {
    const response = await api.get('/withdrawals/config');
    return response.data.data;
  },
};
