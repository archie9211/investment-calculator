// src/components/VariableReturnInput.tsx
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  InvestmentInputs,
  VariableReturnEntry,
} from "../types/InvestmentTypes";

interface Props {
  inputs: InvestmentInputs;
  updateInput: (updates: Partial<InvestmentInputs>) => void;
}

const VariableReturnInput: React.FC<Props> = ({ inputs, updateInput }) => {
  const returns = inputs.variableReturns || [];

  const handleAddEntry = () => {
    const lastYearEnd =
      returns.length > 0 ? returns[returns.length - 1].yearEnd : 0;
    const newEntry: VariableReturnEntry = {
      yearEnd: lastYearEnd + 5,
      rate: inputs.expectedReturn || 10,
    }; // Default next period
    updateInput({ variableReturns: [...returns, newEntry] });
  };

  const handleRemoveEntry = (index: number) => {
    const updatedReturns = returns.filter((_, i) => i !== index);
    updateInput({ variableReturns: updatedReturns });
  };

  const handleEntryChange = (
    index: number,
    field: keyof VariableReturnEntry,
    value: string
  ) => {
    const updatedReturns = [...returns];
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      if (field === "yearEnd") {
        // Basic validation: ensure yearEnd is positive and potentially increasing
        const prevYearEnd = index > 0 ? updatedReturns[index - 1].yearEnd : 0;
        updatedReturns[index][field] = Math.max(
          prevYearEnd + 1,
          Math.max(1, numValue)
        );
      } else {
        updatedReturns[index][field] = numValue;
      }
      updateInput({ variableReturns: updatedReturns });
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <Label className="font-semibold">Variable Expected Returns</Label>
      <p className="text-xs text-muted-foreground">
        Define different annual return rates (%) for specific periods (up to the
        end of the specified year). The rate from the last entry applies
        thereafter.
      </p>
      {returns.map((entry, index) => (
        <div key={index} className="flex items-end space-x-2">
          <div className="flex-1">
            <Label htmlFor={`vr-year-${index}`}>Up to Year End</Label>
            <Input
              id={`vr-year-${index}`}
              type="number"
              value={entry.yearEnd}
              onChange={(e) =>
                handleEntryChange(index, "yearEnd", e.target.value)
              }
              min={index > 0 ? (returns[index - 1].yearEnd || 0) + 1 : 1}
              step="1"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor={`vr-rate-${index}`}>Annual Rate (%)</Label>
            <Input
              id={`vr-rate-${index}`}
              type="number"
              value={entry.rate}
              onChange={(e) => handleEntryChange(index, "rate", e.target.value)}
              step="any"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleRemoveEntry(index)}
            aria-label="Remove entry"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button onClick={handleAddEntry} variant="outline" size="sm">
        Add Period
      </Button>
    </div>
  );
};

export default VariableReturnInput;
