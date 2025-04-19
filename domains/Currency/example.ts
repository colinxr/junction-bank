import { ConvertUsdToCad } from "./Actions/ConvertUsdToCad";
import { GetUsdToCadRate } from "./Actions/GetUsdToCadRate";
import { ExchangeRateApiService } from "./Service/ExchangeRateApiService";

// Example usage
async function example() {
  try {
    // Set up the dependencies
    const currencyService = new ExchangeRateApiService();
    const getUsdToCadRate = new GetUsdToCadRate(currencyService);
    const converter = new ConvertUsdToCad(getUsdToCadRate);

    // Convert 100 USD to CAD
    const amountCAD = await converter.execute(100);
    console.log(`100 USD = ${amountCAD} CAD`);

    // Get the current exchange rate
    const rate = await getUsdToCadRate.execute();
    console.log(`Current USD/CAD rate: ${rate.rate}`);
    console.log(`Rate expires at: ${rate.expiresAt}`);
  } catch (error) {
    console.error("Currency conversion failed:", error);
  }
}

// Run the example
example(); 