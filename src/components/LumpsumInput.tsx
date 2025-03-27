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
import { InvestmentInputs, LumpsumFrequency } from "../types/InvestmentTypes";

interface Props {
  inputs: InvestmentInputs;
  updateInput: (updates: Partial<InvestmentInputs>) => void;
}

const LumpsumInput: React.FC<Props> = ({ inputs, updateInput }) => {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateInput({ lumpsumAmount: parseFloat(e.target.value) || 0 });
  };

  const handleFrequencyChange = (value: LumpsumFrequency) => {
    updateInput({ lumpsumFrequency: value });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <Label className="font-semibold">Lumpsum Investment</Label>
      <div>
        <Label htmlFor="lumpsumAmount">Lumpsum Amount (₹)</Label>
        <Input
          id="lumpsumAmount"
          type="number"
          value={inputs.lumpsumAmount || 0}
          onChange={handleAmountChange}
          min="0"
          step="any"
          placeholder="Enter lumpsum amount"
        />
      </div>
      <div>
        <Label htmlFor="lumpsumFrequency">Frequency</Label>
        <Select
          value={inputs.lumpsumFrequency || "never"}
          onValueChange={handleFrequencyChange}
        >
          <SelectTrigger id="lumpsumFrequency">
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="never">Never</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="half-yearly">Half-Yearly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default LumpsumInput;
