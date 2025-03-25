import { Helmet } from "react-helmet";
import InvestmentCalculator from "./components/InvestmentCalculator";
import { siteConfig } from "./config/metadata";

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
        <InvestmentCalculator />
      </div>
    </>
  );
}

export default App;
