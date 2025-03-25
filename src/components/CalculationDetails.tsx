import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const CalculationDetails: React.FC = () => {
  return (
    <Card className="w-full max-w-6xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-xl">How it's Calculated</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Monthly SIP Returns</h3>
          <p className="text-muted-foreground mb-2">
            The SIP returns are calculated using the following formula:
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-mono">
              M = P × ({`{[1 + i]^n – 1}`} / i) × (1 + i)
            </p>
            <ul className="mt-2 text-sm text-muted-foreground">
              <li>M = Maturity amount</li>
              <li>P = Monthly investment amount</li>
              <li>i = Monthly interest rate (Annual rate ÷ 12)</li>
              <li>n = Number of monthly investments</li>
            </ul>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Lumpsum Investment Returns</h3>
          <p className="text-muted-foreground mb-2">
            Returns on lumpsum investments are calculated using compound
            interest:
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-mono">A = P × (1 + r)^t</p>
            <ul className="mt-2 text-sm text-muted-foreground">
              <li>A = Final amount</li>
              <li>P = Principal (Initial investment)</li>
              <li>r = Interest rate per period</li>
              <li>t = Number of periods</li>
            </ul>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Step-up Investment</h3>
          <p className="text-muted-foreground mb-2">
            Monthly investment increases annually by the step-up percentage:
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-mono">
              New Monthly Investment = Current × (1 + step-up%)
            </p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Inflation Adjustment</h3>
          <p className="text-muted-foreground mb-2">
            Present value calculation considering inflation:
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-mono">
              Present Value = Future Value ÷ (1 + i)^n
            </p>
            <ul className="mt-2 text-sm text-muted-foreground">
              <li>i = Annual inflation rate</li>
              <li>n = Number of years</li>
            </ul>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Total Returns</h3>
          <p className="text-muted-foreground">
            Total returns are calculated as: Final Corpus - Total Investment
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalculationDetails;
