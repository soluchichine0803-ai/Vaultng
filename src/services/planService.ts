import api from '../lib/api';
import type { InvestmentPlan } from '../types/plan';

export const planService = {
  getPlans: async (): Promise<InvestmentPlan[]> => {
    const response = await api.get('/plans');
    return response.data.data;
  },

  getAllPlans: async (): Promise<InvestmentPlan[]> => {
    const response = await api.get('/plans/all');
    return response.data.data;
  },

  getPlanById: async (id: string): Promise<InvestmentPlan> => {
    const response = await api.get(`/plans/${id}`);
    return response.data.data;
  },
};
