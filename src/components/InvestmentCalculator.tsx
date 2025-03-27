// components/InvestmentCalculator.tsx
import React, { useState, Suspense, lazy } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import html2canvas from "html2canvas"; // <--- Import html2canvas
import { Button } from "@/components/ui/button"; // Import Button
import { Download, Github } from "lucide-react"; // Import icons
import {
  InvestmentInputs,
  OptionalParameter,
  // VariableReturnEntry, // Import if needed directly
} from "../types/InvestmentTypes"; // Updated types
import { useInvestmentCalculation } from "../hooks/useInvestmentCalculation"; // Updated hook
import { formatIndianCurrency } from "../utils/formatters";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Papa from "papaparse"; // For CSV Export
import jsPDF from "jspdf"; // For PDF Export
import "jspdf-autotable"; // For PDF Export Tables
import autoTable from "jspdf-autotable";
// UI Components
import AnimatedNumber from "./ui/AnimatedNumber";
import BasicInputs from "./BasicInputs";
import Disclaimer from "./Disclaimer";
import CalculationDetails from "./CalculationDetails"; // Assuming this explains the *how*

// Lazy Load Components
const InvestmentGrowthChart = lazy(() => import("./InvestmentGrowthChart"));
const InvestmentBreakdownChart = lazy(
  () => import("./InvestmentBreakdownChart")
);
const ProjectionDataTable = lazy(() => import("./ProjectionDataTable")); // Lazy load data table

// New Input Component Stubs (Import actual components)
const StepUpInput = lazy(() => import("./StepUpInput"));
const LumpsumInput = lazy(() => import("./LumpsumInput"));
const WithdrawalInput = lazy(() => import("./WithdrawalInput"));
const InflationInput = lazy(() => import("./InflationInput"));
const TaxInput = lazy(() => import("./Taxinput"));
const ExpenseInput = lazy(() => import("./ExpenseInput"));
const VariableReturnInput = lazy(() => import("./VariableReturnInput"));

