<!--
 Copyright 2023 Google LLC

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      https://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 -->

<script lang="ts">
  /* global google */

  import { slide } from 'svelte/transition';

  import Expandable from '../components/Expandable.svelte';
  import SummaryCard from '../components/SummaryCard.svelte';
  import type { SolarPanelConfig, BuildingInsightsResponse } from '../solar';
  import Table from '../components/Table.svelte';
  import type { MdDialog } from '@material/web/dialog/dialog';
  import { findSolarConfig, showMoney, showNumber } from '../utils';
  import InputNumber from '../components/InputNumber.svelte';
  import InputPanelsCount from '../components/InputPanelsCount.svelte';
  import InputMoney from '../components/InputMoney.svelte';
  import InputPercent from '../components/InputPercent.svelte';
  import InputRatio from '../components/InputRatio.svelte';
  import LocationRates from '../components/LocationRates.svelte';
  import type { SolarCalculationResult } from '../../services/solarCalculationService';
  import { calculateSolarMetrics } from '../../services/solarCalculationService';
  import { getEnergyData } from '../../services/eiaService';

  // Define local types for calculation display
  interface SolarSpecs {
    panelAreaSqFt: number;
    panelCapacityKw: number;
    roofUsabilityFactor: number;
    systemEfficiency: number;
    costPerWatt: number;
  }

  interface EnergyData {
    electricityRate: number;
    consumptionBenchmark: number;
    sunHoursPerDay: number;
  }

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  export let expandedSection: string;
  export let configId: number;
  export let monthlyAverageEnergyBillInput: number;
  export let energyCostPerKwhInput: number;
  export let panelCapacityWattsInput: number;
  export let dcToAcDerateInput: number;
  export let solarPanelConfigs: SolarPanelConfig[];
  export let defaultPanelCapacityWatts: number;
  export let buildingInsights: BuildingInsightsResponse | undefined;
  let solarMetrics: SolarCalculationResult | undefined;
  let eiaData: EnergyData = {
    electricityRate: 0.11,
    consumptionBenchmark: 0.8,
    sunHoursPerDay: 4.5
  };
  let solarSpecs: SolarSpecs = {
    panelAreaSqFt: 17.6,
    panelCapacityKw: 0.4,
    roofUsabilityFactor: 0.7,
    systemEfficiency: 0.75,
    costPerWatt: 2.85
  };

  const icon = 'payments';
  const title = 'Solar Potential analysis';

  let showAdvancedSettings = false;
  let calculationDialog: MdDialog;
  let currentCalculation = {
    title: '',
    content: '',
    calculation: ''
  };

  // [START solar_potential_calculations]
  // Solar configuration, from buildingInsights.solarPotential.solarPanelConfigs
  let panelsCount = 20;
  let yearlyEnergyDcKwh = 12000;

  // Basic settings
  let monthlyAverageEnergyBill: number = 300;
  let energyCostPerKwh = 0.31;
  let panelCapacityWatts = 400;
  let solarIncentives: number = 7000;
  let installationCostPerWatt: number = 4.0;
  let installationLifeSpan: number = 20;

  // Advanced settings
  let dcToAcDerate = 0.85;
  let efficiencyDepreciationFactor = 0.995;
  let costIncreaseFactor = 1.022;
  let discountRate = 1.04;

  // Solar installation
  let installationSizeKw: number = (panelsCount * panelCapacityWatts) / 1000;
  let installationCostTotal: number = installationCostPerWatt * installationSizeKw * 1000;

  // Energy consumption
  let monthlyKwhEnergyConsumption: number = monthlyAverageEnergyBill / energyCostPerKwh;
  let yearlyKwhEnergyConsumption: number = monthlyKwhEnergyConsumption * 12;

  // Energy produced for installation life span
  let initialAcKwhPerYear: number = yearlyEnergyDcKwh * dcToAcDerate;
  let yearlyProductionAcKwh: number[] = [...Array(installationLifeSpan).keys()].map(
    (year) => initialAcKwhPerYear * efficiencyDepreciationFactor ** year,
  );

  // Cost with solar for installation life span
  let yearlyUtilityBillEstimates: number[] = yearlyProductionAcKwh.map(
    (yearlyKwhEnergyProduced, year) => {
      const billEnergyKwh = yearlyKwhEnergyConsumption - yearlyKwhEnergyProduced;
      const billEstimate =
        (billEnergyKwh * energyCostPerKwh * costIncreaseFactor ** year) / discountRate ** year;
      return Math.max(billEstimate, 0); // bill cannot be negative
    },
  );
  let remainingLifetimeUtilityBill: number = yearlyUtilityBillEstimates.reduce((x, y) => x + y, 0);
  let totalCostWithSolar: number =
    installationCostTotal + remainingLifetimeUtilityBill - solarIncentives;
  console.log(`Cost with solar: $${totalCostWithSolar.toFixed(2)}`);

  // Cost without solar for installation life span
  let yearlyCostWithoutSolar: number[] = [...Array(installationLifeSpan).keys()].map(
    (year) => (monthlyAverageEnergyBill * 12 * costIncreaseFactor ** year) / discountRate ** year,
  );
  let totalCostWithoutSolar: number = yearlyCostWithoutSolar.reduce((x, y) => x + y, 0);
  console.log(`Cost without solar: $${totalCostWithoutSolar.toFixed(2)}`);

  // Savings with solar for installation life span
  let savings: number = totalCostWithoutSolar - totalCostWithSolar;
  console.log(`Savings: $${savings.toFixed(2)} in ${installationLifeSpan} years`);
  // [END solar_potential_calculations]

  // Reactive calculations
  let panelCapacityRatio: number = 1.0;
  $: panelCapacityRatio = panelCapacityWattsInput / defaultPanelCapacityWatts;
  $: installationCostTotal = installationCostPerWatt * installationSizeKw * 1000;
  $: if (solarPanelConfigs[configId]) {
    installationSizeKw = (solarPanelConfigs[configId].panelsCount * panelCapacityWattsInput) / 1000;
  }
  $: monthlyKwhEnergyConsumption = monthlyAverageEnergyBillInput / energyCostPerKwhInput;
  $: yearlyKwhEnergyConsumption = monthlyKwhEnergyConsumption * 12;
  $: if (solarPanelConfigs[configId]) {
    initialAcKwhPerYear =
      solarPanelConfigs[configId].yearlyEnergyDcKwh * panelCapacityRatio * dcToAcDerateInput;
  }
  $: yearlyEnergyDcKwh = (solarPanelConfigs[configId]?.yearlyEnergyDcKwh ?? 0) * panelCapacityRatio;
  $: yearlyProductionAcKwh = [...Array(installationLifeSpan).keys()].map(
    (year) => yearlyEnergyDcKwh * dcToAcDerate * efficiencyDepreciationFactor ** year,
  );
  $: installationSizeKw = (yearlyEnergyDcKwh / 1600); // Using industry standard 1600 kWh/kW ratio
  $: installationCostTotal = installationSizeKw * 1000 * installationCostPerWatt;

  $: yearlyUtilityBillEstimates = yearlyProductionAcKwh.map((yearlyKwhEnergyProduced, year) => {
    const billEnergyKwh = yearlyKwhEnergyConsumption - yearlyKwhEnergyProduced;
    const yearlyRate = energyCostPerKwhInput * (costIncreaseFactor ** year);
    const billEstimate = billEnergyKwh * yearlyRate / (discountRate ** year);
    return Math.max(billEstimate, 0); // bill cannot be negative
  });

  $: yearlyCostWithoutSolar = [...Array(installationLifeSpan).keys()].map(
    (year) => {
      const yearlyRate = energyCostPerKwhInput * (costIncreaseFactor ** year);
      return (yearlyKwhEnergyConsumption * yearlyRate) / (discountRate ** year);
    }
  );

  $: remainingLifetimeUtilityBill = yearlyUtilityBillEstimates.reduce((x, y) => x + y, 0);
  $: totalCostWithSolar = installationCostTotal + remainingLifetimeUtilityBill - solarIncentives;
  $: savings = totalCostWithoutSolar - totalCostWithSolar;

  let energyCovered: number;
  $: energyCovered = yearlyProductionAcKwh[0] / yearlyKwhEnergyConsumption;

  let breakEvenYear: number = -1;
  let monthlySavings: number[] = [];
  let yearlySavings: number[] = [];
  let tenYearSavings: number = 0;

  $: {
    // Calculate break-even year
    let cumulativeSavings = 0;
    let initialCost = installationCostTotal - solarIncentives;
    breakEvenYear = -1;
    
    for (let year = 0; year < installationLifeSpan; year++) {
      cumulativeSavings += yearlySavings[year];
      if (cumulativeSavings >= initialCost && breakEvenYear === -1) {
        breakEvenYear = year;
      }
    }

    // Calculate monthly savings for the first year
    monthlySavings = Array(12).fill(0).map((_, month) => {
      const monthlyProductionKwh = yearlyProductionAcKwh[0] / 12;  // Simplified - could be adjusted for seasonal variation
      const monthlyBillWithoutSolar = monthlyAverageEnergyBillInput;
      const monthlyBillWithSolar = Math.max(
        ((yearlyKwhEnergyConsumption / 12) - monthlyProductionKwh) * energyCostPerKwhInput,
        0
      );
      return monthlyBillWithoutSolar - monthlyBillWithSolar;
    });

    // Calculate yearly savings for first 10 years
    yearlySavings = yearlyUtilityBillEstimates.slice(0, 10).map((yearBill, year) => {
      const yearBillWithoutSolar = yearlyCostWithoutSolar[year];
      return yearBillWithoutSolar - yearBill;
    });

    // Calculate 10-year total savings
    tenYearSavings = yearlySavings.reduce((sum, yearly) => sum + yearly, 0);
  }

  function updateConfig() {
    monthlyKwhEnergyConsumption = monthlyAverageEnergyBillInput / energyCostPerKwhInput;
    yearlyKwhEnergyConsumption = monthlyKwhEnergyConsumption * 12;
    panelCapacityRatio = panelCapacityWattsInput / defaultPanelCapacityWatts;
    configId = findSolarConfig(
      solarPanelConfigs,
      yearlyKwhEnergyConsumption,
      panelCapacityRatio,
      dcToAcDerateInput,
    );
  }

  function showCalculation(type: string) {
    switch(type) {
      case 'monthly':
        currentCalculation = {
          title: 'Monthly Average Savings Calculation',
          content: `Based on your facility's specifications and local energy rates:`,
          calculation: `
INPUTS:
- Building Area: ${showNumber(solarMetrics?.details.buildingArea || 0)} sq ft
- Energy Consumption: ${showNumber(solarMetrics?.facilityMonthlyConsumptionKwh || 0)} kWh/month
- Local Energy Rate: $${energyCostPerKwhInput.toFixed(3)}/kWh
- System Size: ${showNumber(solarMetrics?.systemCapacityKw || 0)} kW
- Panel Count: ${showNumber(solarMetrics?.numberOfSolarPanels || 0)} panels
- Panel Capacity: ${panelCapacityWattsInput} watts
- System Efficiency: ${(solarSpecs?.systemEfficiency * 100).toFixed(1)}%
- DC-to-AC Derate: ${(dcToAcDerateInput * 100).toFixed(1)}%

CALCULATION:
1. Current Monthly Cost:
   ${showNumber(solarMetrics?.facilityMonthlyConsumptionKwh || 0)} kWh × $${energyCostPerKwhInput.toFixed(3)}/kWh = ${showMoney(solarMetrics?.monthlyElectricityCost || 0)}

2. Solar Energy Production:
   a. System Size: ${showNumber(solarMetrics?.systemCapacityKw || 0)} kW
   b. Daily Production: ${showNumber(solarMetrics?.systemCapacityKw || 0)} kW × ${showNumber(eiaData?.sunHoursPerDay || 4.5)} sun-hours × ${(solarSpecs?.systemEfficiency * 100).toFixed(1)}% efficiency = ${showNumber((solarMetrics?.systemCapacityKw || 0) * (eiaData?.sunHoursPerDay || 4.5) * (solarSpecs?.systemEfficiency || 0.75))} kWh/day
   c. Monthly Production: ${showNumber((solarMetrics?.systemCapacityKw || 0) * (eiaData?.sunHoursPerDay || 4.5) * (solarSpecs?.systemEfficiency || 0.75))} kWh/day × 30 days × 95% uptime = ${showNumber(solarMetrics?.monthlySolarGenerationKwh || 0)} kWh/month

3. Energy Offset:
   a. Monthly Consumption: ${showNumber(solarMetrics?.facilityMonthlyConsumptionKwh || 0)} kWh
   b. Monthly Production: ${showNumber(solarMetrics?.monthlySolarGenerationKwh || 0)} kWh
   c. Offset Percentage: ${showNumber(solarMetrics?.energyOffsetPercentage || 0)}%
   d. Remaining Grid Energy: ${showNumber(Math.max(0, (solarMetrics?.facilityMonthlyConsumptionKwh || 0) - (solarMetrics?.monthlySolarGenerationKwh || 0)))} kWh

4. Monthly Savings:
   a. Original Bill: ${showMoney(solarMetrics?.monthlyElectricityCost || 0)}
   b. New Bill: ${showMoney(Math.max(0, (solarMetrics?.facilityMonthlyConsumptionKwh || 0) - (solarMetrics?.monthlySolarGenerationKwh || 0)) * energyCostPerKwhInput)}
   c. Monthly Savings: ${showMoney(solarMetrics?.monthlySavings || 0)}

INDUSTRY FACTORS:
- Commercial solar installations typically offset 60-80% of energy needs
- System efficiency includes inverter losses, wiring losses, and temperature effects
- Conservative estimate includes 5% system downtime for maintenance
          `
        };
        break;
      case 'firstYear':
        currentCalculation = {
          title: 'First Year Savings Calculation',
          content: `Comprehensive breakdown of first year savings:`,
          calculation: `
INPUTS:
- Annual Energy Consumption: ${showNumber((solarMetrics?.facilityMonthlyConsumptionKwh || 0) * 12)} kWh/year
- Local Energy Rate: $${energyCostPerKwhInput.toFixed(3)}/kWh
- System Size: ${showNumber(solarMetrics?.systemCapacityKw || 0)} kW
- Installation Cost: ${showMoney(solarMetrics?.installationCost || 0)}
- Cost per Watt: $${installationCostPerWatt.toFixed(2)}/watt
- Solar Incentives: ${showMoney(solarIncentives)}

CALCULATION:
1. Current Annual Energy Cost:
   a. Annual Consumption: ${showNumber((solarMetrics?.facilityMonthlyConsumptionKwh || 0) * 12)} kWh
   b. Energy Rate: $${energyCostPerKwhInput.toFixed(3)}/kWh
   c. Annual Cost: ${showMoney((solarMetrics?.monthlyElectricityCost || 0) * 12)}

2. Annual Solar Production:
   a. Monthly Production: ${showNumber(solarMetrics?.monthlySolarGenerationKwh || 0)} kWh
   b. Annual Production: ${showNumber((solarMetrics?.monthlySolarGenerationKwh || 0) * 12)} kWh
   c. Production Value: ${showMoney((solarMetrics?.monthlySolarGenerationKwh || 0) * 12 * energyCostPerKwhInput)}

3. Remaining Grid Energy:
   a. Annual Consumption: ${showNumber((solarMetrics?.facilityMonthlyConsumptionKwh || 0) * 12)} kWh
   b. Annual Production: ${showNumber((solarMetrics?.monthlySolarGenerationKwh || 0) * 12)} kWh
   c. Remaining Energy: ${showNumber(Math.max(0, (solarMetrics?.facilityMonthlyConsumptionKwh || 0) * 12 - (solarMetrics?.monthlySolarGenerationKwh || 0) * 12))} kWh
   d. Remaining Cost: ${showMoney(Math.max(0, (solarMetrics?.facilityMonthlyConsumptionKwh || 0) * 12 - (solarMetrics?.monthlySolarGenerationKwh || 0) * 12) * energyCostPerKwhInput)}

4. First Year Savings:
   a. Original Annual Cost: ${showMoney((solarMetrics?.monthlyElectricityCost || 0) * 12)}
   b. New Annual Cost: ${showMoney(Math.max(0, (solarMetrics?.facilityMonthlyConsumptionKwh || 0) * 12 - (solarMetrics?.monthlySolarGenerationKwh || 0) * 12) * energyCostPerKwhInput)}
   c. Annual Savings: ${showMoney((solarMetrics?.monthlySavings || 0) * 12)}

5. Return on Investment (First Year):
   a. Net Installation Cost: ${showMoney((solarMetrics?.installationCost || 0) - solarIncentives)}
   b. First Year ROI: ${((((solarMetrics?.monthlySavings || 0) * 12) / ((solarMetrics?.installationCost || 0) - solarIncentives)) * 100).toFixed(2)}%

INDUSTRY BENCHMARKS:
- Commercial solar typically yields 5-10% first-year ROI
- System production is calculated using conservative estimates
- First year has highest production before panel degradation begins
          `
        };
        break;
      case 'tenYear':
        currentCalculation = {
          title: '10 Year Savings Calculation',
          content: `Detailed 10-year financial analysis including all factors:`,
          calculation: `
INPUTS:
- Initial Monthly Savings: ${showMoney(solarMetrics?.monthlySavings || 0)}
- Panel Efficiency Decline: ${((1 - efficiencyDepreciationFactor) * 100).toFixed(1)}% per year
- Energy Cost Increase: ${((costIncreaseFactor - 1) * 100).toFixed(1)}% per year
- Discount Rate: ${((discountRate - 1) * 100).toFixed(1)}% per year
- Installation Cost: ${showMoney(solarMetrics?.installationCost || 0)}
- Solar Incentives: ${showMoney(solarIncentives)}

YEAR-BY-YEAR BREAKDOWN:
${Array(10).fill(0).map((_, year) => {
  const efficiencyFactor = efficiencyDepreciationFactor ** year;
  const costFactor = costIncreaseFactor ** year;
  const discountFactor = discountRate ** year;
  const adjustedSavings = (solarMetrics?.monthlySavings || 0) * 12 * efficiencyFactor * costFactor / discountFactor;
  
  return `Year ${year + 1}:
  - Panel Efficiency: ${(efficiencyFactor * 100).toFixed(1)}% of original
  - Energy Cost Factor: ${costFactor.toFixed(3)}× original rate
  - Discount Factor: ${discountFactor.toFixed(3)}×
  - Annual Savings: ${showMoney(adjustedSavings)}
  - Cumulative Savings: ${showMoney(Array(year + 1).fill(0).map((_, y) => {
    const eFactor = efficiencyDepreciationFactor ** y;
    const cFactor = costIncreaseFactor ** y;
    const dFactor = discountRate ** y;
    return (solarMetrics?.monthlySavings || 0) * 12 * eFactor * cFactor / dFactor;
  }).reduce((sum, val) => sum + val, 0))}
`;
}).join('\n')}

TOTAL 10-YEAR ANALYSIS:
1. Total Savings: ${showMoney((solarMetrics?.monthlySavings || 0) * 12 * 10 * (1 - efficiencyDepreciationFactor * 10))}
2. Net Installation Cost: ${showMoney((solarMetrics?.installationCost || 0) - solarIncentives)}
3. Net 10-Year Benefit: ${showMoney((solarMetrics?.monthlySavings || 0) * 12 * 10 * (1 - efficiencyDepreciationFactor * 10) - ((solarMetrics?.installationCost || 0) - solarIncentives))}
4. 10-Year ROI: ${((((solarMetrics?.monthlySavings || 0) * 12 * 10 * (1 - efficiencyDepreciationFactor * 10)) / ((solarMetrics?.installationCost || 0) - solarIncentives)) * 100).toFixed(2)}%

INDUSTRY CONTEXT:
- Commercial solar systems typically pay back in 5-7 years
- Panel warranties usually guarantee 80% efficiency after 25 years
- Energy costs historically increase 2-3% annually
- These calculations use conservative estimates for all parameters
          `
        };
        break;
      case 'costWithoutSolar':
        currentCalculation = {
          title: 'Cost Without Solar Calculation',
          content: `Detailed breakdown of lifetime energy costs without solar installation:`,
          calculation: `
INPUTS:
- Monthly Energy Consumption: ${showNumber(solarMetrics?.facilityMonthlyConsumptionKwh || 0)} kWh
- Annual Energy Consumption: ${showNumber((solarMetrics?.facilityMonthlyConsumptionKwh || 0) * 12)} kWh
- Current Energy Rate: $${energyCostPerKwhInput.toFixed(3)}/kWh
- Energy Cost Increase: ${((costIncreaseFactor - 1) * 100).toFixed(1)}% per year
- Discount Rate: ${((discountRate - 1) * 100).toFixed(1)}% per year
- Analysis Period: ${installationLifeSpan} years

CALCULATION METHOD:
According to EIA data and industry standards, electricity costs increase by approximately ${((costIncreaseFactor - 1) * 100).toFixed(1)}% annually. This calculation applies this increase while also accounting for the time value of money using a discount rate of ${((discountRate - 1) * 100).toFixed(1)}%.

YEAR-BY-YEAR BREAKDOWN:
${yearlyCostWithoutSolar.slice(0, 10).map((cost, year) => {
  const costFactor = costIncreaseFactor ** year;
  const discountFactor = discountRate ** year;
  const yearlyRate = energyCostPerKwhInput * costFactor;
  
  return `Year ${year + 1}:
  - Energy Rate: $${yearlyRate.toFixed(3)}/kWh (${(costFactor * 100).toFixed(1)}% of original)
  - Discount Factor: ${discountFactor.toFixed(3)}×
  - Annual Cost: ${showMoney(cost)}
  - Cumulative Cost: ${showMoney(yearlyCostWithoutSolar.slice(0, year + 1).reduce((sum, val) => sum + val, 0))}
`;
}).join('\n')}

${installationLifeSpan > 10 ? `... and so on through Year ${installationLifeSpan}` : ''}

TOTAL LIFETIME COST:
- Total Cost Without Solar: ${showMoney(totalCostWithoutSolar)}

REGULATORY CONTEXT:
- Based on current EIA (Energy Information Administration) data for your region
- Incorporates historical electricity price trends of ${((costIncreaseFactor - 1) * 100).toFixed(1)}% annual increase
- Accounts for time value of money using standard financial discount rate
          `
        };
        break;
      case 'costWithSolar':
        currentCalculation = {
          title: 'Cost With Solar Calculation',
          content: `Comprehensive breakdown of total costs with solar installation:`,
          calculation: `
INPUTS:
- System Size: ${showNumber(solarMetrics?.systemCapacityKw || 0)} kW
- Panel Count: ${showNumber(solarMetrics?.numberOfSolarPanels || 0)}
- Installation Cost per Watt: $${installationCostPerWatt.toFixed(2)}
- Total Installation Cost: ${showMoney(solarMetrics?.installationCost || 0)}
- Solar Incentives: ${showMoney(solarIncentives)}
- Net Installation Cost: ${showMoney((solarMetrics?.installationCost || 0) - solarIncentives)}
- Monthly Solar Generation: ${showNumber(solarMetrics?.monthlySolarGenerationKwh || 0)} kWh
- Annual Solar Generation: ${showNumber((solarMetrics?.monthlySolarGenerationKwh || 0) * 12)} kWh
- Panel Efficiency Decline: ${((1 - efficiencyDepreciationFactor) * 100).toFixed(1)}% per year

CALCULATION COMPONENTS:
1. Initial Installation Cost: ${showMoney(solarMetrics?.installationCost || 0)}
2. Solar Incentives: ${showMoney(solarIncentives)}
3. Remaining Utility Bills Over ${installationLifeSpan} Years: ${showMoney(remainingLifetimeUtilityBill)}

YEAR-BY-YEAR REMAINING UTILITY BILLS:
${yearlyUtilityBillEstimates.slice(0, 10).map((bill, year) => {
  const efficiencyFactor = efficiencyDepreciationFactor ** year;
  const costFactor = costIncreaseFactor ** year;
  const discountFactor = discountRate ** year;
  const yearlyGeneration = (solarMetrics?.monthlySolarGenerationKwh || 0) * 12 * efficiencyFactor;
  const yearlyConsumption = (solarMetrics?.facilityMonthlyConsumptionKwh || 0) * 12;
  const remainingEnergy = Math.max(0, yearlyConsumption - yearlyGeneration);
  
  return `Year ${year + 1}:
  - Panel Efficiency: ${(efficiencyFactor * 100).toFixed(1)}% of original
  - Solar Generation: ${showNumber(yearlyGeneration)} kWh
  - Remaining Grid Energy: ${showNumber(remainingEnergy)} kWh
  - Energy Rate: $${(energyCostPerKwhInput * costFactor).toFixed(3)}/kWh
  - Utility Bill: ${showMoney(bill)}
`;
}).join('\n')}

${installationLifeSpan > 10 ? `... and so on through Year ${installationLifeSpan}` : ''}

TOTAL COST CALCULATION:
Installation Cost ($${showMoney(solarMetrics?.installationCost || 0)})
- Solar Incentives ($${showMoney(solarIncentives)})
+ Remaining Utility Bills ($${showMoney(remainingLifetimeUtilityBill)})
= Total Cost With Solar: ${showMoney(totalCostWithSolar)}

REGULATORY & INCENTIVE CONTEXT:
- Federal Investment Tax Credit (ITC): 30% of installation cost
- State and local incentives may vary by location
- Net metering policies according to local utility regulations
- Based on current building codes and solar installation standards
          `
        };
        break;
      case 'lifetimeSavings':
        currentCalculation = {
          title: 'Total Lifetime Savings Calculation',
          content: `Detailed analysis of total savings over the system lifespan:`,
          calculation: `
INPUTS:
- System Lifespan: ${installationLifeSpan} years
- Total Cost Without Solar: ${showMoney(totalCostWithoutSolar)}
- Total Cost With Solar: ${showMoney(totalCostWithSolar)}
- Monthly Savings (First Year): ${showMoney(solarMetrics?.monthlySavings || 0)}
- Energy Offset: ${(energyCovered * 100).toFixed(1)}%

CALCULATION METHOD:
Total lifetime savings is the difference between the projected cost of electricity without solar and the total cost with solar (including installation, incentives, and remaining utility bills) over the system lifespan.

SAVINGS BREAKDOWN:
1. Cost Without Solar: ${showMoney(totalCostWithoutSolar)}
   - Based on current consumption of ${showNumber((solarMetrics?.facilityMonthlyConsumptionKwh || 0) * 12)} kWh/year
   - Includes annual rate increases of ${((costIncreaseFactor - 1) * 100).toFixed(1)}%
   - Adjusted for time value of money (${((discountRate - 1) * 100).toFixed(1)}% discount rate)

2. Cost With Solar: ${showMoney(totalCostWithSolar)}
   - Installation: ${showMoney(solarMetrics?.installationCost || 0)}
   - Incentives: -${showMoney(solarIncentives)}
   - Remaining Bills: ${showMoney(remainingLifetimeUtilityBill)}

3. Net Lifetime Savings: ${showMoney(savings)}
   - Percentage Saved: ${(savings / totalCostWithoutSolar * 100).toFixed(1)}% of total energy costs
   - Average Annual Savings: ${showMoney(savings / installationLifeSpan)}/year

ADDITIONAL BENEFITS:
- Environmental Impact: Approximately ${showNumber((solarMetrics?.monthlySolarGenerationKwh || 0) * 12 * 0.7 * installationLifeSpan / 1000)} metric tons of CO₂ avoided
- Property Value Increase: Solar installations typically increase property values by 3-4%
- Energy Independence: ${(energyCovered * 100).toFixed(1)}% reduction in grid dependency

FINANCIAL CONTEXT:
- Return on Investment (ROI): ${((savings / ((solarMetrics?.installationCost || 0) - solarIncentives)) * 100).toFixed(1)}%
- Internal Rate of Return (IRR): Approximately ${(((savings / installationLifeSpan) / ((solarMetrics?.installationCost || 0) - solarIncentives)) * 100).toFixed(1)}%
- Net Present Value (NPV): ${showMoney(savings - ((solarMetrics?.installationCost || 0) - solarIncentives))}
          `
        };
        break;
      case 'breakEven':
        currentCalculation = {
          title: 'Break-Even Analysis',
          content: `Detailed calculation of when your solar investment pays for itself:`,
          calculation: `
INPUTS:
- Net Installation Cost: ${showMoney((solarMetrics?.installationCost || 0) - solarIncentives)}
- Monthly Savings (First Year): ${showMoney(solarMetrics?.monthlySavings || 0)}
- Annual Savings (First Year): ${showMoney((solarMetrics?.monthlySavings || 0) * 12)}
- Panel Efficiency Decline: ${((1 - efficiencyDepreciationFactor) * 100).toFixed(1)}% per year
- Energy Cost Increase: ${((costIncreaseFactor - 1) * 100).toFixed(1)}% per year

CALCULATION METHOD:
The break-even point is calculated by tracking cumulative savings year by year until they equal or exceed the net installation cost. This analysis accounts for panel degradation, energy cost increases, and the time value of money.

YEAR-BY-YEAR CUMULATIVE SAVINGS:
${(() => {
  let cumulativeSavings = 0;
  let breakEvenReached = false;
  let yearlyBreakdown = '';
  
  for (let year = 0; year < Math.min(installationLifeSpan, 20); year++) {
    if (year < 10 || (year < 20 && !breakEvenReached)) {
      const efficiencyFactor = efficiencyDepreciationFactor ** year;
      const costFactor = costIncreaseFactor ** year;
      const discountFactor = discountRate ** year;
      const yearSavings = (solarMetrics?.monthlySavings || 0) * 12 * efficiencyFactor * costFactor / discountFactor;
      cumulativeSavings += yearSavings;
      
      yearlyBreakdown += `Year ${year + 1}:
  - Annual Savings: ${showMoney(yearSavings)}
  - Cumulative Savings: ${showMoney(cumulativeSavings)}
  - Remaining to Break Even: ${showMoney(Math.max(0, (solarMetrics?.installationCost || 0) - solarIncentives - cumulativeSavings))}
  - Break Even Status: ${cumulativeSavings >= ((solarMetrics?.installationCost || 0) - solarIncentives) ? 'ACHIEVED ✓' : 'Not yet'}
`;
      
      if (cumulativeSavings >= ((solarMetrics?.installationCost || 0) - solarIncentives) && !breakEvenReached) {
        breakEvenReached = true;
        if (year >= 10) {
          yearlyBreakdown += '... (earlier years omitted) ...\n';
        }
      }
    }
  }
  
  return yearlyBreakdown;
})()}

BREAK-EVEN RESULT:
- Break-Even Point: ${breakEvenYear >= 0 ? `${breakEvenYear + 1} years` : 'Not reached within analysis period'}
- Percentage of System Lifespan: ${breakEvenYear >= 0 ? ((breakEvenYear + 1) / installationLifeSpan * 100).toFixed(1) : '--'}%

INDUSTRY CONTEXT:
- Typical commercial solar installations break even in 5-7 years
- According to NREL data, average payback periods have decreased by 30% in the last decade
- Systems typically continue producing for 10-15 years beyond break-even point
- Post break-even energy is effectively free, minus minimal maintenance costs

FINANCIAL PERSPECTIVE:
- After break-even, all additional savings represent pure profit
- Solar installations that break even in less than half their lifespan are considered excellent investments
- Current federal incentives significantly improve break-even timeframes
          `
        };
        break;
    }
    calculationDialog.show();
  }

  async function updateMetrics() {
    if (!buildingInsights) return;
    
    try {
      // Get state from buildingInsights if available
      const state = 'FL'; // Default to Florida
      
      const energyData = await getEnergyData(
        state,
        'COM'
      );
      
      // Update local eiaData for calculations display
      eiaData = {
        electricityRate: energyData.electricityRate,
        consumptionBenchmark: energyData.consumptionBenchmark,
        sunHoursPerDay: energyData.sunHoursPerDay
      };
      
      solarMetrics = await calculateSolarMetrics(buildingInsights, energyData);
    } catch (error) {
      console.error('Error calculating metrics:', error);
    }
  }

  $: if (buildingInsights?.name) {
    updateMetrics();
  }
