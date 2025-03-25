import React from "react";
import { Card, CardContent } from "./ui/card";

const Disclaimer: React.FC = () => {
  return (
    <Card className="w-full max-w-6xl mx-auto bg-muted/50">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            📝 Disclaimer & Future Updates
          </h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              This calculator is a work in progress and we're continuously
              adding new features to make it more comprehensive and useful.
              Upcoming features include:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Tax implications and post-tax returns calculation</li>
              <li>Multiple investment comparison</li>
              <li>Goal-based investment planning</li>
              <li>Investment portfolio optimization</li>
              <li>Risk assessment and analysis</li>
            </ul>
            <p className="mt-4 text-xs">
              Note: The calculations provided are for illustration purposes only
              and should not be considered as financial advice. Please consult
              with a qualified financial advisor for personalized investment
              guidance.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Disclaimer;
