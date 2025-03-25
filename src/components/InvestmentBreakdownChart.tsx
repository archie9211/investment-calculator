// components/InvestmentBreakdownChart.tsx
import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { YearlyProjection } from "../types/InvestmentTypes";

interface InvestmentBreakdownChartProps {
  projectionData: YearlyProjection[];
}

const InvestmentBreakdownChart: React.FC<InvestmentBreakdownChartProps> = ({
  projectionData,
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={breakdownData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={isMobile ? 100 : 150}
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
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry) => {
                if (entry && entry.payload) {
                  return isMobile
                    ? `${value}`
                    : `${value} (₹${Number(
                        entry.payload.value
                      ).toLocaleString()})`;
                }
                return value;
              }}
              wrapperStyle={isMobile ? { fontSize: "12px" } : undefined}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InvestmentBreakdownChart;
