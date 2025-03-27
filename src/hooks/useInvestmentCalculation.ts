// hooks/useInvestmentCalculation.ts

// hooks/useInvestmentCalculation.ts
import { useMemo } from "react";
import { InvestmentInputs, MonthlyProjection } from "../types/InvestmentTypes"; // Assuming InvestmentInputs is defined correctly

// Define a more accurate type for the output, as it contains monthly data

export const useInvestmentCalculation = (
  inputs: InvestmentInputs
): MonthlyProjection[] => {
  const calculateInvestmentReturns = (): MonthlyProjection[] => {
    const monthlyProjections: MonthlyProjection[] = [];

    // --- Input Validation / Defaults (Good Practice) ---
    const initialInvestment = inputs.initialInvestment || 0;
    const monthlyInvestment = inputs.monthlyInvestment || 0;
    const annualLumpsum = inputs.annualLumpsum || 0;
    const investmentPeriod = inputs.investmentPeriod || 0;
    const expectedReturn = inputs.expectedReturn || 0; // Annual return %
    const stepUpPercentage = inputs.stepUpPercentage || 0; // Annual step-up %
    const inflationRate = inputs.inflationRate || 0; // Annual inflation %
    const withdrawalAmount = inputs.withdrawalAmount || 0;
    const withdrawalFrequency = inputs.withdrawalFrequency;

    // --- Pre-calculate Rates ---
    const monthlyRate = expectedReturn / 1200; // Monthly interest rate (decimal) -> 10% becomes 0.10 / 12
    const annualInflationRate = inflationRate / 100; // Annual inflation rate (decimal)
    const stepUpFactor = 1 + stepUpPercentage / 100; // Factor for yearly step-up

    // --- Initialize Running Totals ---
    let currentCorpus = initialInvestment;
    let totalInvested = initialInvestment;
    let totalWithdrawal = 0; // Cumulative withdrawals over time
    let currentMonthlyInvestment = monthlyInvestment; // SIP amount for the current year
    let currentCPI = 100; // Base CPI

    // --- Simulation Loop ---
    for (let year = 1; year <= investmentPeriod; year++) {
      // Update CPI for the *start* of the current year (except year 1)
      // Apply inflation from the *previous* year to get this year's CPI
      if (year > 1) {
        currentCPI *= 1 + annualInflationRate;
      }
      const inflationFactor = currentCPI / 100; // Inflation factor relative to base year

      // Handle annual lumpsum investment at the *beginning* of the year
      if (annualLumpsum > 0) {
        // Add to corpus *before* monthly calculations start for the year
        currentCorpus += annualLumpsum;
        totalInvested += annualLumpsum;
      }

      for (let month = 1; month <= 12; month++) {
        // --- Investments for the Current Month (at the beginning) ---
        let investedThisMonth = 0;
        if (currentMonthlyInvestment > 0) {
          currentCorpus += currentMonthlyInvestment;
          totalInvested += currentMonthlyInvestment;
          investedThisMonth = currentMonthlyInvestment;
        }
        // Note: Annual lumpsum already added at year start

        // --- Calculate Growth for the Current Month ---
        // Growth happens on the corpus *after* investments for the month are added
        const monthlyGrowth = currentCorpus * monthlyRate;
        currentCorpus += monthlyGrowth;

        // --- Handle Withdrawals for the Current Month (at the end) ---
        let withdrawalThisMonth = 0;
        if (withdrawalAmount > 0) {
          if (withdrawalFrequency === "monthly") {
            withdrawalThisMonth = withdrawalAmount;
          } else if (withdrawalFrequency === "yearly" && month === 12) {
            // Apply yearly withdrawal at the end of the last month of the year
            withdrawalThisMonth = withdrawalAmount;
          }
        }

        // Ensure withdrawal doesn't exceed the available corpus
        withdrawalThisMonth = Math.min(withdrawalThisMonth, currentCorpus);

        // Apply withdrawal
        currentCorpus -= withdrawalThisMonth;
        totalWithdrawal += withdrawalThisMonth; // Track cumulative withdrawals

        // --- Calculate Metrics for the End of the Month ---
        const returns = currentCorpus - totalInvested;
        const inflationAdjustedCorpus = currentCorpus / inflationFactor;
        // Purchasing power change: How much less $1 is worth compared to the start
        const purchasingPowerChange = (1 / inflationFactor - 1) * 100; // e.g., -4.76% if CPI is 105

        // Store monthly results
        monthlyProjections.push({
          year,
          month,
          totalInvestment: totalInvested,
          corpus: currentCorpus,
          returns: returns,
          monthlyGrowth: monthlyGrowth,
          withdrawalThisMonth: withdrawalThisMonth,
          inflationAdjustedCorpus: inflationAdjustedCorpus,
          purchasingPowerChange: purchasingPowerChange,
          currentCPI: currentCPI,
        });
      } // --- End of Month Loop ---

      // Apply step-up for the *next* year's monthly investment
      currentMonthlyInvestment *= stepUpFactor;
    } // --- End of Year Loop ---

    return monthlyProjections;
  };

  // useMemo dependency array remains correct - recalculate only if inputs change
  return useMemo(calculateInvestmentReturns, [inputs]);
};
