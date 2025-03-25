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
          <h3 className="font-semibold mb-2">Inflation Impact</h3>
          <p className="text-muted-foreground mb-2">
            The calculator uses Consumer Price Index (CPI) to measure inflation
            impact:
          </p>
          <div className="space-y-4">
            {/* CPI Calculation */}
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-2">CPI Calculation:</h4>
              <p className="font-mono">
                CPI Year N = Base CPI × (1 + inflation rate)^N
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Base CPI = 100 (starting year)
              </p>
            </div>

            {/* Real Value Calculation */}
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-2">
                Real Value Calculation:
              </h4>
              <p className="font-mono">
                Real Value = Nominal Value ÷ (Current CPI ÷ Base CPI)
              </p>
            </div>

            {/* Purchasing Power Loss */}
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-2">
                Purchasing Power Loss:
              </h4>
              <p className="font-mono">
                Power Loss % = ((100 - Current CPI) ÷ 100) × 100
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Key Metrics</h3>
          <div className="bg-muted p-4 rounded-lg">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <strong>Total Investment:</strong> Sum of all investments made
              </li>
              <li>
                <strong>Nominal Returns:</strong> Final corpus - Total
                investment
              </li>
              <li>
                <strong>Real Returns:</strong> Inflation-adjusted corpus - Total
                investment
              </li>
              <li>
                <strong>Purchasing Power:</strong> Shows the relative buying
                power of your money over time
              </li>
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
