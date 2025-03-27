// src/components/ProjectionDataTable.tsx
import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatIndianCurrency } from "../utils/formatters"; // Adjust path as needed
import { MonthlyProjection } from "../types/InvestmentTypes";

interface Props {
  projectionData: MonthlyProjection[];
}

// Function to aggregate monthly data to yearly
const aggregateYearly = (monthlyData: MonthlyProjection[]) => {
  const yearlyData: any[] = []; // Use 'any' for simplicity here, define a proper type if needed
  let currentYearData: any = null;

  monthlyData.forEach((item) => {
    if (!currentYearData || currentYearData.year !== item.year) {
      if (currentYearData) {
        yearlyData.push(currentYearData);
      }
      currentYearData = {
        year: item.year,
        openingCorpus:
          yearlyData.length > 0
            ? yearlyData[yearlyData.length - 1].closingCorpus
            : monthlyData[0]?.totalInvestment || 0, // Approx opening
        totalInvestment: 0, // Will be cumulative at year end
        investmentDuringYear: 0,
        growthDuringYear: 0,
        withdrawalDuringYear: 0,
        taxDuringYear: 0,
        expenseDuringYear: 0,
        closingCorpus: 0, // Will be year end value
        closingCPI: 0,
        closingInflationAdjustedCorpus: 0,
      };
      // Find the opening corpus more accurately (corpus from end of prev year's last month)
      if (item.month === 1 && item.year > 1) {
        const prevMonthData = monthlyData.find(
          (p) => p.year === item.year - 1 && p.month === 12
        );
        currentYearData.openingCorpus = prevMonthData?.corpus || 0;
      } else if (item.year === 1 && item.month === 1) {
        // Year 1 opening is initial investment which isn't directly in projections
        // We can estimate it by backing out first month's investment and growth
        // Simpler: Start tracking investment *during* year
      }
    }

    // Calculate investment during the month (more accurate than just using totalInvestment delta)
    const prevMonthIndex =
      monthlyData.findIndex(
        (p) => p.year === item.year && p.month === item.month
      ) - 1;
    const prevMonthTotalInvestment =
      prevMonthIndex >= 0 ? monthlyData[prevMonthIndex].totalInvestment : 0;
    const investmentThisMonth = item.totalInvestment - prevMonthTotalInvestment;

    currentYearData.investmentDuringYear += investmentThisMonth;
    currentYearData.growthDuringYear += item.monthlyGrowth;
    currentYearData.withdrawalDuringYear += item.withdrawalThisMonth;
    currentYearData.taxDuringYear += item.taxPaidThisMonth;
    currentYearData.expenseDuringYear += item.expenseDeductedThisMonth;

    // Update year-end values
    currentYearData.totalInvestment = item.totalInvestment;
    currentYearData.closingCorpus = item.corpus;
    currentYearData.closingCPI = item.currentCPI;
    currentYearData.closingInflationAdjustedCorpus =
      item.inflationAdjustedCorpus;
  });

  if (currentYearData) {
    yearlyData.push(currentYearData);
  }

  // Recalculate Opening Corpus based on previous year's close
  for (let i = 1; i < yearlyData.length; i++) {
    yearlyData[i].openingCorpus = yearlyData[i - 1].closingCorpus;
  }
  if (yearlyData.length > 0 && monthlyData.length > 0) {
    // Find initial Investment for Year 1 opening
    const firstMonthData = monthlyData[0];
    const firstMonthInvestment = firstMonthData.totalInvestment; // This is initial + first month SIP/lumpsum
    yearlyData[0].openingCorpus =
      firstMonthInvestment > 0
        ? firstMonthData.corpus -
          firstMonthData.monthlyGrowth +
          firstMonthData.withdrawalThisMonth +
          firstMonthData.taxPaidThisMonth +
          firstMonthData.expenseDeductedThisMonth -
          (firstMonthData.totalInvestment -
            /* initial investment? hard to get here*/ 0)
        : 0;
    // Simpler approximation for Year 1 opening:
    // const initialInv =
    //   monthlyData[0]?.totalInvestment -
    //   (monthlyData[0]?.totalInvestment -
    //     (monthlyData[1]?.totalInvestment ?? monthlyData[0]?.totalInvestment)); // Hacky attempt
    // Let's use the very first totalInvestment if available
    yearlyData[0].openingCorpus =
      monthlyData[0]?.totalInvestment > 0
        ? (monthlyData.find((p) => p.year === 1 && p.month === 1)
            ?.totalInvestment || 0) - /* first month invest */ 0
        : 0; // Still approximate
    // Best: Pass initialInvestment as a prop if needed for perfect accuracy here.
    // Let's just show Year End values for simplicity in aggregation.
  }

  return yearlyData.map((y) => ({
    // Return a cleaner structure
    year: y.year,
    totalInvestment: y.totalInvestment,
    // investmentDuringYear: y.investmentDuringYear, // Maybe less useful than cumulative
    growthDuringYear: y.growthDuringYear,
    withdrawalDuringYear: y.withdrawalDuringYear,
    taxDuringYear: y.taxDuringYear,
    expenseDuringYear: y.expenseDuringYear,
    corpusEndOfYear: y.closingCorpus,
    cpiEndOfYear: y.closingCPI,
    corpusAdjustedEndOfYear: y.closingInflationAdjustedCorpus,
  }));
};

