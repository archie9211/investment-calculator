import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  InvestmentInputs,
  WithdrawalFrequency,
  WithdrawalType,
} from "../types/InvestmentTypes";

interface Props {
  inputs: InvestmentInputs;
  updateInput: (updates: Partial<InvestmentInputs>) => void;
}

const WithdrawalInput: React.FC<Props> = ({ inputs, updateInput }) => {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateInput({ withdrawalAmount: parseFloat(e.target.value) || 0 });
  };
  const handleFrequencyChange = (value: WithdrawalFrequency) => {
    updateInput({ withdrawalFrequency: value });
  };
  const handleStartYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateInput({ withdrawalStartYear: parseInt(e.target.value) || 0 });
  };
  const handleTypeChange = (value: WithdrawalType) => {
    updateInput({ withdrawalType: value, withdrawalAmount: 0 }); // Reset amount on type change
  };
  const handleInflationAdjustedChange = (
    checked: boolean | "indeterminate"
  ) => {
    updateInput({ withdrawalInflationAdjusted: !!checked });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <Label className="font-semibold">Systematic Withdrawal Plan (SWP)</Label>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="withdrawalStartYear">Start After Year</Label>
          <Input
            id="withdrawalStartYear"
            type="number"
            value={inputs.withdrawalStartYear || 0}
            onChange={handleStartYearChange}
            min="0"
            max={inputs.investmentPeriod || 1} // Cannot start after investment period
            placeholder="e.g., 10"
          />
        </div>
        <div>
          <Label htmlFor="withdrawalFrequency">Frequency</Label>
          <Select
            value={inputs.withdrawalFrequency || "yearly"}
            onValueChange={handleFrequencyChange}
          >
            <SelectTrigger id="withdrawalFrequency">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Withdrawal Basis</Label>
        <RadioGroup
          defaultValue={inputs.withdrawalType || "fixed"}
          onValueChange={handleTypeChange}
          className="flex space-x-4 mb-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="fixed" id="withdrawal-fixed" />
            <Label htmlFor="withdrawal-fixed">Fixed Amount (₹)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="percentage" id="withdrawal-percentage" />
            <Label htmlFor="withdrawal-percentage">Percentage (%)</Label>
          </div>
        </RadioGroup>
        <Input
          id="withdrawalAmount"
          type="number"
          value={inputs.withdrawalAmount || 0}
          onChange={handleAmountChange}
          min="0"
          step="any"
          placeholder={`Enter ${
            inputs.withdrawalType === "percentage"
              ? "percentage (e.g., 0.5)"
              : "amount (₹)"
          }`}
        />
      </div>

      {inputs.withdrawalType === "fixed" && (
        <div className="flex items-center space-x-2 mt-2">
          <Checkbox
            id="withdrawalInflationAdjusted"
            checked={inputs.withdrawalInflationAdjusted || false}
            onCheckedChange={handleInflationAdjustedChange}
          />
          <Label htmlFor="withdrawalInflationAdjusted">
            Increase withdrawal amount with inflation annually
          </Label>
        </div>
      )}
    </div>
  );
};

export default WithdrawalInput;
