import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InvestmentInputs } from "../types/InvestmentTypes";

interface Props {
  inputs: InvestmentInputs;
  updateInput: (updates: Partial<InvestmentInputs>) => void;
}

const TaxInput: React.FC<Props> = ({ inputs, updateInput }) => {
  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateInput({ taxRate: parseFloat(e.target.value) || 0 });
  };

  return (
    <div className="space-y-2 p-4 border rounded-lg">
      <Label htmlFor="taxRate" className="font-semibold">
        Tax on Gains (%)
      </Label>
      <Input
        id="taxRate"
        type="number"
        value={inputs.taxRate || 0}
        onChange={handleRateChange}
        min="0"
        max="100"
        step="any"
        placeholder="e.g., 10 for 10%"
      />
      <p className="text-xs text-muted-foreground">
        Applies a simplified flat tax rate on the estimated capital gains
        portion of each withdrawal.
      </p>
    </div>
  );
};

export default TaxInput;
