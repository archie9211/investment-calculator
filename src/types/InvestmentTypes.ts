// src/types/InvestmentTypes.ts

export type WithdrawalFrequency = "monthly" | "yearly";
export type LumpsumFrequency =
  | "never"
  | "monthly"
  | "quarterly"
  | "half-yearly"
  | "yearly";
export type StepUpType = "percentage" | "fixed";
export type WithdrawalType = "fixed" | "percentage";

export interface VariableReturnEntry {
  yearEnd: number; // Apply this rate up to the end of this year
  rate: number; // Annual rate for this period
}

export interface InvestmentInputs {
  initialInvestment: number;
  monthlyInvestment: number;
  investmentPeriod: number; // In years
  expectedReturn: number; // Default annual return % (used if variable returns are off)

  // --- Optional / Advanced ---
  // Step-Up
  stepUpEnabled?: boolean; // Flag to enable/disable step-up section
  stepUpType?: StepUpType;
  stepUpValue?: number; // Percentage or fixed amount based on type

  // Lumpsum
  lumpsumEnabled?: boolean;
  lumpsumAmount?: number;
  lumpsumFrequency?: LumpsumFrequency;

  // Withdrawal (SWP)
  withdrawalEnabled?: boolean;
  withdrawalAmount?: number; // Fixed amount or percentage basis points (e.g., 0.5 for 0.5%)
  withdrawalFrequency?: WithdrawalFrequency;
  withdrawalStartYear?: number; // Start withdrawals after this many years
  withdrawalType?: WithdrawalType; // Withdraw fixed amount or % of corpus
  withdrawalInflationAdjusted?: boolean; // Increase fixed withdrawal amount by inflation?

  // Inflation
  inflationEnabled?: boolean;
  inflationRate?: number; // Annual inflation %

  // Variable Returns
  variableReturnEnabled?: boolean;
  variableReturns?: VariableReturnEntry[]; // Array defining rates for periods

  // Costs & Taxes
  taxEnabled?: boolean;
  taxRate?: number; // Simple flat tax rate % on gains during withdrawal
  expenseRatioEnabled?: boolean;
  expenseRatio?: number; // Annual expense ratio %

  // Goal Planning (Input side - calculation might be separate)
  goalAmount?: number;
}

export interface MonthlyProjection {
  year: number;
  month: number;
  totalInvestment: number; // Cumulative investment amount
  corpus: number; // Corpus value at the end of the month
  returns: number; // Cumulative returns (Corpus - Total Investment)
  monthlyGrowth: number; // Growth earned in this month
  withdrawalThisMonth: number; // Amount withdrawn this month (gross)
  taxPaidThisMonth: number; // Tax paid on withdrawal gains this month
  expenseDeductedThisMonth: number; // Expense ratio deduction this month
  inflationAdjustedCorpus: number; // Corpus value adjusted for inflation
  purchasingPowerChange: number; // % change in purchasing power vs start
  currentCPI: number; // Consumer Price Index for the period
}

// Define a type for the hook's return value
export interface CalculationResult {
  projections: MonthlyProjection[];
  finalMetrics: {
    totalInvestment: number;
    totalReturns: number;
    finalCorpus: number;
    finalInflationAdjustedCorpus: number;
    finalPurchasingPowerChange: number;
    finalCPI: number;
    cagr: number | null; // Compound Annual Growth Rate
    realRateOfReturn: number | null; // CAGR adjusted for inflation
    totalWithdrawalsGross: number;
    totalTaxPaid: number;
    totalExpensesPaid: number;
  };
}

// For the optional parameters UI in InvestmentCalculator
export interface OptionalParameter {
  id: keyof InvestmentInputs | string; // Link to input flags like 'stepUpEnabled' or custom IDs
  label: string;
  component: React.FC<{
    inputs: InvestmentInputs;
    updateInput: (updates: Partial<InvestmentInputs>) => void;
  }>;
  dependsOn?: keyof InvestmentInputs; // If this parameter requires another to be enabled (e.g., tax needs withdrawal)
}
