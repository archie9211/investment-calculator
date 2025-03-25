import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InvestmentInputs } from "../types/InvestmentTypes";

interface StepUpInputProps {
  inputs: InvestmentInputs;
  updateInput: (updates: Partial<InvestmentInputs>) => void;
}

const LumpsumInput: React.FC<StepUpInputProps> = ({ inputs, updateInput }) => {
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
    <div>
      <Label>Annual Lumpsum Investment (₹)</Label>
      <Input
        type="number"
        value={inputs.annualLumpsum}
        onChange={handleNumberInput("annualLumpsum", 0)}
        placeholder="Enter annual lumpsum"
      />
    </div>
  );
};

export default LumpsumInput;
