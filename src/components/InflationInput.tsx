import React from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { InvestmentInputs } from "../types/InvestmentTypes";

interface InflationInputProps {
  inputs: InvestmentInputs;
  updateInput: (updates: Partial<InvestmentInputs>) => void;
}

const InflationInput: React.FC<InflationInputProps> = ({
  inputs,
  updateInput,
}) => {
  const handleInflationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/^0+/, "");
    const numValue = Number(value);
    updateInput({
      inflationRate: value === "" || numValue < 0 ? 0 : Math.min(numValue, 30),
    });
  };

  return (
    <div>
      <Label>Expected Inflation Rate (%)</Label>
      <Input
        type="number"
        min={0}
        max={30}
        value={inputs.inflationRate}
        onChange={handleInflationChange}
        placeholder="Enter expected inflation rate"
      />
    </div>
  );
};

export default InflationInput;
