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
   - i = Monthly interest rate
   - n = Number of payments

2. **Lumpsum Returns**: `A = P × (1 + r)^t`

   - A = Final amount
   - P = Principal
   - r = Interest rate
   - t = Time period

3. **Inflation Adjustment**: `Present Value = Future Value ÷ (1 + i)^n`
   - i = Inflation rate
   - n = Number of years

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Disclaimer

This calculator is for educational purposes only. The calculations provided are estimates and should not be considered as financial advice. Please consult with a qualified financial advisor for personalized investment guidance.
