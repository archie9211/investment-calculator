// components/InvestmentCalculator.tsx
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { InvestmentInputs, OptionalParameter } from "../types/InvestmentTypes";
import { useInvestmentCalculation } from "../hooks/useInvestmentCalculation";
import { formatIndianCurrency } from "../utils/formatters";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AnimatedNumber from "./ui/AnimatedNumber";

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
    setSelectedParameters((prev) => {
      const isRemoving = prev.includes(parameterId);

      // Reset related values when removing a parameter
      if (isRemoving) {
        switch (parameterId) {
          case "stepUp":
            updateInput({ stepUpPercentage: 0 });
            break;
          case "lumpsum":
            updateInput({ annualLumpsum: 0 });
            break;
          case "withdrawal":
            updateInput({
              withdrawalAmount: 0,
            });
            break;
          case "inflation":
            updateInput({ inflationRate: 0 });
            break;
        }
      }

      // Update selected parameters
      return isRemoving
        ? prev.filter((id) => id !== parameterId)
        : [...prev, parameterId];
    });
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const scaleIn = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: "spring", stiffness: 100 },
  };

  const notify = (message: string) => toast.success(message);

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-6xl mx-auto">
        <motion.div {...scaleIn}>
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
            {/* Basic Inputs with animation */}
            <motion.div {...fadeIn}>
              <BasicInputs
                inputs={inputs}
                updateInput={(updates) => {
                  updateInput(updates);
                  notify("Values updated!");
                }}
              />
            </motion.div>

            {/* Optional Parameters with hover effects */}
            <motion.div className="mb-6 flex flex-wrap gap-4" variants={fadeIn}>
              {optionalParameters.map((param) => (
                <motion.div
                  key={param.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-accent/10 transition-colors"
                >
                  <Checkbox
                    id={param.id}
                    checked={selectedParameters.includes(param.id)}
                    onCheckedChange={() => toggleParameter(param.id)}
                  />
                  <Label htmlFor={param.id}>{param.label}</Label>
                </motion.div>
              ))}
            </motion.div>

            {/* Animated Optional Parameters */}
            <AnimatePresence mode="wait">
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                layout
              >
                {selectedParameters.map((parameterId) => {
                  const parameter = optionalParameters.find(
                    (p) => p.id === parameterId
                  );
                  if (!parameter) return null;

                  return (
                    <motion.div
                      key={parameterId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ type: "spring", stiffness: 100 }}
                    >
                      <parameter.component
                        inputs={inputs}
                        updateInput={updateInput}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {/* Animated Summary Section */}
            <motion.div
              className="mt-8"
              variants={fadeIn}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div className="flex flex-col items-center">
                  <span className="text-sm text-muted-foreground mb-1">
                    Total Investment
                  </span>
                  <AnimatedNumber
                    value={
                      projectionData[projectionData.length - 1]
                        ?.totalInvestment || 0
                    }
                    formatter={formatIndianCurrency}
                    className="text-2xl font-bold"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-sm text-muted-foreground mb-1">
                    Total Returns
                  </span>
                  <AnimatedNumber
                    value={
                      projectionData[projectionData.length - 1]?.returns || 0
                    }
                    formatter={formatIndianCurrency}
                    className="text-2xl font-bold text-green-600"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-sm text-muted-foreground mb-1">
                    Total Value
                  </span>
                  <AnimatedNumber
                    value={
                      projectionData[projectionData.length - 1]?.corpus || 0
                    }
                    formatter={formatIndianCurrency}
                    className="text-2xl font-bold text-primary"
                  />
                </div>

                {/* Inflation Impact Section */}
                {selectedParameters.includes("inflation") && (
                  <div className="flex flex-col items-center col-span-full mt-4 pt-4 border-t">
                    <div className="flex flex-col items-center">
                      <span className="text-sm text-muted-foreground mb-1">
                        Inflation Adjusted Value
                      </span>
                      <AnimatedNumber
                        value={
                          projectionData[projectionData.length - 1]
                            ?.inflationAdjustedCorpus || 0
                        }
                        formatter={formatIndianCurrency}
                        className="text-2xl font-bold text-orange-600"
                      />
                      <span className="text-sm text-muted-foreground mt-1">
                        Final CPI:{" "}
                        <AnimatedNumber
                          value={
                            projectionData[projectionData.length - 1]
                              ?.currentCPI || 0
                          }
                          formatter={(v) => v.toFixed(2)}
                          className="font-medium"
                        />
                      </span>
                    </div>
                    <div className="flex flex-col items-center mt-4">
                      <span className="text-sm text-muted-foreground mb-1">
                        Purchasing Power Loss
                      </span>
                      <AnimatedNumber
                        value={
                          projectionData[projectionData.length - 1]
                            ?.purchasingPowerChange || 0
                        }
                        formatter={(v) => `${v.toFixed(2)}%`}
                        className="text-2xl font-bold text-red-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Animated Visualization */}
            <motion.div
              className="mt-8 flex flex-col gap-8"
              variants={fadeIn}
              initial="initial"
              animate="animate"
            >
              <motion.div
                className="w-full"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <InvestmentGrowthChart projectionData={projectionData} />
              </motion.div>
              <motion.div
                className="w-full"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <InvestmentBreakdownChart projectionData={projectionData} />
              </motion.div>
            </motion.div>
          </CardContent>
        </motion.div>
      </Card>
      <CalculationDetails />
      <Disclaimer />
      {/* Toast notifications */}
      {/* <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        limit={3}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      /> */}
    </motion.div>
  );
};

export default InvestmentCalculator;
