// components/InvestmentCalculator.tsx
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { InvestmentInputs, OptionalParameter } from "../types/InvestmentTypes";
import { useInvestmentCalculation } from "../hooks/useInvestmentCalculation";
import { formatIndianCurrency } from "../utils/formatters";

// Import individual input components
import BasicInputs from "./BasicInputs";
import StepUpInput from "./StepUpInput";
import LumpsumInput from "./LumpsumInput";
import WithdrawalInput from "./WithdrawalInput";
import InflationInput from "./InflationInput";
import Disclaimer from "./Disclaimer";

const InvestmentGrowthChart = React.lazy(
  () => import("./InvestmentGrowthChart")
);
const InvestmentBreakdownChart = React.lazy(
  () => import("./InvestmentBreakdownChart")
);
const CalculationDetails = React.lazy(() => import("./CalculationDetails"));

const InvestmentCalculator: React.FC = () => {
  // Default inputs
  const defaultInputs: InvestmentInputs = {
    monthlyInvestment: 5000,
    stepUpPercentage: 0,
    initialInvestment: 0,
    expectedReturn: 12,
    investmentPeriod: 10,
    // compoundingFrequency: "monthly",
    inflationRate: 0,
    annualLumpsum: 0,
    withdrawalAmount: 0,
    withdrawalFrequency: "yearly",
  };

  // State for inputs
  const [inputs, setInputs] = useState<InvestmentInputs>(defaultInputs);

  // Optional parameters
  const optionalParameters: OptionalParameter[] = [
    {
      id: "stepUp",
      label: "Step-Up Investment",
      component: StepUpInput,
    },
    {
      id: "lumpsum",
      label: "Annual Lumpsum",
      component: LumpsumInput,
    },
    {
      id: "withdrawal",
      label: "Systematic Withdrawal",
      component: WithdrawalInput,
    },
    {
      id: "inflation",
      label: "Consider Inflation",
      component: InflationInput,
    },
  ];

  // State to track selected optional parameters
  const [selectedParameters, setSelectedParameters] = useState<string[]>([]);

  // Investment projection calculation
  const projectionData = useInvestmentCalculation(inputs);

  // Update input handler
  const updateInput = (updates: Partial<InvestmentInputs>) => {
    setInputs((prev) => ({ ...prev, ...updates }));
  };

  // Toggle optional parameter
  const toggleParameter = (parameterId: string) => {
    setSelectedParameters((prev) =>
      prev.includes(parameterId)
        ? prev.filter((id) => id !== parameterId)
        : [...prev, parameterId]
    );
  };

  return (
    <div className="space-y-8">
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">
              Advanced Investment Return Calculator
            </CardTitle>
            <a
              href="https://github.com/archie9211/investment-calculator.git"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              <span>View on GitHub</span>
            </a>
          </div>
          <div className="text-muted-foreground space-y-2">
            <p>
              Calculate your investment returns with advanced features like
              step-up investments, lumpsum additions, systematic withdrawals,
              and inflation adjustment.
            </p>
            <div className="text-sm mt-4 bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Features:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Monthly SIP investment calculator</li>
                <li>Annual step-up option to increase investment amount</li>
                <li>Additional lumpsum investment support</li>
                <li>Systematic withdrawal planning</li>
                <li>Inflation-adjusted future value calculation</li>
                <li>Detailed growth visualization</li>
              </ul>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Basic Inputs */}
          <BasicInputs inputs={inputs} updateInput={updateInput} />

          {/* Optional Parameters Selection */}
          <div className="mb-6 flex flex-wrap gap-4">
            {optionalParameters.map((param) => (
              <div key={param.id} className="flex items-center space-x-2">
                <Checkbox
                  id={param.id}
                  checked={selectedParameters.includes(param.id)}
                  onCheckedChange={() => toggleParameter(param.id)}
                />
                <Label htmlFor={param.id}>{param.label}</Label>
              </div>
            ))}
          </div>

          {/* Render Selected Optional Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedParameters.map((parameterId) => {
              const parameter = optionalParameters.find(
                (p) => p.id === parameterId
              );
              if (!parameter) return null;

              const ParameterComponent = parameter.component;
              return (
                <ParameterComponent
                  key={parameterId}
                  inputs={inputs}
                  updateInput={updateInput}
                />
              );
            })}
          </div>

          {/* Summary Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div className="flex flex-col items-center">
              <span className="text-sm text-muted-foreground mb-1">
                Total Investment
              </span>
              <span className="text-2xl font-bold">
                {formatIndianCurrency(
                  projectionData[projectionData.length - 1]?.totalInvestment ||
                    0
                )}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm text-muted-foreground mb-1">
                Total Returns
              </span>
              <span className="text-2xl font-bold text-green-600">
                {formatIndianCurrency(
                  projectionData[projectionData.length - 1]?.returns || 0
                )}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm text-muted-foreground mb-1">
                Total Value
              </span>
              <span className="text-2xl font-bold text-primary">
                {formatIndianCurrency(
                  projectionData[projectionData.length - 1]?.corpus || 0
                )}
              </span>
            </div>

            {/* Inflation Impact Section */}
            {selectedParameters.includes("inflation") && (
              <div className="flex flex-col items-center col-span-full mt-4 pt-4 border-t">
                <div className="flex flex-col items-center">
                  <span className="text-sm text-muted-foreground mb-1">
                    Inflation Adjusted Value (Today's Worth)
                  </span>
                  <span className="text-2xl font-bold text-orange-600">
                    {formatIndianCurrency(
                      projectionData[projectionData.length - 1]
                        ?.inflationAdjustedCorpus || 0
                    )}
                  </span>
                  <span className="text-sm text-muted-foreground mt-1">
                    Final CPI:{" "}
                    {projectionData[
                      projectionData.length - 1
                    ]?.currentCPI.toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-sm text-muted-foreground mb-1">
                    Purchasing Power Loss
                  </span>
                  <span className="text-2xl font-bold text-red-500">
                    {projectionData[
                      projectionData.length - 1
                    ]?.purchasingPowerChange.toFixed(2)}
                    %
                  </span>
                  <span className="text-sm text-muted-foreground mt-1">
                    Over {inputs.investmentPeriod} years
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Visualization */}
          <div className="mt-8 flex flex-col gap-8">
            <div className="w-full">
              <InvestmentGrowthChart projectionData={projectionData} />
            </div>
            <div className="w-full">
              <InvestmentBreakdownChart projectionData={projectionData} />
            </div>
          </div>
        </CardContent>
      </Card>
      <CalculationDetails />
      <Disclaimer />
    </div>
  );
};

export default InvestmentCalculator;
