import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { YearlyProjection } from "../types/InvestmentTypes";

interface InvestmentGrowthChartProps {
  projectionData: YearlyProjection[];
}

const InvestmentGrowthChart: React.FC<InvestmentGrowthChartProps> = ({
  projectionData,
}) => {
  const formatXAxis = (value: number, month: number) => {
    return `${value} (${value * 12 + month})`;
  };

  return (
    <div className="w-full flex flex-col items-center">
      <h3 className="text-lg font-semibold mb-4">
        Investment Growth Projection
      </h3>
      <LineChart
        width={800} // Increased width for better visibility
        height={400} // Increased height for better visibility
        data={projectionData}
        className="mx-auto"
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey={(data) => formatXAxis(data.year - 1, data.month)}
          label={{
            value: "Year(Months)",
            position: "insideBottomRight",
            offset: -10,
          }}
          interval={10} // Show one label per year
        />
        <YAxis
          label={{ value: "Amount (₹)", angle: -90, position: "insideLeft" }}
          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
        />

        <Tooltip
          formatter={(value: number, name: string) => {
            return [`₹${Number(value).toLocaleString()}`, name];
          }}
          labelFormatter={(label) => `Year ${label}`}
        />

        <Legend verticalAlign="top" />
        <Line
          type="monotone"
          dataKey="totalInvestment"
          stroke="#8884d8"
          name="Total Investment"
          dot={false} // Remove dots for cleaner look with many data points
        />
        <Line
          type="monotone"
          dataKey="corpus"
          stroke="#82ca9d"
          name="Corpus Value"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="returns"
          stroke="#ffc658"
          name="Total Returns"
          dot={false}
        />
      </LineChart>
    </div>
  );
};

export default InvestmentGrowthChart;
