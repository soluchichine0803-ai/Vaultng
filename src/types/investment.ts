export type InvestmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Investment {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  expectedProfit: number;
  maturityDate: string;
  status: InvestmentStatus;
  createdAt: string;
  updatedAt: string;
  plan?: {
    name: string;
    roiPercent: number;
    durationHours: number;
  };
}

export interface CreateInvestmentData {
  planId: string;
  amount: number;
}
