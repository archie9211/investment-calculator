// hooks/useInvestmentCalculation.ts
import { useMemo } from "react";
import { InvestmentInputs, YearlyProjection } from "../types/InvestmentTypes";

export const useInvestmentCalculation = (inputs: InvestmentInputs) => {
  const calculateInvestmentReturns = (): YearlyProjection[] => {
    let totalInvestment = inputs.initialInvestment;
    let currentMonthlyInvestment = inputs.monthlyInvestment;
    let yearlyInvestment: YearlyProjection[] = [];
    let totalCorpus = inputs.initialInvestment;
    let totalWithdrawal = 0;

    // Initialize CPI tracking
    let currentCPI = 100; // Base year CPI
    const annualInflationRate = (inputs.inflationRate || 0) / 100;

    for (let year = 1; year <= inputs.investmentPeriod; year++) {
      const monthlyRate = inputs.expectedReturn / 1200;

      // Calculate CPI for current year
      currentCPI = year === 1 ? 100 : currentCPI * (1 + annualInflationRate);

      // Calculate inflation factor based on CPI change
      const inflationFactor = currentCPI / 100; // Relative to base year

      for (let month = 1; month <= 12; month++) {
        // Calculate monthly SIP returns
        let totalMonths = (year - 1) * 12 + month;
        const sipReturns =
          currentMonthlyInvestment *
          ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) *
          (1 + monthlyRate);

        // Calculate returns on existing corpus
        const corpusReturns =
          inputs.initialInvestment * Math.pow(1 + monthlyRate, totalMonths);

        // Update total investment
        totalInvestment =
          currentMonthlyInvestment * totalMonths + inputs.annualLumpsum;
        // Update corpus
        totalCorpus = corpusReturns + sipReturns;
        // Add annual lumpsum and its returns
        if (inputs.annualLumpsum > 0) {
          totalCorpus +=
            inputs.annualLumpsum * Math.pow(1 + monthlyRate, totalMonths);
        }

        // Handle withdrawals
        if (inputs.withdrawalAmount > 0) {
          let currentWithdrawal = 0;
          if (inputs.withdrawalFrequency === "monthly") {
            currentWithdrawal = inputs.withdrawalAmount;
            totalCorpus -= currentWithdrawal * totalMonths;
          } else if (inputs.withdrawalFrequency === "yearly" && month === 12) {
            currentWithdrawal = inputs.withdrawalAmount;
            totalCorpus -= currentWithdrawal * year;
            totalWithdrawal += currentWithdrawal;
          } else {
            totalCorpus -= totalWithdrawal;
          }
        }

        // Calculate real value (inflation-adjusted) using CPI
        const inflationAdjustedCorpus = totalCorpus / inflationFactor;

        // Calculate purchasing power change
        const purchasingPowerChange = ((100 - currentCPI) / 100) * 100;

        // Store yearly data
        yearlyInvestment.push({
          year,
          month,
          totalInvestment,
          corpus: totalCorpus,
          returns: totalCorpus - totalInvestment,
          inflationAdjustedCorpus,
          purchasingPowerChange, // New field showing purchasing power loss
          currentCPI, // Track CPI progression
        });
      }

      // Apply step-up for next year
      currentMonthlyInvestment *= 1 + inputs.stepUpPercentage / 100;
    }

    return yearlyInvestment;
  };

  return useMemo(calculateInvestmentReturns, [inputs]);
};
