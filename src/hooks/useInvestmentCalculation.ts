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
    let cumulativeLumpsum = 0;
    let lumpsumReturn = 0;
    let sipTilLastYear = 0;

    // Initialize CPI tracking
    let currentCPI = 100;
    const annualInflationRate = (inputs.inflationRate || 0) / 100;
    const monthlyRate = inputs.expectedReturn / 1200;

    for (let year = 1; year <= inputs.investmentPeriod; year++) {
      // Calculate CPI for current year
      currentCPI = year === 1 ? 100 : currentCPI * (1 + annualInflationRate);
      const inflationFactor = currentCPI / 100;

      // Add annual lumpsum at the beginning of each year
      if (inputs.annualLumpsum > 0) {
        cumulativeLumpsum = inputs.annualLumpsum + lumpsumReturn;
        totalInvestment += inputs.annualLumpsum;
        totalCorpus += inputs.annualLumpsum;
      }

      for (let month = 1; month <= 12; month++) {
        let totalMonths = (year - 1) * 12 + month;

        // Calculate SIP returns including step-up
        const sipReturns =
          currentMonthlyInvestment *
          ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) *
          (1 + monthlyRate);

        // Calculate returns on initial investment
        const initialCorpusReturns =
          inputs.initialInvestment * Math.pow(1 + monthlyRate, totalMonths);

        // Calculate returns on lumpsum investments
        lumpsumReturn = cumulativeLumpsum * Math.pow(1 + monthlyRate, month); // Only for months in current year

        // Update total investment (cumulative)
        totalInvestment =
          inputs.initialInvestment +
          sipTilLastYear +
          currentMonthlyInvestment * month +
          inputs.annualLumpsum * year;

        // Update total corpus
        totalCorpus = initialCorpusReturns + sipReturns + lumpsumReturn;

        // Handle withdrawals
        if (inputs.withdrawalAmount > 0) {
          let currentWithdrawal = 0;
          if (inputs.withdrawalFrequency === "monthly") {
            currentWithdrawal = inputs.withdrawalAmount;
            totalCorpus -= currentWithdrawal;
            totalWithdrawal += currentWithdrawal;
          } else if (inputs.withdrawalFrequency === "yearly" && month === 12) {
            currentWithdrawal = inputs.withdrawalAmount;
            totalCorpus -= currentWithdrawal;
            totalWithdrawal += currentWithdrawal;
          }
        }

        // Calculate inflation-adjusted values
        const inflationAdjustedCorpus = totalCorpus / inflationFactor;
        const purchasingPowerChange = ((100 - currentCPI) / 100) * 100;

        yearlyInvestment.push({
          year,
          month,
          totalInvestment,
          corpus: totalCorpus,
          returns: totalCorpus - totalInvestment,
          inflationAdjustedCorpus,
          purchasingPowerChange,
          currentCPI,
        });
      }

      // Apply step-up for next year
      sipTilLastYear += currentMonthlyInvestment * 12;
      currentMonthlyInvestment *= 1 + inputs.stepUpPercentage / 100;
    }

    return yearlyInvestment;
  };

  return useMemo(calculateInvestmentReturns, [inputs]);
};
