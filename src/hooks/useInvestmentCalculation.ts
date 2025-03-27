// src/hooks/useInvestmentCalculation.ts
import { useMemo } from "react";
import {
  InvestmentInputs,
  MonthlyProjection,
  CalculationResult,
  VariableReturnEntry,
} from "../types/InvestmentTypes";

const calculateCAGR = (
  endingValue: number,
  beginningValue: number,
  periods: number
): number | null => {
  if (beginningValue <= 0 || endingValue <= 0 || periods <= 0) {
    return null; // Cannot calculate CAGR if values are non-positive or period is zero/negative
  }
  return (Math.pow(endingValue / beginningValue, 1 / periods) - 1) * 100;
};

// Helper to get the applicable rate for a given year from variable returns array
const getApplicableRate = (
  year: number,
  variableReturns: VariableReturnEntry[] | undefined,
  defaultRate: number
): number => {
  if (variableReturns && variableReturns.length > 0) {
    // Sort by yearEnd just in case they are not ordered
    const sortedReturns = [...variableReturns].sort(
      (a, b) => a.yearEnd - b.yearEnd
    );
    for (const entry of sortedReturns) {
      if (year <= entry.yearEnd) {
        return entry.rate;
      }
    }
    // If year is beyond the last specified entry, use the last entry's rate
    return sortedReturns[sortedReturns.length - 1]?.rate ?? defaultRate;
  }
  return defaultRate;
};

