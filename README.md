# Investment Return Calculator

A comprehensive investment calculator built with React and TypeScript that helps users plan their financial investments and visualize returns.

## Features

- **Monthly SIP Calculator**: Calculate returns on regular monthly investments
- **Advanced Investment Options**:
  - Annual investment step-up
  - Lumpsum investment additions
  - Systematic withdrawal planning
  - Inflation-adjusted calculations
- **Visual Analytics**:
  - Investment growth projection charts
  - Investment breakdown visualization
  - Monthly/yearly progress tracking
- **Real-time Calculations**:
  - Total investment tracking
  - Returns calculation
  - Corpus value projection
  - Inflation-adjusted values

## Technical Stack

- React + TypeScript
- Vite for build tooling
- Recharts for data visualization
- Shadcn UI components
- Tailwind CSS for styling

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/investment-calculator.git

# Navigate to project directory
cd investment-calculator

# Install dependencies
npm install

# Start development server
npm run dev
```

## Usage

1. Enter basic investment details:

   - Monthly investment amount
   - Expected annual return rate
   - Investment period
   - Initial investment (optional)

2. Enable additional features as needed:

   - Step-up investment: Increase monthly investment annually
   - Annual lumpsum: Add yearly one-time investments
   - Systematic withdrawal: Plan regular withdrawals
   - Inflation adjustment: See future value in today's terms

3. View Results:
   - Total investment amount
   - Expected returns
   - Final corpus value
   - Inflation-adjusted values (if enabled)

## Calculation Methods

The calculator uses standard financial formulas:

1. **SIP Returns**: `M = P × ({[1 + i]^n – 1} / i) × (1 + i)`

   - M = Maturity amount
   - P = Monthly investment
   - i = Monthly interest rate (Annual rate ÷ 12)
   - n = Number of payments

2. **Lumpsum Returns**: `A = P × (1 + r)^t`

   - A = Final amount
   - P = Principal
   - r = Interest rate
   - t = Time period

3. **Inflation Impact**

   The calculator uses Consumer Price Index (CPI) to measure inflation impact:

   a) **CPI Calculation**:

   ```
   CPI Year N = Base CPI × (1 + inflation rate)^N
   Base CPI = 100 (starting year)
   ```

   b) **Real Value Calculation**:

   ```
   Real Value = Nominal Value ÷ (Current CPI ÷ Base CPI)
   ```

   c) **Purchasing Power Loss**:

   ```
   Power Loss % = ((100 - Current CPI) ÷ 100) × 100
   ```

4. **Key Metrics**:
   - Total Investment: Sum of all investments made
   - Nominal Returns: Final corpus - Total investment
   - Real Returns: Inflation-adjusted corpus - Total investment
   - Purchasing Power: Shows the relative buying power of your money over time

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Notes on Inflation

The calculator now uses a more accurate CPI-based approach to track inflation impact:

- Starts with a base CPI of 100
- Compounds inflation effect year over year
- Shows both nominal and real values
- Tracks purchasing power deterioration
- Provides more realistic future value estimates

## Disclaimer

This calculator is for educational purposes only. The calculations provided are estimates and should not be considered as financial advice. Please consult with a qualified financial advisor for personalized investment guidance.
