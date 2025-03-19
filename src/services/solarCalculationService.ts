import type { BuildingInsightsResponse } from '../solar';

interface SolarSystemSpecs {
  panelAreaSqFt: number;  // Standard panel area in sq ft
  panelCapacityKw: number;  // Standard panel capacity in kW
  roofUsabilityFactor: number;  // Factor for usable roof area
  systemEfficiency: number;  // System performance efficiency
  costPerWatt: number;  // Installation cost per watt
}

interface EIAData {
  electricityRate: number;  // Local electricity rate in $/kWh
  consumptionBenchmark: number;  // Energy consumption benchmark in kWh/sq ft/month
  sunHoursPerDay: number;  // Average sun hours per day
}

export interface SolarCalculationResult {
  facilityMonthlyConsumptionKwh: number;
  monthlyElectricityCost: number;
  usableRooftopAreaSqft: number;
  numberOfSolarPanels: number;
  systemCapacityKw: number;
  monthlySolarGenerationKwh: number;
  energyOffsetPercentage: number;
  monthlySavings: number;
  installationCost: number;
  roiMonths: number;
  details: {
    facilityName: string;
    address: string;
    industry: string;
    buildingArea: number;
  };
}

const DEFAULT_SOLAR_SPECS: SolarSystemSpecs = {
  panelAreaSqFt: 17.6,  // Standard panel area in sq ft
  panelCapacityKw: 0.4,  // 400W panels are standard now
  roofUsabilityFactor: 0.7,  // More conservative usable roof factor
  systemEfficiency: 0.75,  // More conservative system efficiency including losses
  costPerWatt: 2.85  // Updated commercial installation cost per watt
};

export async function calculateSolarMetrics(
  buildingInsights: BuildingInsightsResponse,
  eiaData: EIAData,
  solarSpecs: SolarSystemSpecs = DEFAULT_SOLAR_SPECS
): Promise<SolarCalculationResult> {
  // 1. Calculate Usable Rooftop Area with more conservative factor
  const totalRoofArea = buildingInsights.solarPotential.wholeRoofStats.areaMeters2 * 10.764; // Convert m² to sq ft
  const usableRooftopArea = totalRoofArea * solarSpecs.roofUsabilityFactor;

  // 2. Calculate Monthly Energy Consumption - using more realistic EUI values
  const buildingArea = buildingInsights.buildingStats?.areaMeters2 
    ? buildingInsights.buildingStats.areaMeters2 * 10.764  // Convert m² to sq ft
    : totalRoofArea * 2; // Estimate building area if not available
  
  const monthlyConsumption = buildingArea * eiaData.consumptionBenchmark * 0.85; // Adding 15% reduction factor

  // 3. Calculate Monthly Electricity Cost with demand charges
  const monthlyElectricityCost = monthlyConsumption * eiaData.electricityRate * 1.2; // Adding 20% for demand charges

  // 4. Calculate Solar System Sizing with realistic constraints
  const maxPanels = Math.floor(usableRooftopArea / solarSpecs.panelAreaSqFt);
  const numberOfPanels = Math.min(maxPanels, Math.ceil(monthlyConsumption * 12 / (solarSpecs.panelCapacityKw * 1400))); // 1400 kWh/kW/year is typical
  const systemCapacity = numberOfPanels * solarSpecs.panelCapacityKw;
  
  // More conservative generation calculation
  const avgDailyProduction = systemCapacity * eiaData.sunHoursPerDay * solarSpecs.systemEfficiency;
  const monthlySolarGeneration = avgDailyProduction * 30 * 0.95; // Adding 5% system downtime

  // 5. Calculate Energy Offset and Savings with degradation
  const firstYearOffset = Math.min(monthlySolarGeneration, monthlyConsumption);
  const energyOffsetPercentage = (firstYearOffset / monthlyConsumption) * 100;
  const firstYearMonthlySavings = firstYearOffset * eiaData.electricityRate;

  // 6. Calculate Installation Cost with realistic pricing
  const installationCost = systemCapacity * 1000 * solarSpecs.costPerWatt;
  
  // More realistic ROI calculation considering degradation and maintenance
  const monthlyDegradation = 0.004; // 0.4% monthly degradation
  let totalSavings = 0;
  let roiMonths = 0;
  
  for (let month = 1; month <= 240; month++) { // 20 years
    const degradedSavings = firstYearMonthlySavings * Math.pow(1 - monthlyDegradation, month);
    totalSavings += degradedSavings;
    if (totalSavings >= installationCost && roiMonths === 0) {
      roiMonths = month;
    }
  }

  return {
    facilityMonthlyConsumptionKwh: monthlyConsumption,
    monthlyElectricityCost: monthlyElectricityCost,
    usableRooftopAreaSqft: usableRooftopArea,
    numberOfSolarPanels: numberOfPanels,
    systemCapacityKw: systemCapacity,
    monthlySolarGenerationKwh: monthlySolarGeneration,
    energyOffsetPercentage: energyOffsetPercentage,
    monthlySavings: firstYearMonthlySavings,
    installationCost: installationCost,
    roiMonths: roiMonths,
    details: {
      facilityName: buildingInsights.name,
      address: `${buildingInsights.address?.city}, ${buildingInsights.address?.state}`,
      industry: buildingInsights.industry || 'Unknown',
      buildingArea: buildingArea
    }
  };
} 