// Extend jsPDF interface for autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const InvestmentCalculator: React.FC = () => {
  // Default inputs with new fields
  const defaultInputs: InvestmentInputs = {
    monthlyInvestment: 5000,
    initialInvestment: 0,
    expectedReturn: 12,
    investmentPeriod: 10,
    // Optional Defaults (explicitly off)
    stepUpEnabled: false,
    stepUpType: "percentage",
    stepUpValue: 0,
    lumpsumEnabled: false,
    lumpsumAmount: 0,
    lumpsumFrequency: "never",
    withdrawalEnabled: false,
    withdrawalAmount: 0,
    withdrawalFrequency: "yearly",
    withdrawalStartYear: 0,
    withdrawalType: "fixed",
    withdrawalInflationAdjusted: false,
    inflationEnabled: false,
    inflationRate: 0,
    variableReturnEnabled: false,
    variableReturns: [],
    taxEnabled: false,
    taxRate: 0,
    expenseRatioEnabled: false,
    expenseRatio: 0,
    // goalAmount: 0, // Goal planning deferred
  };

  // State for inputs
  const [inputs, setInputs] = useState<InvestmentInputs>(defaultInputs);

  // Define Optional Parameters Configuration
  const optionalParametersConfig: OptionalParameter[] = [
    {
      id: "stepUpEnabled",
      label: "Step-Up Investment",
      component: StepUpInput,
    },
    {
      id: "lumpsumEnabled",
      label: "Lumpsum Investment",
      component: LumpsumInput,
    },
    {
      id: "withdrawalEnabled",
      label: "Systematic Withdrawal",
      component: WithdrawalInput,
    },
    {
      id: "inflationEnabled",
      label: "Consider Inflation",
      component: InflationInput,
    },
    {
      id: "variableReturnEnabled",
      label: "Variable Returns",
      component: VariableReturnInput,
    },
    {
      id: "taxEnabled",
      label: "Apply Tax on Withdrawal",
      component: TaxInput,
      dependsOn: "withdrawalEnabled",
    },
    {
      id: "expenseRatioEnabled",
      label: "Apply Expense Ratio",
      component: ExpenseInput,
    },
  ];

  // Investment projection calculation using the updated hook
  const { projections: projectionData, finalMetrics } =
    useInvestmentCalculation(inputs);

  // Update input handler
  const updateInput = (updates: Partial<InvestmentInputs>) => {
    setInputs((prev) => ({ ...prev, ...updates }));
    // Optional: Debounce toast or show only for significant changes
    notify("Values updated!");
  };

  // Toggle optional parameter and reset related values
  const toggleParameter = (parameterId: keyof InvestmentInputs | string) => {
    const currentConfig = optionalParametersConfig.find(
      (p) => p.id === parameterId
    );
    if (!currentConfig) return;

    const isEnabling = !inputs[parameterId as keyof InvestmentInputs];

    // Prepare updates: toggle the flag and potentially reset related values
    let updates: Partial<InvestmentInputs> = { [parameterId]: isEnabling };

    if (!isEnabling) {
      // Reset values when disabling
      switch (parameterId) {
        case "stepUpEnabled":
          updates = { ...updates, stepUpValue: 0, stepUpType: "percentage" };
          break;
        case "lumpsumEnabled":
          updates = { ...updates, lumpsumAmount: 0, lumpsumFrequency: "never" };
          break;
        case "withdrawalEnabled":
          updates = {
            ...updates,
            withdrawalAmount: 0,
            withdrawalStartYear: 0,
            withdrawalType: "fixed",
            withdrawalInflationAdjusted: false,
            withdrawalFrequency: "yearly",
          };
          // Also disable dependent options like tax if withdrawal is disabled
          if (inputs.taxEnabled) updates.taxEnabled = false;
          updates.taxRate = 0;
          break;
        case "inflationEnabled":
          updates = { ...updates, inflationRate: 0 };
          break;
        case "variableReturnEnabled":
          updates = { ...updates, variableReturns: [] };
          break;
        case "taxEnabled":
          updates = { ...updates, taxRate: 0 };
          break;
        case "expenseRatioEnabled":
          updates = { ...updates, expenseRatio: 0 };
          break;
      }
    } else {
      // Set sensible defaults when *enabling* if needed
      switch (parameterId) {
        case "inflationEnabled":
          if (!inputs.inflationRate) updates.inflationRate = 6; // Default inflation if enabling
          break;
        case "withdrawalEnabled":
          if (!inputs.withdrawalStartYear && inputs.investmentPeriod > 0)
            updates.withdrawalStartYear = inputs.investmentPeriod; // Default start = end
          break;
        // Add other enabling defaults if desired
      }
    }

    updateInput(updates);
  };

  // --- Animation Variants ---
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  };

  const scaleIn = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: "spring", stiffness: 100, delay: 0.1 },
  };

  const notify = (message: string) => toast.success(message);

  // --- Export Functions ---
  const exportToCSV = () => {
    if (!projectionData || projectionData.length === 0) {
      toast.error("No data to export.");
      return;
    }
    // Choose monthly or yearly? Let's export monthly for full detail.
    const csvData = Papa.unparse(projectionData, {
      header: true,
    });
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "investment_projection.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.info("CSV export started.");
  };

  const exportToPDF = () => {
    // No async needed now
    console.log("[PDF Export] Function called (Text/Table only).");

    if (!projectionData || projectionData.length === 0) {
      console.log("[PDF Export] No projection data found. Aborting.");
      toast.error("No data to export.");
      return;
    }
    console.log("[PDF Export] Projection data found.");

    try {
      // --- PDF Setup ---
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      doc.setFont("helvetica", "normal");

      // --- Branding & Metadata ---
      // ... (appName, githubUrl, reportDate, generatedBy, disclaimers) ...
      const appName = "Advanced Investment Calculator";
      const githubUrl =
        "https://github.com/archie9211/investment-calculator.git";
      const reportDate = new Date().toLocaleDateString("en-GB", {
        /*...*/
      });
      const generatedBy = `Generated by: ${appName}`;
      const shortDisclaimer =
        "Illustrative purposes only; not financial advice."; // Slightly shorter
      const fullDisclaimer =
        "Disclaimer: This calculation provides an estimate based on the inputs provided...";

      let startY = margin;
      // ... (Add Title, Date, Generated By, Separator line) ...
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Investment Projection Report", pageWidth / 2, startY, {
        align: "center",
      });
      startY += 8;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(`Report Date: ${reportDate}`, pageWidth - margin, startY, {
        align: "right",
      });
      doc.text(generatedBy, margin, startY);
      startY += 6;
      doc.setDrawColor(200);
      doc.line(margin, startY, pageWidth - margin, startY);
      startY += 6;

      // --- SECTION 1: Input Parameters ---
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text("Input Parameters:", margin, startY);
      startY += 5;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");

      const inputCol1X = margin + 2;
      const inputCol2X = margin + 75; // Adjust spacing
      const inputCol3X = margin + 150; // Adjust spacing
      const inputLineHeight = 4.5; // Space between input lines

      // Column 1
      doc.text(
        `Initial Investment: ${formatIndianCurrency(
          inputs.initialInvestment || 0
        )}`,
        inputCol1X,
        startY
      );
      startY += inputLineHeight;
      doc.text(
        `Monthly Investment: ${formatIndianCurrency(
          inputs.monthlyInvestment || 0
        )}`,
        inputCol1X,
        startY
      );
      if (inputs.stepUpEnabled && inputs.stepUpValue) {
        startY += inputLineHeight;
        const stepUpText =
          inputs.stepUpType === "percentage"
            ? `${inputs.stepUpValue}% p.a.`
            : `${formatIndianCurrency(inputs.stepUpValue)} p.a.`;
        doc.text(`   ↳ Step-Up: ${stepUpText}`, inputCol1X + 3, startY); // Indented
      }
      startY += inputLineHeight;
      doc.text(
        `Investment Period: ${inputs.investmentPeriod || 0} Years`,
        inputCol1X,
        startY
      );

      // Reset startY for Column 2
      let startYCol2 =
        startY -
        (inputs.stepUpEnabled && inputs.stepUpValue ? 3 : 2) * inputLineHeight; // Align top

      // Column 2
      const returnText =
        inputs.variableReturnEnabled &&
        inputs.variableReturns &&
        inputs.variableReturns.length > 0
          ? "Variable (See Note)" // Keep it simple here, details are too much for summary
          : `${inputs.expectedReturn || 0}% p.a.`;
      doc.text(`Expected Return: ${returnText}`, inputCol2X, startYCol2);
      startYCol2 += inputLineHeight;
      if (inputs.lumpsumEnabled && inputs.lumpsumAmount) {
        doc.text(
          `Lumpsum: ${formatIndianCurrency(inputs.lumpsumAmount)} (${
            inputs.lumpsumFrequency || "never"
          })`,
          inputCol2X,
          startYCol2
        );
        startYCol2 += inputLineHeight;
      }
      if (inputs.expenseRatioEnabled && inputs.expenseRatio) {
        doc.text(
          `Expense Ratio: ${inputs.expenseRatio}% p.a.`,
          inputCol2X,
          startYCol2
        );
        startYCol2 += inputLineHeight;
      }

      // Reset startY for Column 3
      let startYCol3 =
        startYCol2 -
        (inputs.lumpsumEnabled && inputs.lumpsumAmount ? 1 : 0) *
          inputLineHeight -
        (inputs.expenseRatioEnabled && inputs.expenseRatio ? 1 : 0) *
          inputLineHeight; // Align top

      // Column 3
      if (inputs.inflationEnabled) {
        doc.text(
          `Inflation Rate: ${inputs.inflationRate || 0}% p.a.`,
          inputCol3X,
          startYCol3
        );
        startYCol3 += inputLineHeight;
      }
      if (inputs.withdrawalEnabled && inputs.withdrawalAmount) {
        const withdrawalTypeText =
          inputs.withdrawalType === "percentage"
            ? `${inputs.withdrawalAmount}% of corpus`
            : formatIndianCurrency(inputs.withdrawalAmount);
        const withdrawalFreqText =
          inputs.withdrawalFrequency === "monthly" ? "Monthly" : "Yearly";
        doc.text(
          `Withdrawal: ${withdrawalTypeText} (${withdrawalFreqText})`,
          inputCol3X,
          startYCol3
        );
        startYCol3 += inputLineHeight;
        doc.text(
          `   ↳ Start After: Year ${inputs.withdrawalStartYear || 0}${
            inputs.withdrawalInflationAdjusted ? ", Infl. Adj." : ""
          }`,
          inputCol3X + 3,
          startYCol3
        );
        startYCol3 += inputLineHeight;
      }
      if (inputs.taxEnabled && inputs.taxRate) {
        doc.text(
          `Tax Rate (on Gains): ${inputs.taxRate}%`,
          inputCol3X,
          startYCol3
        );
        startYCol3 += inputLineHeight;
      }

      // Update main startY to be below the longest column
      startY = Math.max(startY, startYCol2, startYCol3) + 4; // Add padding below inputs

      // --- SECTION 2: Summary Results ---
      doc.setDrawColor(200); // Separator line
      doc.line(margin, startY, pageWidth - margin, startY);
      startY += 6;

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text("Projected Results (End of Period):", margin, startY);
      startY += 5;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");

      const resultCol1X = margin + 5;
      const resultColWidth = (contentWidth - 10) / 3; // Divide remaining width into 3 columns approx
      const resultCol2X = resultCol1X + resultColWidth;
      const resultCol3X = resultCol2X + resultColWidth;
      const resultLineHeight = 5; // Vertical space between result lines

      // Helper function to add Label: Value pair neatly
      const addSummaryLine = (
        label: string,
        value: string,
        x: number,
        y: number
      ): number => {
        const labelWidth = doc.getTextWidth(label);
        doc.setFont("helvetica", "bold");
        doc.text(label, x, y);
        doc.setFont("helvetica", "normal");
        doc.text(value, x + labelWidth + 1, y); // Add 1mm gap
        return y + resultLineHeight; // Return Y for next line
      };

      let currentY1 = startY;
      let currentY2 = startY;
      let currentY3 = startY;

      // Column 1
      currentY1 = addSummaryLine(
        "Total Investment:",
        formatIndianCurrency(finalMetrics.totalInvestment),
        resultCol1X,
        currentY1
      );
      currentY1 = addSummaryLine(
        "Estimated Returns:",
        formatIndianCurrency(finalMetrics.totalReturns),
        resultCol1X,
        currentY1
      );
      if (inputs.withdrawalEnabled && finalMetrics.totalWithdrawalsGross > 0) {
        currentY1 = addSummaryLine(
          "Total Withdrawn (Gross):",
          formatIndianCurrency(finalMetrics.totalWithdrawalsGross),
          resultCol1X,
          currentY1
        );
      }

      // Column 2
      currentY2 = addSummaryLine(
        "Final Corpus:",
        formatIndianCurrency(finalMetrics.finalCorpus),
        resultCol2X,
        currentY2
      );
      if (finalMetrics.cagr !== null) {
        currentY2 = addSummaryLine(
          "CAGR:",
          `${finalMetrics.cagr.toFixed(2)}%`,
          resultCol2X,
          currentY2
        );
      }
      if (inputs.taxEnabled && finalMetrics.totalTaxPaid > 0) {
        currentY2 = addSummaryLine(
          "Total Tax Paid:",
          formatIndianCurrency(finalMetrics.totalTaxPaid),
          resultCol2X,
          currentY2
        );
      }
      if (inputs.expenseRatioEnabled && finalMetrics.totalExpensesPaid > 0) {
        currentY2 = addSummaryLine(
          "Total Expenses Paid:",
          formatIndianCurrency(finalMetrics.totalExpensesPaid),
          resultCol2X,
          currentY2
        );
      }

      // Column 3 (Inflation related)
      if (inputs.inflationEnabled) {
        currentY3 = addSummaryLine(
          "Inflation Adj. Corpus:",
          formatIndianCurrency(finalMetrics.finalInflationAdjustedCorpus),
          resultCol3X,
          currentY3
        );
        if (finalMetrics.realRateOfReturn !== null) {
          currentY3 = addSummaryLine(
            "Real Rate of Return:",
            `${finalMetrics.realRateOfReturn.toFixed(2)}%`,
            resultCol3X,
            currentY3
          );
        }
        currentY3 = addSummaryLine(
          "Purchasing Power Change:",
          `${finalMetrics.finalPurchasingPowerChange.toFixed(2)}%`,
          resultCol3X,
          currentY3
        );
        currentY3 = addSummaryLine(
          "Final CPI:",
          `${finalMetrics.finalCPI.toFixed(2)}`,
          resultCol3X,
          currentY3
        );
      }

      // Update main startY to be below the longest column
      startY = Math.max(currentY1, currentY2, currentY3) + 4; // Add padding below results

      // --- SECTION 3: Detailed Table ---
      doc.setDrawColor(200); // Separator line
      doc.line(margin, startY, pageWidth - margin, startY);
      startY += 6;

      console.log("[PDF Export] Preparing table data...");
      // ... (Prepare tableColumns and tableRows as before using toLocaleString or similar) ...
      const tableColumns = [
        "Yr",
        "M",
        "Invested",
        "Corpus",
        "Withdraw",
        "Tax",
        "Expenses",
        "Infl. Adj.",
      ];
      const tableRows: (string | number)[][] = projectionData.map((item) => [
        item.year,
        item.month,
        Number(item.totalInvestment).toLocaleString("en-IN", {
          maximumFractionDigits: 0,
        }),
        Number(item.corpus).toLocaleString("en-IN", {
          maximumFractionDigits: 0,
        }),
        Number(item.withdrawalThisMonth).toLocaleString("en-IN", {
          maximumFractionDigits: 0,
        }),
        Number(item.taxPaidThisMonth).toLocaleString("en-IN", {
          maximumFractionDigits: 0,
        }),
        Number(item.expenseDeductedThisMonth).toLocaleString("en-IN", {
          maximumFractionDigits: 0,
        }),
        Number(item.inflationAdjustedCorpus).toLocaleString("en-IN", {
          maximumFractionDigits: 0,
        }),
      ]);
      console.log("[PDF Export] Table data prepared.");

      console.log("[PDF Export] Calling autoTable...");
      // ... (autoTable call with styling, didDrawPage for footer/header) ...
      autoTable(doc, {
        startY: startY,
        head: [tableColumns],
        body: tableRows,
        // ... (theme, headStyles, bodyStyles, alternateRowStyles, columnStyles, margin, didDrawPage)
        theme: "grid",
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
          fontSize: 8,
        },
        bodyStyles: { fontSize: 7, cellPadding: 1, valign: "middle" },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: {
          0: { halign: "center", cellWidth: 10 },
          1: { halign: "center", cellWidth: 10 },
          2: { halign: "right" },
          3: { halign: "right" },
          4: { halign: "right" },
          5: { halign: "right" },
          6: { halign: "right" },
          7: { halign: "right" },
        },
        margin: {
          top: margin,
          bottom: margin + 15,
          left: margin,
          right: margin,
        },
        didDrawPage: (data) => {
          /* ... Footer/Header Logic ... */
          const pageNum = data.pageNumber;
          const totalPages = (doc.internal as any).getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(
            `Page ${pageNum} of ${totalPages}`,
            pageWidth / 2,
            pageHeight - margin + 5,
            { align: "center" }
          );
          doc.text(shortDisclaimer, margin, pageHeight - margin + 10);
          doc.textWithLink(
            "View Source on GitHub",
            pageWidth - margin,
            pageHeight - margin + 10,
            { url: githubUrl, align: "right" }
          );
          if (pageNum > 1) {
            /* ... Continued Header ... */
          }
        },
      });
      console.log("[PDF Export] autoTable finished.");

      // --- SECTION 4: Final Disclaimer ---
      console.log("[PDF Export] Adding final disclaimer...");
      // ... (Get finalY, calculate space, add page if needed, draw full disclaimer) ...
      const finalY = (doc as any).lastAutoTable.finalY || startY;
      let currentY = finalY + 8;
      const disclaimerLines = doc.splitTextToSize(fullDisclaimer, contentWidth);
      const disclaimerHeight =
        disclaimerLines.length * (doc.getFontSize() / 2.5);
      if (currentY + disclaimerHeight > pageHeight - margin - 10) {
        doc.addPage();
        currentY = margin;
      }
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(disclaimerLines, margin, currentY);
      console.log("[PDF Export] Final disclaimer added.");

      // --- Save PDF ---
      // ... (Save and toast success) ...
      console.log("[PDF Export] Saving PDF...");
      doc.save("Investment_Projection_Report.pdf");
      console.log("[PDF Export] PDF save initiated.");
      toast.success("PDF export successful!");
    } catch (error) {
      // ... (Error handling) ...
      console.error("[PDF Export] Error caught:", error);
      toast.error(
        `PDF generation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };
  // --- JSX ---
  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-6xl mx-auto">
        <motion.div {...scaleIn}>
          <CardHeader>
            <div className="flex justify-between items-center flex-wrap gap-2">
              <CardTitle className="text-2xl font-bold">
                Advanced Investment Calculator
              </CardTitle>
              {/* GitHub Link */}
              <a
                href="https://github.com/archie9211/investment-calculator.git" // Update if repo changed
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="h-4 w-4" />
                <span>View on GitHub</span>
              </a>
            </div>
            {/* Description and Features (Keep or Update) */}
            <div className="text-muted-foreground space-y-2 mt-2">
              <p>
                Project future investment growth with powerful customization
                options.
              </p>
              {/* Optional: List key features dynamically or keep static */}
              <div className="text-sm mt-4 bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Features Included:</h4>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>SIP & Initial Investment</li>
                  <li>Annual Step-Up (Percentage or Fixed)</li>
                  <li>Flexible Lumpsum Investments</li>
                  <li>
                    Systematic Withdrawals (Fixed/Percentage, Inflation
                    Adjusted)
                  </li>
                  <li>Inflation Impact & Adjusted Value</li>
                  <li>Variable Return Periods</li>
                  <li>Expense Ratio Simulation</li>
                  <li>Simplified Tax Calculation on Withdrawal Gains</li>
                  <li>Detailed Monthly/Yearly Data & Charts</li>
                  <li>CSV/PDF Export</li>
                </ul>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Basic Inputs */}
            <motion.div {...fadeIn}>
              <BasicInputs inputs={inputs} updateInput={updateInput} />
            </motion.div>

            {/* Optional Parameters Selection */}
            <motion.div className="my-6" variants={fadeIn}>
              <Label className="text-lg font-semibold mb-3 block">
                Optional Features
              </Label>
              <div className="flex flex-wrap gap-4 items-center">
                {optionalParametersConfig.map((param) => {
                  // Disable checkbox if dependency not met (e.g., tax needs withdrawal)
                  const dependencyMet =
                    !param.dependsOn || !!inputs[param.dependsOn];
                  return (
                    <motion.div
                      key={param.id}
                      whileHover={dependencyMet ? { scale: 1.05 } : {}} // Only hover effect if enabled
                      whileTap={dependencyMet ? { scale: 0.95 } : {}}
                      className={`flex items-center space-x-2 p-2 rounded-lg border transition-colors ${
                        dependencyMet
                          ? "hover:bg-accent/10 cursor-pointer"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                      onClick={() =>
                        dependencyMet &&
                        toggleParameter(param.id as keyof InvestmentInputs)
                      } // Allow click only if dependency met
                    >
                      <Checkbox
                        id={param.id as string}
                        checked={
                          dependencyMet &&
                          !!inputs[param.id as keyof InvestmentInputs]
                        }
                        // Use controlled toggle via the div click handler
                        // onCheckedChange={() => toggleParameter(param.id as keyof InvestmentInputs)}
                        disabled={!dependencyMet}
                        aria-label={param.label}
                      />
                      <Label
                        htmlFor={param.id as string}
                        className={
                          dependencyMet
                            ? "cursor-pointer"
                            : "cursor-not-allowed"
                        }
                      >
                        {param.label}
                        {!dependencyMet && (
                          <span className="text-xs text-muted-foreground">
                            {" "}
                            (Requires{" "}
                            {
                              optionalParametersConfig.find(
                                (p) => p.id === param.dependsOn
                              )?.label
                            }
                            )
                          </span>
                        )}
                      </Label>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Dynamically Rendered Optional Input Components */}
            <AnimatePresence mode="wait">
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4"
                layout // Enable layout animation
              >
                {optionalParametersConfig
                  .filter(
                    (param) => !!inputs[param.id as keyof InvestmentInputs]
                  ) // Filter based on the flag in 'inputs' state
                  .map((param) => (
                    <motion.div
                      key={param.id}
                      layout // Animate layout changes
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                      className="min-w-0" // Prevents grid blowout
                    >
                      <Suspense
                        fallback={
                          <div className="p-4 border rounded-lg h-24 flex items-center justify-center text-muted-foreground">
                            Loading settings...
                          </div>
                        }
                      >
                        <param.component
                          inputs={inputs}
                          updateInput={updateInput}
                        />
                      </Suspense>
                    </motion.div>
                  ))}
              </motion.div>
            </AnimatePresence>

            {/* --- Results Summary --- */}
            {projectionData && projectionData.length > 0 && (
              <motion.div
                className="mt-10"
                variants={fadeIn}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <h3 className="text-xl font-semibold mb-4">
                  Projected Results (After {inputs.investmentPeriod} Years)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                  {/* Key Metrics */}
                  <SummaryItem
                    label="Total Investment"
                    value={finalMetrics.totalInvestment}
                    formatter={formatIndianCurrency}
                  />
                  <SummaryItem
                    label="Total Returns"
                    value={finalMetrics.totalReturns}
                    formatter={formatIndianCurrency}
                    className="text-green-600"
                  />
                  <SummaryItem
                    label="Final Corpus"
                    value={finalMetrics.finalCorpus}
                    formatter={formatIndianCurrency}
                    className="text-primary"
                  />
                  {finalMetrics.cagr !== null && (
                    <SummaryItem
                      label="CAGR"
                      value={finalMetrics.cagr}
                      formatter={(v) => `${v.toFixed(2)}%`}
                    />
                  )}

                  {/* Optional Metrics */}
                  {inputs.inflationEnabled && (
                    <>
                      <SummaryItem
                        label="Inflation Adjusted Corpus"
                        value={finalMetrics.finalInflationAdjustedCorpus}
                        formatter={formatIndianCurrency}
                        className="text-orange-600"
                      />
                      {finalMetrics.realRateOfReturn !== null && (
                        <SummaryItem
                          label="Real Rate of Return"
                          value={finalMetrics.realRateOfReturn}
                          formatter={(v) => `${v.toFixed(2)}%`}
                          className="text-orange-600"
                        />
                      )}
                      <SummaryItem
                        label="Purchasing Power Loss"
                        value={finalMetrics.finalPurchasingPowerChange}
                        formatter={(v) => `${v.toFixed(2)}%`}
                        className="text-red-500"
                      />
                      <SummaryItem
                        label="Final CPI"
                        value={finalMetrics.finalCPI}
                        formatter={(v) => v.toFixed(2)}
                      />
                    </>
                  )}
                  {inputs.withdrawalEnabled &&
                    finalMetrics.totalWithdrawalsGross > 0 && (
                      <SummaryItem
                        label="Total Withdrawn (Gross)"
                        value={finalMetrics.totalWithdrawalsGross}
                        formatter={formatIndianCurrency}
                      />
                    )}
                  {inputs.taxEnabled && finalMetrics.totalTaxPaid > 0 && (
                    <SummaryItem
                      label="Total Tax Paid"
                      value={finalMetrics.totalTaxPaid}
                      formatter={formatIndianCurrency}
                      className="text-red-600"
                    />
                  )}
                  {inputs.expenseRatioEnabled &&
                    finalMetrics.totalExpensesPaid > 0 && (
                      <SummaryItem
                        label="Total Expenses Paid"
                        value={finalMetrics.totalExpensesPaid}
                        formatter={formatIndianCurrency}
                        className="text-red-600"
                      />
                    )}
                </div>

                {/* --- Export Buttons --- */}
                <div className="mt-6 flex gap-4 justify-center">
                  <Button onClick={exportToCSV} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" /> Export as CSV
                  </Button>
                  <Button onClick={exportToPDF} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" /> Export as PDF
                  </Button>
                </div>
              </motion.div>
            )}

            {/* --- Visualizations --- */}
            {projectionData && projectionData.length > 0 && (
              <motion.div
                className="mt-8 flex flex-col gap-8"
                variants={fadeIn}
                initial="initial"
                animate="animate"
              >
                <Suspense fallback={<ChartPlaceholder />}>
                  <motion.div
                    className="w-full"
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <InvestmentGrowthChart
                      projectionData={projectionData}
                      showInflationLine={inputs.inflationEnabled || false}
                      initialInvestment={inputs.initialInvestment || 0}
                    />
                  </motion.div>
                </Suspense>
                <Suspense fallback={<ChartPlaceholder />}>
                  <motion.div
                    className="w-full"
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {/* Pass final metrics for breakdown */}
                    <InvestmentBreakdownChart
                      totalInvestment={finalMetrics.totalInvestment}
                      totalReturns={finalMetrics.totalReturns}
                    />
                  </motion.div>
                </Suspense>
              </motion.div>
            )}

            {/* --- Detailed Data Table --- */}
            <Suspense
              fallback={
                <div className="mt-8 text-center text-muted-foreground">
                  Loading data table...
                </div>
              }
            >
              <ProjectionDataTable projectionData={projectionData} />
            </Suspense>
          </CardContent>
        </motion.div>
      </Card>

      {/* Explanations and Disclaimer */}
      <Suspense fallback={null}>
        <CalculationDetails />
      </Suspense>
      <Disclaimer />
    </motion.div>
  );
};

// Helper component for Summary Items
const SummaryItem: React.FC<{
  label: string;
  value: number;
  formatter: (value: number) => string;
  className?: string;
}> = ({ label, value, formatter, className = "" }) => (
  <div className="flex flex-col items-center text-center">
    <span className="text-xs sm:text-sm text-muted-foreground mb-1">
      {label}
    </span>
    <AnimatedNumber
      value={value}
      formatter={formatter}
      className={`text-lg sm:text-xl font-bold ${className}`}
    />
  </div>
);

// Helper component for Chart Placeholder
const ChartPlaceholder: React.FC = () => (
  <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
    Loading Chart...
  </div>
);

export default InvestmentCalculator;