const ProjectionDataTable: React.FC<Props> = ({ projectionData }) => {
  const [viewMode, setViewMode] = useState<"monthly" | "yearly">("yearly");
  const [showTable, setShowTable] = useState(false);

  const yearlyData = useMemo(
    () => aggregateYearly(projectionData),
    [projectionData]
  );

  const dataToShow = viewMode === "yearly" ? yearlyData : projectionData;
  const headers =
    viewMode === "yearly"
      ? [
          "Year",
          "Total Invested",
          "Growth in Year",
          "Withdrawn in Year",
          "Tax Paid",
          "Expenses Paid",
          "Corpus (End of Year)",
          "CPI",
          "Infl. Adjusted Corpus",
        ]
      : [
          "Year",
          "Month",
          "Total Invested",
          "Monthly Growth",
          "Withdrawn",
          "Tax Paid",
          "Expenses Paid",
          "Corpus",
          "CPI",
          "Infl. Adjusted Corpus",
        ];

  const formatValue = (header: string, value: any): string => {
    if (typeof value !== "number") return String(value);

    const currencyHeaders = [
      "Total Invested",
      "Monthly Growth",
      "Withdrawn",
      "Tax Paid",
      "Expenses Paid",
      "Corpus",
      "Infl. Adjusted Corpus",
      "Growth in Year",
      "Withdrawn in Year",
      "Corpus (End of Year)",
      "corpusAdjustedEndOfYear",
    ];
    const percentageHeaders = ["Purchasing Power Change"]; // Add others if needed
    const cpiHeaders = ["CPI", "cpiEndOfYear"];

    if (currencyHeaders.some((h) => header.includes(h))) {
      return formatIndianCurrency(value);
    }
    if (percentageHeaders.some((h) => header.includes(h))) {
      return `${value.toFixed(2)}%`;
    }
    if (cpiHeaders.some((h) => header.includes(h))) {
      return value.toFixed(2);
    }
    return String(value); // Year, Month
  };

  const dataKeys =
    viewMode === "yearly"
      ? [
          "year",
          "totalInvestment",
          "growthDuringYear",
          "withdrawalDuringYear",
          "taxDuringYear",
          "expenseDuringYear",
          "corpusEndOfYear",
          "cpiEndOfYear",
          "corpusAdjustedEndOfYear",
        ]
      : [
          "year",
          "month",
          "totalInvestment",
          "monthlyGrowth",
          "withdrawalThisMonth",
          "taxPaidThisMonth",
          "expenseDeductedThisMonth",
          "corpus",
          "currentCPI",
          "inflationAdjustedCorpus",
        ];

  if (projectionData.length === 0) {
    return null; // Don't show if no data
  }

  return (
    <div className="mt-8">
      <Button onClick={() => setShowTable(!showTable)} variant="outline">
        {showTable ? "Hide" : "Show"} Detailed Data Table
      </Button>

      {showTable && (
        <Card className="mt-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Projection Details</CardTitle>
            <Select
              value={viewMode}
              onValueChange={(v) => setViewMode(v as "monthly" | "yearly")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yearly">Yearly Summary</SelectItem>
                <SelectItem value="monthly">Monthly Details</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="max-h-[500px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    {headers.map((header) => (
                      <TableHead
                        key={header}
                        className={
                          header.includes("Corpus") ||
                          header.includes("Invested")
                            ? "text-right"
                            : ""
                        }
                      >
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataToShow.map((item: any, index: number) => (
                    <TableRow key={index}>
                      {dataKeys.map((key, cellIndex) => (
                        <TableCell
                          key={key}
                          className={
                            headers[cellIndex].includes("Corpus") ||
                            headers[cellIndex].includes("Invested")
                              ? "text-right font-medium"
                              : ""
                          }
                        >
                          {formatValue(headers[cellIndex], item[key])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectionDataTable;
