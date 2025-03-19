import { EIA_API_KEY } from './eiaService';

interface RateEscalation {
  national: number;  // National default rate escalation percentage
  county: Record<string, number>;  // County-specific rate escalation percentages
}

export interface BillComponents {
  baseEnergyRate: number;  // Base energy rate in $/kWh
  deliveryCharges: number;  // Delivery charges in $/kWh
  demandCharges: number;  // Demand charges in $/kW
  regulatoryFees: number;  // Regulatory fees in $/kWh
  locationSurcharges: number;  // Location-specific surcharges in $/kWh
}

export interface EnergyRateDetails {
  totalRate: number;  // Total electricity rate in $/kWh
  components: BillComponents;  // Breakdown of rate components
  historicalRates: Array<{date: string, rate: number}>;  // Historical rate data
  projectedRates: Array<{year: number, rate: number}>;  // Projected future rates
  regionalAverage: number;  // Regional average rate for comparison
  escalationRate: number;  // Annual rate escalation percentage
}

// Default rate escalation values
const DEFAULT_RATE_ESCALATION: RateEscalation = {
  national: 4.23,  // 4.23% national default
  county: {
    // Sample county-specific values
    'Los Angeles County, CA': 5.2,
    'Cook County, IL': 4.8,
    'King County, WA': 3.9,
    'Harris County, TX': 3.7,
    'Maricopa County, AZ': 4.5
  }
};

/**
 * Fetches detailed electricity rate data from EIA API
 * 
 * @param state Two-letter state code
 * @param county Optional county name
 * @param sector Sector code (RES for residential, COM for commercial)
 * @returns Promise with detailed energy rate information
 */
export async function getDetailedEnergyRates(
  state: string, 
  county?: string,
  sector: string = 'COM'
): Promise<EnergyRateDetails> {
  try {
    // Get base electricity rate
    const rateResponse = await fetch(
      `https://api.eia.gov/v2/electricity/retail-sales/data/?api_key=${EIA_API_KEY}&frequency=monthly&data[0]=price&facets[state][]=${state}&facets[sectorid][]=${sector}&sort[0][column]=period&sort[0][direction]=desc&length=12`
    );
    const rateData = await rateResponse.json();
    
    // Calculate current rate (most recent month)
    const currentRate = (rateData.response.data[0]?.price || 12) / 100; // Convert cents to dollars
    
    // Extract historical rates (past 12 months)
    const historicalRates = rateData.response.data.map((item: any) => ({
      date: item.period,
      rate: (item.price || 0) / 100 // Convert cents to dollars
    }));
    
    // Get regional average for comparison
    const regionalResponse = await fetch(
      `https://api.eia.gov/v2/electricity/retail-sales/data/?api_key=${EIA_API_KEY}&frequency=monthly&data[0]=price&facets[census_division_name][]=${getCensusDivision(state)}&facets[sectorid][]=${sector}&sort[0][column]=period&sort[0][direction]=desc&length=1`
    );
    const regionalData = await regionalResponse.json();
    const regionalAverage = (regionalData.response.data[0]?.price || 0) / 100;
    
    // Determine rate escalation
    let escalationRate = DEFAULT_RATE_ESCALATION.national;
    if (county && DEFAULT_RATE_ESCALATION.county[`${county}, ${state}`]) {
      escalationRate = DEFAULT_RATE_ESCALATION.county[`${county}, ${state}`];
    }
    
    // Calculate projected rates for next 25 years
    const projectedRates = [];
    const currentYear = new Date().getFullYear();
    let projectedRate = currentRate;
    
    for (let year = currentYear; year < currentYear + 25; year++) {
      projectedRates.push({
        year,
        rate: projectedRate
      });
      projectedRate *= (1 + (escalationRate / 100)); // Apply annual escalation
    }
    
    // Create bill components breakdown (estimated percentages)
    const components: BillComponents = {
      baseEnergyRate: currentRate * 0.55, // ~55% of total
      deliveryCharges: currentRate * 0.25, // ~25% of total
      demandCharges: 10.5, // Flat rate per kW (not per kWh)
      regulatoryFees: currentRate * 0.12, // ~12% of total
      locationSurcharges: currentRate * 0.08 // ~8% of total
    };
    
    return {
      totalRate: currentRate,
      components,
      historicalRates,
      projectedRates,
      regionalAverage,
      escalationRate
    };
  } catch (error) {
    console.error('Error fetching detailed energy rates:', error);
    
    // Return default values if API fails
    const currentRate = 0.12; // Default to $0.12/kWh
    const currentYear = new Date().getFullYear();
    
    return {
      totalRate: currentRate,
      components: {
        baseEnergyRate: currentRate * 0.55,
        deliveryCharges: currentRate * 0.25,
        demandCharges: 10.5,
        regulatoryFees: currentRate * 0.12,
        locationSurcharges: currentRate * 0.08
      },
      historicalRates: Array(12).fill(0).map((_, i) => ({
        date: `${currentYear - 1}-${(12 - i).toString().padStart(2, '0')}`,
        rate: currentRate * (1 - (i * 0.005)) // Slight decrease for older months
      })),
      projectedRates: Array(25).fill(0).map((_, i) => ({
        year: currentYear + i,
        rate: currentRate * Math.pow(1.0423, i) // Apply default 4.23% escalation
      })),
      regionalAverage: currentRate * 0.95,
      escalationRate: DEFAULT_RATE_ESCALATION.national
    };
  }
}

/**
 * Maps a state to its Census Division
 * 
 * @param state Two-letter state code
 * @returns Census division name
 */
function getCensusDivision(state: string): string {
  const divisions: Record<string, string> = {
    'CT': 'New England', 'ME': 'New England', 'MA': 'New England', 
    'NH': 'New England', 'RI': 'New England', 'VT': 'New England',
    'NJ': 'Middle Atlantic', 'NY': 'Middle Atlantic', 'PA': 'Middle Atlantic',
    'IL': 'East North Central', 'IN': 'East North Central', 'MI': 'East North Central', 
    'OH': 'East North Central', 'WI': 'East North Central',
    'IA': 'West North Central', 'KS': 'West North Central', 'MN': 'West North Central', 
    'MO': 'West North Central', 'NE': 'West North Central', 'ND': 'West North Central', 'SD': 'West North Central',
    'DE': 'South Atlantic', 'FL': 'South Atlantic', 'GA': 'South Atlantic', 'MD': 'South Atlantic', 
    'NC': 'South Atlantic', 'SC': 'South Atlantic', 'VA': 'South Atlantic', 'DC': 'South Atlantic', 'WV': 'South Atlantic',
    'AL': 'East South Central', 'KY': 'East South Central', 'MS': 'East South Central', 'TN': 'East South Central',
    'AR': 'West South Central', 'LA': 'West South Central', 'OK': 'West South Central', 'TX': 'West South Central',
    'AZ': 'Mountain', 'CO': 'Mountain', 'ID': 'Mountain', 'MT': 'Mountain', 
    'NV': 'Mountain', 'NM': 'Mountain', 'UT': 'Mountain', 'WY': 'Mountain',
    'CA': 'Pacific', 'OR': 'Pacific', 'WA': 'Pacific', 'AK': 'Pacific', 'HI': 'Pacific'
  };
  
  return divisions[state] || 'Pacific'; // Default to Pacific if not found
} 