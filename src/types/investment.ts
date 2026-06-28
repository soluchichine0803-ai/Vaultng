export type InvestmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Investment {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  expectedProfit: number;
  roiPercentSnapshot: number;
  durationHoursSnapshot: number;
  maturityDate: string;
  nextRoiPayoutAt?: string;
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
  amount: number;
}
