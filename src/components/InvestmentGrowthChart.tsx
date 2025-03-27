// src/components/InvestmentGrowthChart.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { MonthlyProjection } from "../types/InvestmentTypes"; // Adjust path if needed
import { formatIndianCurrency } from "../utils/formatters"; // Adjust path as needed
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"; // Use Card for consistency

interface InvestmentGrowthChartProps {
  projectionData: MonthlyProjection[];
  showInflationLine: boolean; // Prop to control inflation line visibility
  initialInvestment: number;
}

// Helper to format Y-axis ticks (e.g., 100000 -> 1L, 10000000 -> 1Cr)
const formatYAxisTick = (value: number): string => {
  if (value >= 10000000) {
    // Crores
    return `${(value / 10000000).toFixed(1)} Cr`;
  }
  if (value >= 100000) {
    // Lakhs
    return `${(value / 100000).toFixed(1)} L`;
  }
  if (value >= 1000) {
    // Thousands
    return `${(value / 1000).toFixed(0)} K`;
  }
  return `${value}`; // Smaller values
};

const InvestmentGrowthChart: React.FC<InvestmentGrowthChartProps> = ({
  projectionData,
  showInflationLine,
  initialInvestment,
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Aggregate data yearly (using end-of-year values) for a cleaner chart
  const yearlyChartData = useMemo(() => {
    if (!projectionData || projectionData.length === 0) return [];

    const yearlyMap = new Map<number, MonthlyProjection>();
    projectionData.forEach((p) => {
      // Store the last entry for each year (month 12, or the latest available if incomplete year)
      if (
        !yearlyMap.has(p.year) ||
        p.month >= (yearlyMap.get(p.year)?.month || 0)
      ) {
        yearlyMap.set(p.year, p);
      }
    });

    // Convert map to array and add year 0 data point if initial investment exists
    const initialInvestment =
      projectionData[0]?.totalInvestment -
      (projectionData[0]?.totalInvestment -
        (projectionData[1]?.totalInvestment ??
          projectionData[0]?.totalInvestment)); // Approx
    const initialPoint = {
      year: 0,
      "Projected Value": initialInvestment || 0, // Use actual initialInvestment if passed or infer
      "Total Investment": initialInvestment || 0,
      "Inflation Adjusted Value": showInflationLine
        ? initialInvestment
        : undefined,
    };

    const sortedData = Array.from(yearlyMap.values())
      .sort((a, b) => a.year - b.year)
      .map((p) => ({
        year: p.year,
        "Projected Value": p.corpus, // Use 'corpus' for the main projected line
        "Total Investment": p.totalInvestment,
        // Conditionally include inflation-adjusted data
        ...(showInflationLine && {
          "Inflation Adjusted Value": p.inflationAdjustedCorpus,
        }),
      }));

    // Add year 0 point if there was an initial investment
    if (initialPoint["Total Investment"] > 0) {
      return [initialPoint, ...sortedData];
    }
    return sortedData;
  }, [projectionData, showInflationLine, initialInvestment]);

  // Custom tooltip formatter
  const customTooltipFormatter = (value: number, name: string) => {
    return [formatIndianCurrency(value), name];
  };

  // Determine max Y value for ReferenceLine positioning
  // const maxYValue = useMemo(() => {
  //   return yearlyChartData.reduce(
  //     (max, p) => Math.max(max, p["Projected Value"] || 0),
  //     0
  //   );
  // }, [yearlyChartData]);

  return (
    <Card className="w-full" id="growth-chart-container">
      <CardHeader>
        <CardTitle className="text-lg text-center">
          Investment Growth Projection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[350px] sm:h-[400px]">
          {" "}
          {/* Adjust height */}
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={yearlyChartData}
              margin={{
                top: 5,
                right: isMobile ? 10 : 20,
                left: isMobile ? 5 : 20, // Adjust left margin for Y-axis labels
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
              <XAxis
                dataKey="year"
                label={
                  !isMobile
                    ? { value: "Year", position: "insideBottom", dy: 10 }
                    : undefined
                }
                // interval={'preserveStartEnd'} // Show start/end labels clearly
                minTickGap={isMobile ? 30 : 20} // Adjust gap between ticks
                fontSize={isMobile ? 10 : 12}
                tickCount={isMobile ? 5 : 10} // Limit number of ticks on mobile
                allowDecimals={false}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                // label={!isMobile ? { value: "Value", angle: -90, position: "insideLeft", dx: -15 } : undefined}
                tickFormatter={formatYAxisTick} // Use custom formatter
                fontSize={isMobile ? 10 : 12}
                width={isMobile ? 50 : 70} // Increase width to accommodate labels like "1.5 Cr"
                domain={["auto", "auto"]} // Or set explicit max like [0, dataMax => dataMax * 1.1]
              />
              <Tooltip
                formatter={customTooltipFormatter}
                labelFormatter={(label) => `End of Year ${label}`}
              />
              <Legend
                verticalAlign="top"
                wrapperStyle={{
                  fontSize: isMobile ? "10px" : "12px",
                  paddingBottom: "10px",
                }}
              />

              {/* Reference Line at y=0 */}
              <ReferenceLine y={0} stroke="#ccc" strokeWidth={1} />

              <Line
                type="monotone"
                dataKey="Total Investment"
                stroke="#8884d8" // Blue/Purple
                strokeWidth={2}
                dot={false}
                name="Total Investment"
              />
              <Line
                type="monotone"
                dataKey="Projected Value" // Changed from 'corpus'
                stroke="#22c55e" // Green
                strokeWidth={2}
                dot={false}
                name="Projected Value"
              />
              {/* Conditionally render Inflation Adjusted Line */}
              {showInflationLine && (
                <Line
                  type="monotone"
                  dataKey="Inflation Adjusted Value" // Changed from 'inflationAdjustedCorpus'
                  stroke="#f97316" // Orange
                  strokeWidth={2}
                  strokeDasharray="5 5" // Dashed line
                  dot={false}
                  name="Real Value (Infl. Adj.)"
                />
              )}
              {/* Removed the "Total Returns" line for clarity */}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentGrowthChart;
