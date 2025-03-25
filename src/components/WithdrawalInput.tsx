import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { InvestmentInputs } from "../types/InvestmentTypes";

interface StepUpInputProps {
  inputs: InvestmentInputs;
  updateInput: (updates: Partial<InvestmentInputs>) => void;
}

export const WithdrawalInput: React.FC<StepUpInputProps> = ({
  inputs,
  updateInput,
}) => {
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
    <div className="space-y-2">
      <div>
        <Label>Withdrawal Amount (₹)</Label>
        <Input
          type="number"
          value={inputs.withdrawalAmount}
          onChange={handleNumberInput("withdrawalAmount", 0)}
          placeholder="Enter withdrawal amount"
        />
      </div>
      <div>
        <Label>Withdrawal Frequency</Label>
        <Select
          value={inputs.withdrawalFrequency}
          onValueChange={(val) =>
            updateInput({ withdrawalFrequency: val as "monthly" | "yearly" })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select withdrawal frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default WithdrawalInput;
