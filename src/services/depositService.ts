import api from '../lib/api';

export interface DepositRequest {
  id: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVERSED';
  reference: string;
  customerReference?: string | null;
  proofImageUrl?: string | null;
  method: string;
  createdAt: string;
}

export const depositService = {
  createDeposit: async (params: {
    amount: number;
    method: string;
    proofFile: File;
    customerReference?: string;
  }): Promise<DepositRequest> => {
    const formData = new FormData();
    formData.append('amount', params.amount.toString());
    formData.append('method', params.method);
    formData.append('proof', params.proofFile);
    if (params.customerReference) {
      formData.append('customerReference', params.customerReference);
    }

    const response = await api.post('/deposits', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getDepositHistory: async (): Promise<DepositRequest[]> => {
    const response = await api.get('/deposits/me');
    return response.data;
  }
};
