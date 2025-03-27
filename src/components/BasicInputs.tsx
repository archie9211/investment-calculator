// components/BasicInputs.tsx
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InvestmentInputs } from "../types/InvestmentTypes";
import { Tooltip } from "@/components/ui/tooltip";

interface BasicInputsProps {
  inputs: InvestmentInputs;
  updateInput: (updates: Partial<InvestmentInputs>) => void;
}

const BasicInputs: React.FC<BasicInputsProps> = ({ inputs, updateInput }) => {
  const handleNumberInput =
    (field: keyof InvestmentInputs, defaultValue: number = 0) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/^0+/, ""); // Remove leading zeros
      const numValue = Number(value);
      e.target.value = value;
      if (value === "" || numValue < 0) {
        updateInput({ [field]: defaultValue });
        e.target.value = defaultValue.toString();
        return;
      }
      updateInput({ [field]: numValue });
    };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* Monthly Investment */}
      <Tooltip content="Monthly investment amount for SIP">
        <div className="w-full">
          <Label>Monthly Investment (₹)</Label>
          <Input
            type="number"
            value={inputs.monthlyInvestment}
            onChange={handleNumberInput("monthlyInvestment", 0)}
            placeholder="Enter monthly investment"
          />
        </div>
      </Tooltip>

      {/* Expected Return */}
      <div>
        <Label>Expected Annual Return (%)</Label>
        <Input
          type="number"
          value={inputs.expectedReturn}
          onChange={handleNumberInput("expectedReturn", 1)}
          placeholder="Enter expected return"
        />
      </div>

      {/* Investment Period */}
      <div>
        <Label>Investment Period (Years)</Label>
        <Input
          type="number"
          value={inputs.investmentPeriod}
          onChange={handleNumberInput("investmentPeriod", 1)}
          placeholder="Enter investment period"
        />
      </div>

      {/* Initial Investment */}
      <div>
        <Label>Initial Investment (₹)</Label>
        <Input
          type="number"
          value={inputs.initialInvestment}
          onChange={handleNumberInput("initialInvestment", 0)}
          placeholder="Enter initial investment"
        />
      </div>

      {/* Compounding Frequency */}
      {/* <div>
        <Label>Compounding Frequency</Label>
        <Select
          value={inputs.compoundingFrequency}
          onValueChange={(val) =>
            updateInput({ compoundingFrequency: val as "monthly" | "yearly" })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select compounding frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div> */}
    </div>
  );
};

export default BasicInputs;
