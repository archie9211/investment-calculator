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

export interface MonthlyProjection {
  year: number;
  month: number;
  totalInvestment: number; // Cumulative cash invested up to the end of this month
  corpus: number; // Corpus value at the end of this month
  returns: number; // Total returns (Corpus - Total Investment) at the end of this month
  monthlyGrowth: number; // Growth earned *during* this month
  withdrawalThisMonth: number; // Amount withdrawn *during* this month
  inflationAdjustedCorpus: number; // Corpus value adjusted for inflation at the end of this month
  purchasingPowerChange: number; // Percentage change in purchasing power relative to the start
  currentCPI: number; // CPI value for this month's year
}

export interface OptionalParameter {
  id: string;
  label: string;
  component: React.ComponentType<any>;
}
