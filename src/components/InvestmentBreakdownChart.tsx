// components/InvestmentBreakdownChart.tsx
import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { YearlyProjection } from "../types/InvestmentTypes";

interface InvestmentBreakdownChartProps {
  projectionData: YearlyProjection[];
}

const InvestmentBreakdownChart: React.FC<InvestmentBreakdownChartProps> = ({
  projectionData,
}) => {
  // Get the final projection data
  const finalProjection = projectionData[projectionData.length - 1];

  const breakdownData = [
    {
      name: "Total Investment",
      value: finalProjection.totalInvestment,
      color: "#8884d8",
    },
    {
      name: "Total Returns",
      value: finalProjection.returns,
      color: "#82ca9d",
    },
  ];

  return (
    <div className="w-full flex flex-col items-center">
      <h3 className="text-lg font-semibold mb-4">Investment Breakdown</h3>
      <PieChart width={400} height={400}>
        <Pie
          data={breakdownData}
          cx={200}
          cy={200}
          labelLine={false}
          outerRadius={150}
          fill="#8884d8"
          dataKey="value"
        >
          {breakdownData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [
            `₹${Number(value).toLocaleString()}`,
            "Amount",
          ]}
        />
        <Legend
          formatter={(value, entry) => {
            if (entry && entry.payload) {
              return `${value} (₹${Number(
                entry.payload.value
              ).toLocaleString()})`;
            }
            return value;
          }}
        />
      </PieChart>
    </div>
  );
};

export default InvestmentBreakdownChart;
