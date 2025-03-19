const EIA_API_KEY = '8oXNeP8BxYNolzsxulnI9TWLMgSJPHE47ZfHwHhm';
const EIA_BASE_URL = 'https://api.eia.gov/v2';

interface EIAResponse {
  response: {
    data: Array<{
      period: string;
      price?: number;
      consumption?: number;
      value?: number;
    }>;
  };
}

export interface EnergyData {
  electricityRate: number;  // $/kWh
  consumptionBenchmark: number;  // kWh/sq ft/month
  sunHoursPerDay: number;  // hours
}

export async function getEnergyData(state: string, sector: string = 'COM'): Promise<EnergyData> {
  try {
    // Get electricity rate
    const rateResponse = await fetch(
      `${EIA_BASE_URL}/electricity/retail-sales/data/?api_key=${EIA_API_KEY}&frequency=monthly&data[0]=price&facets[state][]=${state}&facets[sectorid][]=${sector}&sort[0][column]=period&sort[0][direction]=desc&length=1`
    );
    const rateData: EIAResponse = await rateResponse.json();
    const electricityRate = (rateData.response.data[0].price || 0.12) / 100; // Convert cents to dollars

    // Get consumption benchmark
    const consumptionResponse = await fetch(
      `${EIA_BASE_URL}/consumption/commercial/data/?api_key=${EIA_API_KEY}&frequency=monthly&data[0]=consumption&facets[state][]=${state}&sort[0][column]=period&sort[0][direction]=desc&length=1`
    );
    const consumptionData: EIAResponse = await consumptionResponse.json();
    const monthlyConsumption = consumptionData.response.data[0].consumption || 12; // kWh/sq ft/month

    // Get sun hours (using NREL data averages by state)
    const sunHoursResponse = await fetch(
      `${EIA_BASE_URL}/solar/data/?api_key=${EIA_API_KEY}&frequency=annual&data[0]=value&facets[state][]=${state}&sort[0][column]=period&sort[0][direction]=desc&length=1`
    );
    const sunHoursData: EIAResponse = await sunHoursResponse.json();
    const sunHoursPerDay = sunHoursData.response.data[0].value || 5; // Default to 5 hours if no data

    return {
      electricityRate,
      consumptionBenchmark: monthlyConsumption,
      sunHoursPerDay
    };
  } catch (error) {
    console.error('Error fetching EIA data:', error);
    // Return conservative default values if API fails
    return {
      electricityRate: 0.11,  // $0.11/kWh - conservative commercial rate
      consumptionBenchmark: 0.8,  // 0.8 kWh/sq ft/month - conservative usage
      sunHoursPerDay: 4.5  // 4.5 hours/day - conservative estimate
    };
  }
} 