export interface InvestmentPlan {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  roiPercent: number;
  durationHours: number;
  active: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlanResponse {
  status: string;
  data: InvestmentPlan[];
}

export interface SinglePlanResponse {
  status: string;
  data: InvestmentPlan;
}
