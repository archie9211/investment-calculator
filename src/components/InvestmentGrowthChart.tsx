import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { YearlyProjection } from "../types/InvestmentTypes";

interface InvestmentGrowthChartProps {
  projectionData: YearlyProjection[];
}

const InvestmentGrowthChart: React.FC<InvestmentGrowthChartProps> = ({
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

  const formatXAxis = (value: number, month: number) => {
    return isMobile ? `Y${value}` : `${value} (${value * 12 + month})`;
  };

  return (
    <div className="w-full flex flex-col items-center">
      <h3 className="text-lg font-semibold mb-4">
        Investment Growth Projection
      </h3>
      <div className="w-full h-[400px]">
        {" "}
        {/* Fixed height container */}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={projectionData}
            margin={{
              top: 20,
              right: isMobile ? 10 : 30,
              left: isMobile ? 10 : 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={(data) => formatXAxis(data.year - 1, data.month)}
              label={
                !isMobile
                  ? {
                      value: "Year(Months)",
                      position: "insideBottomRight",
                      offset: -10,
                    }
                  : undefined
              }
              interval={isMobile ? 24 : 10}
              fontSize={isMobile ? 12 : 14}
            />
            <YAxis
              label={
                !isMobile
                  ? {
                      value: "Amount (₹)",
                      angle: -90,
                      position: "insideLeft",
                    }
                  : undefined
              }
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
              fontSize={isMobile ? 12 : 14}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                return [`₹${Number(value).toLocaleString()}`, name];
              }}
              labelFormatter={(label) => `Year ${label}`}
            />
            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={isMobile ? { fontSize: "12px" } : undefined}
            />
            <Line
              type="monotone"
              dataKey="totalInvestment"
              stroke="#8884d8"
              name="Total Investment"
              dot={false}
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
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InvestmentGrowthChart;
