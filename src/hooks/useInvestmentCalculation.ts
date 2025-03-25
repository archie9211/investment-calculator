// hooks/useInvestmentCalculation.ts
import { useMemo } from "react";
import { InvestmentInputs, YearlyProjection } from "../types/InvestmentTypes";

export const useInvestmentCalculation = (inputs: InvestmentInputs) => {
  const calculateInvestmentReturns = (): YearlyProjection[] => {
    let totalInvestment = inputs.initialInvestment;
    let currentMonthlyInvestment = inputs.monthlyInvestment;
    let yearlyInvestment: YearlyProjection[] = [];
    let totalCorpus = inputs.initialInvestment;

    for (let year = 1; year <= inputs.investmentPeriod; year++) {
      const monthlyRate = inputs.expectedReturn / 1200; // 12% yearly = 1% monthly
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
          if (inputs.withdrawalFrequency === "monthly") {
            totalCorpus -= inputs.withdrawalAmount;
          }
        }

        const inflationFactor = Math.pow(
          1 + (inputs.inflationRate || 0) / 100,
          inputs.investmentPeriod - year + 1
        );
        const inflationAdjustedCorpus = totalCorpus / inflationFactor;

        // Store yearly data
        yearlyInvestment.push({
          year,
          month,
          totalInvestment,
          corpus: totalCorpus,
          returns: totalCorpus - totalInvestment,
          inflationAdjustedCorpus,
        });
      }
      if (inputs.withdrawalAmount > 0) {
        if (inputs.withdrawalFrequency === "yearly") {
          totalCorpus -= inputs.withdrawalAmount;
        }
      }

      // Apply step-up for next year
      currentMonthlyInvestment *= 1 + inputs.stepUpPercentage / 100;
    }

    return yearlyInvestment;
  };

  return useMemo(calculateInvestmentReturns, [inputs]);
};
