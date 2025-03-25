import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InvestmentInputs } from "../types/InvestmentTypes";

interface StepUpInputProps {
  inputs: InvestmentInputs;
  updateInput: (updates: Partial<InvestmentInputs>) => void;
}

export const StepUpInput: React.FC<StepUpInputProps> = ({
  inputs,
  updateInput,
}) => {
  const [steupVal, setStepUpVal] = useState<number>(0);
  const handleNumberInput =
    (field: keyof InvestmentInputs, defaultValue: number = 0) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/^0+/, ""); // Remove leading zeros
      const numValue = Number(value);
      e.target.value = value;
      setStepUpVal(Number(value));
      if (value === "" || numValue < 0) {
        updateInput({ [field]: defaultValue });
        e.target.value = defaultValue.toString();
        return;
      }
      updateInput({ [field]: numValue });
    };
  return (
    <div>
      <Label>Annual Step-Up ({steupVal} %)</Label>
      <Input
        type="range"
        value={inputs.stepUpPercentage}
        min="0"
        max="20"
        onChange={handleNumberInput("stepUpPercentage", 0)}
      />
    </div>
  );
};

export default StepUpInput;