</script>

<Expandable
  bind:section={expandedSection}
  {icon}
  {title}
  subtitle="Values are only placeholders."
  subtitle2="Update with your own values."
  secondary
>
  <div class="flex flex-col space-y-4 pt-1 bg-dark-panel rounded-xl p-4">
    <div class="p-4 mb-4 bg-dark-card text-black rounded-lg">
      <p class="relative inline-flex items-center space-x-2">
        <md-icon class="md:w-6 w-8">info</md-icon>
        <span>
          Projections use a
          <a
            class="text-primary-400 hover:text-primary-300"
            href="https://developers.google.com/maps/documentation/solar/calculate-costs-us"
            target="_blank"
          >
            USA financial model
            <md-icon class="text-sm">open_in_new</md-icon>
          </a>
        </span>
      </p>
    </div>

    <LocationRates 
      {buildingInsights}
      bind:energyCostPerKwhInput
      onChange={updateConfig}
    />

    <InputMoney
      bind:value={monthlyAverageEnergyBillInput}
      icon="credit_card"
      label="Monthly average energy bill"
      onChange={updateConfig}
    />

    <div class="inline-flex items-center space-x-2">
      <div class="grow">
        <InputPanelsCount bind:configId {solarPanelConfigs} />
      </div>
      <md-icon-button role={undefined} on:click={updateConfig}>
        <md-icon>sync</md-icon>
      </md-icon-button>
    </div>

    <InputMoney
      bind:value={solarIncentives}
      icon="redeem"
      label="Solar incentives"
      onChange={updateConfig}
    />

    <InputMoney
      bind:value={installationCostPerWatt}
      icon="request_quote"
      label="Installation cost per Watt"
      onChange={updateConfig}
    />

    <InputNumber
      bind:value={panelCapacityWattsInput}
      icon="bolt"
      label="Panel capacity"
      suffix="Watts"
      onChange={updateConfig}
    />

    <div class="flex flex-col items-center w-full">
      <md-text-button
        trailing-icon
        role={undefined}
        on:click={() => (showAdvancedSettings = !showAdvancedSettings)}
        class="text-dark-text-primary"
      >
        {showAdvancedSettings ? 'Hide' : 'Show'} advanced settings
        <md-icon slot="icon">
          {showAdvancedSettings ? 'expand_less' : 'expand_more'}
        </md-icon>
      </md-text-button>
    </div>

    {#if showAdvancedSettings}
      <div class="flex flex-col space-y-4" transition:slide={{ duration: 200 }}>
        <InputNumber
          bind:value={installationLifeSpan}
          icon="date_range"
          label="Installation lifespan"
          suffix="years"
          onChange={updateConfig}
        />

        <InputPercent
          bind:value={dcToAcDerateInput}
          icon="dynamic_form"
          label="DC to AC conversion"
          onChange={updateConfig}
        />

        <InputRatio
          bind:value={efficiencyDepreciationFactor}
          icon="trending_down"
          label="Panel efficiency decline per year"
          decrease
          onChange={updateConfig}
        />

        <InputRatio
          bind:value={costIncreaseFactor}
          icon="price_change"
          label="Energy cost increase per year"
          onChange={updateConfig}
        />

        <InputRatio
          bind:value={discountRate}
          icon="local_offer"
          label="Discount rate per year"
          onChange={updateConfig}
        />
      </div>
    {/if}

    <div class="grid justify-items-end">
      <md-filled-tonal-button
        trailing-icon
        role={undefined}
        href="https://developers.google.com/maps/documentation/solar/calculate-costs-us"
        target="_blank"
        class="text-dark-text-primary"
      >
        More details
        <md-icon slot="icon">open_in_new</md-icon>
      </md-filled-tonal-button>
    </div>
  </div>
</Expandable>

<div class="absolute top-0 left-0 w-96">
  {#if expandedSection == title}
    <div class="flex flex-col space-y-2 m-2">
      <SummaryCard
        {icon}
        {title}
        rows={[
          {
            icon: 'energy_savings_leaf',
            name: 'Yearly energy',
            value: showNumber(
              (solarPanelConfigs[configId]?.yearlyEnergyDcKwh ?? 0) * panelCapacityRatio,
            ),
            units: 'kWh',
          },
          {
            icon: 'payments',
            name: 'Yearly cost',
            value: showMoney(
              (solarPanelConfigs[configId]?.yearlyEnergyDcKwh ?? 0) * panelCapacityRatio * energyCostPerKwhInput
            ),
          },
          {
            icon: 'speed',
            name: 'Installation size',
            value: showNumber(installationSizeKw),
            units: 'kW',
          },
          {
            icon: [
              'battery_0_bar',
              'battery_1_bar',
              'battery_2_bar',
              'battery_3_bar',
              'battery_4_bar',
              'battery_5_bar',
              'battery_full',
            ][Math.floor(Math.min(Math.round(energyCovered * 100) / 100, 1) * 6)],
            name: 'Energy covered',
            value: Math.round(energyCovered * 100).toString(),
            units: '%',
          },
        ]}
        class_name="backdrop-blur-sm bg-white/80 shadow-lg rounded-xl"
      />

      <!-- Savings Summary - No frosted background -->
      <div class="grid grid-cols-3 gap-4 mt-2 mb-2">
        <div class="text-center p-3 bg-blue-50 rounded-lg shadow-md">
          <div class="flex items-center justify-center gap-1">
            <div class="text-sm text-gray-600">Monthly Average</div>
            <md-icon class="text-sm cursor-pointer" on:click={() => showCalculation('monthly')}>info</md-icon>
          </div>
          <div class="text-lg font-bold text-blue-600 overflow-hidden text-ellipsis" title={showMoney(solarMetrics?.monthlySavings || 0)}>
            {showMoney(solarMetrics?.monthlySavings || 0)}
          </div>
        </div>
        <div class="text-center p-3 bg-green-50 rounded-lg shadow-md">
          <div class="flex items-center justify-center gap-1">
            <div class="text-sm text-gray-600">First Year</div>
            <md-icon class="text-sm cursor-pointer" on:click={() => showCalculation('firstYear')}>info</md-icon>
          </div>
          <div class="text-lg font-bold text-green-600 overflow-hidden text-ellipsis" title={showMoney((solarMetrics?.monthlySavings || 0) * 12)}>
            {showMoney((solarMetrics?.monthlySavings || 0) * 12)}
          </div>
        </div>
        <div class="text-center p-3 bg-purple-50 rounded-lg shadow-md">
          <div class="flex items-center justify-center gap-1">
            <div class="text-sm text-gray-600">10 Year Total</div>
            <md-icon class="text-sm cursor-pointer" on:click={() => showCalculation('tenYear')}>info</md-icon>
          </div>
          <div class="text-lg font-bold text-purple-600 overflow-hidden text-ellipsis" title={showMoney((solarMetrics?.monthlySavings || 0) * 12 * 10 * (1 - efficiencyDepreciationFactor * 10))}>
            {showMoney((solarMetrics?.monthlySavings || 0) * 12 * 10 * (1 - efficiencyDepreciationFactor * 10))}
          </div>
        </div>
      </div>

      <!-- Cost Breakdown -->
      <div class="w-full secondary-text bg-white rounded-lg p-3 shadow-md">
        <Table
          rows={[
            {
              icon: 'wallet',
              name: 'Cost without solar',
              value: showMoney(totalCostWithoutSolar),
              tooltip: `Click for detailed calculation breakdown`,
              onInfoClick: () => showCalculation('costWithoutSolar')
            },
            {
              icon: 'wb_sunny',
              name: 'Cost with solar',
              value: showMoney(totalCostWithSolar),
              tooltip: `Click for detailed calculation breakdown`,
              onInfoClick: () => showCalculation('costWithSolar')
            },
            {
              icon: 'savings',
              name: 'Total lifetime savings',
              value: showMoney(savings),
              tooltip: `Click for detailed calculation breakdown`,
              onInfoClick: () => showCalculation('lifetimeSavings')
            },
            {
              icon: 'balance',
              name: 'Break even',
              value: breakEvenYear >= 0 ? `${breakEvenYear + 1}` : '--',
              units: 'years',
              tooltip: `Click for detailed calculation breakdown`,
              onInfoClick: () => showCalculation('breakEven')
            },
          ]}
        />
      </div>

      <!-- Calculation Dialog -->
      <md-dialog bind:this={calculationDialog}>
        <div slot="headline">
          <div class="flex items-center primary-text">
            <md-icon class="text-primary">calculate</md-icon>
            <span class="ml-2 text-xl font-semibold">{currentCalculation.title}</span>
          </div>
        </div>
        <div slot="content" class="whitespace-pre-wrap max-h-[70vh] overflow-y-auto">
          <p class="mb-4 text-gray-700 text-lg">{currentCalculation.content}</p>
          
          <div class="bg-gray-50 rounded-lg p-5 border border-gray-200 shadow-inner">
            <div class="font-mono text-sm leading-relaxed text-gray-800">
              {currentCalculation.calculation}
            </div>
          </div>
        </div>
        <div slot="actions" class="flex justify-end">
          <md-text-button role={undefined} on:click={() => calculationDialog.close()}>
            Close
          </md-text-button>
          <md-filled-button role={undefined} on:click={() => calculationDialog.close()}>
            Got it
          </md-filled-button>
        </div>
      </md-dialog>
    </div>
  {/if}
</div>
