import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { InvestmentInputs } from "../types/InvestmentTypes";

interface Props {
  inputs: InvestmentInputs;
  updateInput: (updates: Partial<InvestmentInputs>) => void;
}

const StepUpInput: React.FC<Props> = ({ inputs, updateInput }) => {
  const handleTypeChange = (value: "percentage" | "fixed") => {
    updateInput({ stepUpType: value, stepUpValue: 0 }); // Reset value on type change
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateInput({ stepUpValue: parseFloat(e.target.value) || 0 });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <Label className="font-semibold">Step-Up Investment</Label>
      <RadioGroup
        defaultValue={inputs.stepUpType || "percentage"}
        onValueChange={handleTypeChange}
        className="flex space-x-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="percentage" id="stepup-percentage" />
          <Label htmlFor="stepup-percentage">Percentage (%)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="fixed" id="stepup-fixed" />
          <Label htmlFor="stepup-fixed">Fixed Amount (₹)</Label>
        </div>
      </RadioGroup>
      <div>
        <Label htmlFor="stepUpValue">
          Annual Increase {inputs.stepUpType === "percentage" ? "(%)" : "(₹)"}
        </Label>
        <Input
          id="stepUpValue"
          type="number"
          value={inputs.stepUpValue || 0}
          onChange={handleValueChange}
          min="0"
          step="any"
          placeholder={`Enter ${
            inputs.stepUpType === "percentage" ? "percentage" : "amount"
          }`}
        />
      </div>
    </div>
  );
};

export default StepUpInput;
