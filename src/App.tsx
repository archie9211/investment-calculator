import React from "react";
import InvestmentCalculator from "./components/InvestmentCalculator";

function App() {
  return (
    <div className="App container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Investment Return Calculator</h1>
      <InvestmentCalculator />
    </div>
  );
}

export default App;
