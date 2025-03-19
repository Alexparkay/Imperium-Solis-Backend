<script lang="ts">
  import type { BuildingInsightsResponse } from '../solar';
  import { calculateSolarMetrics } from '../services/solarCalculationService';
  import { getEnergyData, type EnergyData } from '../services/eiaService';
  import type { SolarCalculationResult } from '../services/solarCalculationService';
  import InputMoney from './InputMoney.svelte';

  export let buildingInsights: BuildingInsightsResponse | undefined;
  export let energyCostPerKwhInput: number;
  export let onChange: () => void;

  let isLoading = false;
  let error = '';
  let solarMetrics: SolarCalculationResult | undefined;
  let energyData: EnergyData | undefined;

  async function updateFacilityData() {
    if (!buildingInsights) return;
    
    isLoading = true;
    error = '';
    
    try {
      // Get energy data from EIA
      energyData = await getEnergyData(
        buildingInsights.address?.state || 'FL',
        'COM'  // Commercial sector
      );
      
      // Update the energy cost input
      energyCostPerKwhInput = energyData.electricityRate;
      
      // Calculate solar metrics
      solarMetrics = await calculateSolarMetrics(buildingInsights, energyData);
      
      onChange();
    } catch (e) {
      console.error('Error calculating facility metrics:', e);
      error = 'Failed to calculate facility metrics';
    } finally {
      isLoading = false;
    }
  }

  $: if (buildingInsights?.name) {
    updateFacilityData();
  }
</script>

