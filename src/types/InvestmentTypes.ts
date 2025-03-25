// types/InvestmentTypes.ts
export interface InvestmentInputs {
  monthlyInvestment: number;
  stepUpPercentage: number;
  initialInvestment: number;
  expectedReturn: number;
  investmentPeriod: number;
  // compoundingFrequency: 'monthly' | 'yearly';
  annualLumpsum: number;
  withdrawalAmount: number;
  withdrawalFrequency: "monthly" | "yearly";
  inflationRate: number;
}

export interface YearlyProjection {
  year: number;
  month: number;
  totalInvestment: number;
  corpus: number;
  returns: number;
  inflationAdjustedCorpus: number;
}

export interface OptionalParameter {
  id: string;
  label: string;
  component: React.ComponentType<any>;
}
