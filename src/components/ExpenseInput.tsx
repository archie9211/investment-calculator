import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InvestmentInputs } from "../types/InvestmentTypes";

interface Props {
  inputs: InvestmentInputs;
  updateInput: (updates: Partial<InvestmentInputs>) => void;
}

const ExpenseInput: React.FC<Props> = ({ inputs, updateInput }) => {
  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateInput({ expenseRatio: parseFloat(e.target.value) || 0 });
  };

  return (
    <div className="space-y-2 p-4 border rounded-lg">
      <Label htmlFor="expenseRatio" className="font-semibold">
        Annual Expense Ratio (%)
      </Label>
      <Input
        id="expenseRatio"
        type="number"
        value={inputs.expenseRatio || 0}
        onChange={handleRateChange}
        min="0"
        max="100" // Technically possible, though unlikely
        step="any"
        placeholder="e.g., 0.5 for 0.5%"
      />
      <p className="text-xs text-muted-foreground">
        Represents annual fees (like for mutual funds) deducted from the corpus.
      </p>
    </div>
  );
};

export default ExpenseInput;
