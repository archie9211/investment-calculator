// src/components/InvestmentBreakdownChart.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatIndianCurrency } from "../utils/formatters"; // Adjust path as needed
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"; // Use Card for consistency

interface InvestmentBreakdownChartProps {
  // Receive final metrics directly
  totalInvestment: number;
  totalReturns: number;
}

const InvestmentBreakdownChart: React.FC<InvestmentBreakdownChartProps> = ({
  totalInvestment,
  totalReturns,
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prepare data for the pie chart using props
  const breakdownData = useMemo(
    () => [
      {
        name: "Total Investment",
        // Ensure value is non-negative for the chart
        value: Math.max(0, totalInvestment),
        color: "#8884d8", // Keep color consistent
      },
      {
        name: "Estimated Returns", // Changed label slightly for clarity
        // Ensure value is non-negative
        value: Math.max(0, totalReturns),
        color: "#82ca9d", // Keep color consistent
      },
    ],
    [totalInvestment, totalReturns]
  );

  // Calculate total for percentage display if needed, handle division by zero
  const totalValue = totalInvestment + totalReturns;

  // Custom tooltip formatter
  const customTooltipFormatter = (value: number, name: string) => {
    const percentage =
      totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : 0;
    return [`${formatIndianCurrency(value)} (${percentage}%)`, name];
  };

  // Custom legend formatter
  const customLegendFormatter = (value: string, entry: any) => {
    const { color, payload } = entry;
    const formattedValue = formatIndianCurrency(payload.value);
    return (
      <span style={{ color }}>
        {value}: {formattedValue}
      </span>
    );
  };

  return (
    <Card className="w-full" id="breakdown-chart-container">
      <CardHeader>
        <CardTitle className="text-lg text-center">
          Investment Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px] sm:h-[350px]">
          {" "}
          {/* Adjust height as needed */}
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={breakdownData}
                cx="50%"
                cy="50%"
                labelLine={false}
                // label={renderCustomizedLabel} // Add custom labels inside/outside slices if desired
                outerRadius={isMobile ? 80 : 120} // Adjust radius for screen size
                innerRadius={isMobile ? 40 : 60} // Make it a donut chart
                fill="#8884d8"
                dataKey="value"
                nameKey="name" // Use nameKey for legend/tooltip identification
                paddingAngle={2} // Adds small gap between slices
              >
                {breakdownData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={entry.color}
                  /> // Use defined colors
                ))}
              </Pie>
              <Tooltip formatter={customTooltipFormatter} />
              <Legend
                formatter={customLegendFormatter} // Use custom formatter for richer legend
                iconType="circle" // Use circle icons in legend
                wrapperStyle={{
                  fontSize: isMobile ? "10px" : "12px",
                  paddingTop: "20px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentBreakdownChart;
