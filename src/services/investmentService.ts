import api from '../lib/api';
import type { Investment, CreateInvestmentData } from '../types/investment';

export const investmentService = {
  getInvestments: async (): Promise<Investment[]> => {
    const response = await api.get('/investments/me');
    return response.data.data;
  },

  createInvestment: async (data: CreateInvestmentData): Promise<Investment> => {
    const response = await api.post('/investments', data);
    return response.data.data;
  },
};