<div class="flex flex-col space-y-4 backdrop-blur-sm bg-white/90 rounded-lg p-4">
  <h3 class="text-lg font-semibold flex items-center gap-2">
    <md-icon>location_on</md-icon>
    Location & Energy Data
  </h3>

  {#if isLoading}
    <div class="flex items-center justify-center p-4">
      <md-circular-progress indeterminate></md-circular-progress>
    </div>
  {:else if error}
    <div class="text-red-600 p-4">
      {error}
    </div>
  {:else if solarMetrics}
    <div class="grid gap-4">
      <!-- Location Info -->
      <div class="p-4 backdrop-blur-sm bg-white/80 rounded-lg">
        <h4 class="font-medium mb-2">Location Details</h4>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span class="text-gray-600">State:</span>
            <span class="font-medium">{buildingInsights?.address?.state}</span>
          </div>
          <div>
            <span class="text-gray-600">City:</span>
            <span class="font-medium">{buildingInsights?.address?.city}</span>
          </div>
          <div>
            <span class="text-gray-600">Zip:</span>
            <span class="font-medium">{buildingInsights?.address?.postalCode}</span>
          </div>
          <div>
            <span class="text-gray-600">Energy Rate:</span>
            <span class="font-medium">${energyCostPerKwhInput.toFixed(3)}/kWh</span>
          </div>
        </div>
      </div>

      <!-- Facility Metrics -->
      <div class="p-4 backdrop-blur-sm bg-white/80 rounded-lg">
        <h4 class="font-medium mb-2">Facility Metrics</h4>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Building Area:</span>
            <div class="flex items-center gap-1">
              <span class="font-medium">{solarMetrics.details.buildingArea.toLocaleString()} ft²</span>
              <md-icon class="text-sm" title="Building area is either retrieved from Google Maps data or estimated as 2x the roof area">info</md-icon>
            </div>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Usable Roof Area:</span>
            <div class="flex items-center gap-1">
              <span class="font-medium">{solarMetrics.usableRooftopAreaSqft.toLocaleString()} ft²</span>
              <md-icon class="text-sm" title={`Total roof area × Usability factor\n${(solarMetrics.usableRooftopAreaSqft / 0.8).toLocaleString()} × 0.8 = ${solarMetrics.usableRooftopAreaSqft.toLocaleString()} ft²`}>info</md-icon>
            </div>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Monthly Consumption:</span>
            <div class="flex items-center gap-1">
              <span class="font-medium">{solarMetrics.facilityMonthlyConsumptionKwh.toLocaleString()} kWh</span>
              <md-icon class="text-sm" title={`Building area × Consumption benchmark\n${solarMetrics.details.buildingArea.toLocaleString()} ft² × ${energyData?.consumptionBenchmark.toFixed(2)} kWh/ft²/month = ${solarMetrics.facilityMonthlyConsumptionKwh.toLocaleString()} kWh`}>info</md-icon>
            </div>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Monthly Cost:</span>
            <div class="flex items-center gap-1">
              <span class="font-medium">${solarMetrics.monthlyElectricityCost.toLocaleString()}</span>
              <md-icon class="text-sm" title={`Monthly consumption × Electricity rate\n${solarMetrics.facilityMonthlyConsumptionKwh.toLocaleString()} kWh × $${energyCostPerKwhInput.toFixed(3)}/kWh = $${solarMetrics.monthlyElectricityCost.toLocaleString()}`}>info</md-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- Solar Potential -->
      <div class="p-4 backdrop-blur-sm bg-white/80 rounded-lg">
        <h4 class="font-medium mb-2">Solar Potential</h4>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">System Size:</span>
            <div class="flex items-center gap-1">
              <span class="font-medium">{solarMetrics.systemCapacityKw.toFixed(1)} kW</span>
              <md-icon class="text-sm" title={`Number of panels × Panel capacity\n${solarMetrics.numberOfSolarPanels} panels × 0.32 kW = ${solarMetrics.systemCapacityKw.toFixed(1)} kW`}>info</md-icon>
            </div>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Number of Panels:</span>
            <div class="flex items-center gap-1">
              <span class="font-medium">{solarMetrics.numberOfSolarPanels.toLocaleString()}</span>
              <md-icon class="text-sm" title={`Usable roof area ÷ Panel area\n${solarMetrics.usableRooftopAreaSqft.toLocaleString()} ft² ÷ 17.6 ft² = ${solarMetrics.numberOfSolarPanels.toLocaleString()} panels`}>info</md-icon>
            </div>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Monthly Generation:</span>
            <div class="flex items-center gap-1">
              <span class="font-medium">{solarMetrics.monthlySolarGenerationKwh.toLocaleString()} kWh</span>
              <md-icon class="text-sm" title={`System capacity × Sun hours × Days × Efficiency\n${solarMetrics.systemCapacityKw.toFixed(1)} kW × ${energyData?.sunHoursPerDay} hrs × 30 days × 0.8 = ${solarMetrics.monthlySolarGenerationKwh.toLocaleString()} kWh`}>info</md-icon>
            </div>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Energy Offset:</span>
            <div class="flex items-center gap-1">
              <span class="font-medium">{solarMetrics.energyOffsetPercentage.toFixed(1)}%</span>
              <md-icon class="text-sm" title={`(Solar generation ÷ Monthly consumption) × 100\n(${solarMetrics.monthlySolarGenerationKwh.toLocaleString()} kWh ÷ ${solarMetrics.facilityMonthlyConsumptionKwh.toLocaleString()} kWh) × 100 = ${solarMetrics.energyOffsetPercentage.toFixed(1)}%`}>info</md-icon>
            </div>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Monthly Savings:</span>
            <div class="flex items-center gap-1">
              <span class="font-medium">${solarMetrics.monthlySavings.toLocaleString()}</span>
              <md-icon class="text-sm" title={`Energy offset × Electricity rate\n${Math.min(solarMetrics.monthlySolarGenerationKwh, solarMetrics.facilityMonthlyConsumptionKwh).toLocaleString()} kWh × $${energyCostPerKwhInput.toFixed(3)}/kWh = $${solarMetrics.monthlySavings.toLocaleString()}`}>info</md-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- ROI -->
      <div class="p-4 backdrop-blur-sm bg-white/80 rounded-lg">
        <h4 class="font-medium mb-2">Investment Details</h4>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Installation Cost:</span>
            <div class="flex items-center gap-1">
              <span class="font-medium">${solarMetrics.installationCost.toLocaleString()}</span>
              <md-icon class="text-sm" title={`System capacity × 1000 × Cost per watt\n${solarMetrics.systemCapacityKw.toFixed(1)} kW × 1000 × $3.00 = $${solarMetrics.installationCost.toLocaleString()}`}>info</md-icon>
            </div>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Payback Period:</span>
            <div class="flex items-center gap-1">
              <span class="font-medium">{(solarMetrics.roiMonths / 12).toFixed(1)} years</span>
              <md-icon class="text-sm" title={`Installation cost ÷ Monthly savings ÷ 12\n$${solarMetrics.installationCost.toLocaleString()} ÷ $${solarMetrics.monthlySavings.toLocaleString()}/month ÷ 12 = ${(solarMetrics.roiMonths / 12).toFixed(1)} years`}>info</md-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div> 