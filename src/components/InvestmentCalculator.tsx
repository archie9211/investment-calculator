// components/InvestmentCalculator.tsx
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { InvestmentInputs, OptionalParameter } from "../types/InvestmentTypes";
import { useInvestmentCalculation } from "../hooks/useInvestmentCalculation";
import InvestmentGrowthChart from "./InvestmentGrowthChart";
import InvestmentBreakdownChart from "./InvestmentBreakdownChart";
import { formatIndianCurrency } from "../utils/formatters";

// Import individual input components
import BasicInputs from "./BasicInputs";
import StepUpInput from "./StepUpInput";
import LumpsumInput from "./LumpsumInput";
import WithdrawalInput from "./WithdrawalInput";
import InflationInput from "./InflationInput";
import CalculationDetails from "./CalculationDetails";
import Disclaimer from "./Disclaimer";

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
          <CardTitle className="text-2xl">
            Advanced Investment Return Calculator
          </CardTitle>
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
            {selectedParameters.includes("inflation") && (
              <div className="flex flex-col items-center col-span-full mt-4 pt-4 border-t">
                <span className="text-sm text-muted-foreground mb-1">
                  Inflation Adjusted Value (Today's Worth)
                </span>
                <span className="text-2xl font-bold text-orange-600">
                  {formatIndianCurrency(
                    projectionData[projectionData.length - 1]
                      ?.inflationAdjustedCorpus || 0
                  )}
                </span>
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
