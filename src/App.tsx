import React, { Suspense } from "react";
import { Helmet } from "react-helmet";
import { siteConfig } from "./config/metadata";

// Lazy load components
const InvestmentCalculator = React.lazy(
  () => import("./components/InvestmentCalculator")
);
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <>
      <Helmet>
        <title>{siteConfig.title}</title>
        <meta name="description" content={siteConfig.description} />
        <meta name="keywords" content={siteConfig.keywords} />
        <link rel="canonical" href={siteConfig.url} />
      </Helmet>
      <div className="App container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          Investment Return Calculator
        </h1>
        <Suspense fallback={<LoadingSpinner />}>
          <InvestmentCalculator />
        </Suspense>
      </div>
    </>
  );
}

export default App;
