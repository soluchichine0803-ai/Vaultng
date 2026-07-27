import api from '../lib/api';

export interface DepositRequest {
  id: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reference: string;
  createdAt: string;
}

export interface PaymentInitializationResponse {
  authorizationUrl: string;
  reference: string;
  accessCode: string;
}

export interface PaymentVerificationResponse {
  status: string;
  message: string;
  data: {
    reference: string;
    amount: number;
    status: string;
  };
}

export const depositService = {
  createDeposit: async (amount: number): Promise<DepositRequest> => {
    const response = await api.post('/deposits', { amount });
    return response.data;
  },

  getDepositHistory: async (): Promise<DepositRequest[]> => {
    const response = await api.get('/deposits/me');
    return response.data;
  },

  initializePayment: async (amount: number): Promise<PaymentInitializationResponse> => {
    const response = await api.post('/payments/initialize', { amount });
    return response.data;
  },

  verifyPayment: async (reference: string): Promise<PaymentVerificationResponse> => {
    const response = await api.get(`/payments/verify/${encodeURIComponent(reference)}`);
    return response.data;
  }
};