export const useInvestmentCalculation = (
  inputs: InvestmentInputs
): CalculationResult => {
  const calculateInvestmentReturns = (): CalculationResult => {
    const monthlyProjections: MonthlyProjection[] = [];

    // --- Input Validation / Defaults ---
    const initialInvestment = inputs.initialInvestment || 0;
    const monthlyInvestment = inputs.monthlyInvestment || 0;
    const investmentPeriod = inputs.investmentPeriod || 0;
    const defaultExpectedReturn = inputs.expectedReturn || 0;
    const inflationRate =
      (inputs.inflationEnabled ? inputs.inflationRate : 0) || 0;
    const taxRate = (inputs.taxEnabled ? inputs.taxRate : 0) || 0;
    const expenseRatio =
      (inputs.expenseRatioEnabled ? inputs.expenseRatio : 0) || 0;

    // Lumpsum
    const lumpsumAmount =
      (inputs.lumpsumEnabled ? inputs.lumpsumAmount : 0) || 0;
    const lumpsumFrequency = inputs.lumpsumEnabled
      ? inputs.lumpsumFrequency
      : "never";

    // Step-Up
    const stepUpEnabled = inputs.stepUpEnabled || false;
    const stepUpType = inputs.stepUpType || "percentage";
    const stepUpValue = inputs.stepUpValue || 0; // % or amount

    // Withdrawal
    const withdrawalEnabled = inputs.withdrawalEnabled || false;
    const withdrawalAmountInput = inputs.withdrawalAmount || 0;
    const withdrawalFrequency = inputs.withdrawalFrequency || "yearly";
    const withdrawalStartYear = inputs.withdrawalStartYear || 0;
    const withdrawalType = inputs.withdrawalType || "fixed";
    const withdrawalInflationAdjusted =
      inputs.withdrawalInflationAdjusted || false;

    // Variable Returns
    const variableReturnEnabled = inputs.variableReturnEnabled || false;
    const variableReturns = inputs.variableReturns;

    // --- Pre-calculate Rates ---
    const annualInflationRate = inflationRate / 100;
    const monthlyExpenseRate = expenseRatio / 1200; // Monthly expense ratio decimal
    const taxRateDecimal = taxRate / 100;

    // --- Initialize Running Totals ---
    let currentCorpus = initialInvestment;
    let totalInvested = initialInvestment;
    let totalWithdrawalGross = 0; // Cumulative gross withdrawals
    let totalTaxPaid = 0; // Cumulative tax paid
    let totalExpensesPaid = 0; // Cumulative expenses paid
    let currentMonthlyInvestment = monthlyInvestment;
    let currentCPI = 100; // Base CPI
    let currentFixedWithdrawalAmount = withdrawalAmountInput; // For inflation adjustment

    // --- Simulation Loop ---
    for (let year = 1; year <= investmentPeriod; year++) {
      // --- Determine Rates for the Current Year ---
      const currentAnnualRate = variableReturnEnabled
        ? getApplicableRate(year, variableReturns, defaultExpectedReturn)
        : defaultExpectedReturn;
      const monthlyRate = currentAnnualRate / 1200; // Monthly interest rate

      // Update CPI for the *start* of the current year (inflation impacts value from previous year)
      if (year > 1) {
        currentCPI *= 1 + annualInflationRate;
        // Adjust fixed withdrawal amount for inflation if enabled (at start of year)
        if (withdrawalInflationAdjusted && withdrawalType === "fixed") {
          currentFixedWithdrawalAmount *= 1 + annualInflationRate;
        }
      }
      const inflationFactor = currentCPI / 100;

      // --- Handle Annual Step-Up (Applies from this year forward) ---
      // Note: Step-up calculation moved here to affect the *first* month's investment of the year
      if (year > 1 && stepUpEnabled && stepUpValue > 0) {
        if (stepUpType === "percentage") {
          currentMonthlyInvestment *= 1 + stepUpValue / 100;
        } else {
          // Fixed amount
          currentMonthlyInvestment += stepUpValue;
        }
      }

      for (let month = 1; month <= 12; month++) {
        // const absoluteMonth = (year - 1) * 12 + month;

        // --- Investments for the Current Month (Beginning of Month) ---
        let investedThisMonth = 0;

        // Monthly SIP
        if (currentMonthlyInvestment > 0) {
          currentCorpus += currentMonthlyInvestment;
          totalInvested += currentMonthlyInvestment;
          investedThisMonth += currentMonthlyInvestment;
        }

        // Lumpsum based on frequency
        let isLumpsumMonth = false;
        if (lumpsumAmount > 0) {
          switch (lumpsumFrequency) {
            case "monthly":
              isLumpsumMonth = true;
              break;
            case "quarterly":
              isLumpsumMonth = month % 3 === 1;
              break; // Start of Q1, Q2, Q3, Q4
            case "half-yearly":
              isLumpsumMonth = month % 6 === 1;
              break; // Start of H1, H2
            case "yearly":
              isLumpsumMonth = month === 1;
              break; // Start of year
            default:
              isLumpsumMonth = false;
          }
        }

        if (isLumpsumMonth) {
          currentCorpus += lumpsumAmount;
          totalInvested += lumpsumAmount;
          investedThisMonth += lumpsumAmount; // Note: Maybe track lumpsum separately? For now, add to total.
        }

        // --- Calculate Growth for the Current Month ---
        // Growth happens on the corpus *after* investments for the month are added
        const monthlyGrowth = currentCorpus * monthlyRate;
        currentCorpus += monthlyGrowth;

        // --- Calculate and Deduct Expenses (End of Month) ---
        let expenseDeductedThisMonth = 0;
        if (expenseRatio > 0) {
          expenseDeductedThisMonth = currentCorpus * monthlyExpenseRate;
          // Ensure expense doesn't make corpus negative (unlikely but safe)
          expenseDeductedThisMonth = Math.min(
            expenseDeductedThisMonth,
            currentCorpus
          );
          currentCorpus -= expenseDeductedThisMonth;
          totalExpensesPaid += expenseDeductedThisMonth;
        }

        // --- Handle Withdrawals (End of Month) ---
        let withdrawalThisMonth = 0;
        let taxPaidThisMonth = 0;
        if (withdrawalEnabled && year >= withdrawalStartYear) {
          let withdrawalBasis = 0;
          if (withdrawalType === "fixed") {
            withdrawalBasis = currentFixedWithdrawalAmount; // Already inflation-adjusted if needed
          } else {
            // Percentage based
            // withdrawalAmountInput is % (e.g., 0.5 for 0.5%). Convert to decimal.
            withdrawalBasis = currentCorpus * (withdrawalAmountInput / 100);
          }

          // Determine if withdrawal occurs this month based on frequency
          let shouldWithdraw = false;
          if (withdrawalFrequency === "monthly") {
            shouldWithdraw = true;
          } else if (withdrawalFrequency === "yearly" && month === 12) {
            shouldWithdraw = true;
          }

          if (shouldWithdraw && withdrawalBasis > 0) {
            // Calculate Gross Withdrawal
            withdrawalThisMonth = Math.min(withdrawalBasis, currentCorpus); // Cannot withdraw more than available

            // --- Calculate Tax on Gains Withdrawn (Simplified) ---
            if (taxRateDecimal > 0 && withdrawalThisMonth > 0) {
              const corpusBeforeWithdrawal = currentCorpus; // Includes growth, excludes withdrawal
              const currentReturns = Math.max(
                0,
                corpusBeforeWithdrawal - totalInvested
              ); // Ensure returns aren't negative
              const gainRatio =
                corpusBeforeWithdrawal > 0
                  ? currentReturns / corpusBeforeWithdrawal
                  : 0;
              const gainInWithdrawal = withdrawalThisMonth * gainRatio;
              taxPaidThisMonth = gainInWithdrawal * taxRateDecimal;

              // Ensure tax doesn't exceed withdrawal or remaining corpus
              taxPaidThisMonth = Math.min(
                taxPaidThisMonth,
                withdrawalThisMonth
              );
              taxPaidThisMonth = Math.min(
                taxPaidThisMonth,
                currentCorpus - withdrawalThisMonth
              ); // Tax comes from remaining corpus after withdrawal amount is earmarked
            }

            // Apply Net Withdrawal & Tax
            currentCorpus -= withdrawalThisMonth; // Deduct gross withdrawal
            currentCorpus -= taxPaidThisMonth; // Deduct tax
            totalWithdrawalGross += withdrawalThisMonth;
            totalTaxPaid += taxPaidThisMonth;
          }
        }

        // --- Calculate Metrics for the End of the Month ---
        // Ensure corpus doesn't fall below zero due to rounding or heavy withdrawals/costs
        currentCorpus = Math.max(0, currentCorpus);

        const returns = currentCorpus - totalInvested;
        const inflationAdjustedCorpus = currentCorpus / inflationFactor;
        const purchasingPowerChange = (1 / inflationFactor - 1) * 100;

        // Store monthly results
        monthlyProjections.push({
          year,
          month,
          totalInvestment: totalInvested,
          corpus: currentCorpus,
          returns: returns,
          monthlyGrowth: monthlyGrowth,
          withdrawalThisMonth: withdrawalThisMonth, // Gross withdrawal
          taxPaidThisMonth: taxPaidThisMonth,
          expenseDeductedThisMonth: expenseDeductedThisMonth,
          inflationAdjustedCorpus: inflationAdjustedCorpus,
          purchasingPowerChange: purchasingPowerChange,
          currentCPI: currentCPI,
        });

        // Safety break if corpus becomes negative (shouldn't happen with checks)
        if (currentCorpus < 0) {
          console.warn("Corpus became negative. Stopping simulation.");
          break;
        }
      } // --- End of Month Loop ---

      // Break outer loop if corpus went negative
      if (currentCorpus < 0) {
        break;
      }

      // Note: Step-up is now applied at the START of the next year's loop.
    } // --- End of Year Loop ---

    // --- Final Calculations ---
    const finalProjection = monthlyProjections[monthlyProjections.length - 1];
    const finalCorpus = finalProjection?.corpus ?? initialInvestment;
    const finalTotalInvestment =
      finalProjection?.totalInvestment ?? initialInvestment;
    const finalReturns = finalProjection?.returns ?? 0;
    const finalInflationAdjustedCorpus =
      finalProjection?.inflationAdjustedCorpus ?? initialInvestment;
    const finalPurchasingPowerChange =
      finalProjection?.purchasingPowerChange ?? 0;
    const finalCPI = finalProjection?.currentCPI ?? 100;

    // Calculate CAGR (using total invested as a proxy for beginning value - simplistic but common)
    // A more accurate CAGR would need present value of all cash flows.
    const cagr = calculateCAGR(finalCorpus, totalInvested, investmentPeriod);

    // Calculate Real Rate of Return
    let realRateOfReturn: number | null = null;
    if (cagr !== null) {
      const avgAnnualInflation =
        Math.pow(finalCPI / 100, 1 / investmentPeriod) - 1;
      if (1 + avgAnnualInflation !== 0) {
        realRateOfReturn =
          ((1 + cagr / 100) / (1 + avgAnnualInflation) - 1) * 100;
      }
    }

    return {
      projections: monthlyProjections,
      finalMetrics: {
        totalInvestment: finalTotalInvestment,
        totalReturns: finalReturns,
        finalCorpus: finalCorpus,
        finalInflationAdjustedCorpus: finalInflationAdjustedCorpus,
        finalPurchasingPowerChange: finalPurchasingPowerChange,
        finalCPI: finalCPI,
        cagr: cagr,
        realRateOfReturn: realRateOfReturn,
        totalWithdrawalsGross: totalWithdrawalGross,
        totalTaxPaid: totalTaxPaid,
        totalExpensesPaid: totalExpensesPaid,
      },
    };
  };

  // Update dependency array to include all relevant input fields
  // This ensures recalculation when any input potentially affecting the result changes
  const dependencyArray = [
    inputs.initialInvestment,
    inputs.monthlyInvestment,
    inputs.investmentPeriod,
    inputs.expectedReturn,
    inputs.inflationEnabled,
    inputs.inflationRate,
    inputs.taxEnabled,
    inputs.taxRate,
    inputs.expenseRatioEnabled,
    inputs.expenseRatio,
    inputs.lumpsumEnabled,
    inputs.lumpsumAmount,
    inputs.lumpsumFrequency,
    inputs.stepUpEnabled,
    inputs.stepUpType,
    inputs.stepUpValue,
    inputs.withdrawalEnabled,
    inputs.withdrawalAmount,
    inputs.withdrawalFrequency,
    inputs.withdrawalStartYear,
    inputs.withdrawalType,
    inputs.withdrawalInflationAdjusted,
    inputs.variableReturnEnabled,
    // Deep comparison isn't feasible for variableReturns array in deps,
    // so use JSON.stringify or just rely on variableReturnEnabled toggle.
    // Using stringify might be inefficient for large arrays.
    // Let's rely on the enable flag + other inputs for now. A better solution
    // might involve memoizing the variableReturns array itself if it changes frequently.
    // JSON.stringify(inputs.variableReturns) // Optional: Add if needed, but be mindful of performance
  ];

  // useMemo dependency array needs to reflect all inputs used in calculation
  return useMemo(calculateInvestmentReturns, dependencyArray); // eslint-disable-line react-hooks/exhaustive-deps
  // Disabled exhaustive-deps rule because we are manually listing dependencies.
  // If using stringify for variableReturns, add it to the array above.
};
