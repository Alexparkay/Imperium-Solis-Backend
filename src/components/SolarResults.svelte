<script lang="ts">
  import { onMount } from 'svelte';
  import SummaryCard from './SummaryCard.svelte';
  import InfoModal from './InfoModal.svelte';
  import type { SolarCalculationResult } from '../services/solarCalculationService';
  
  export let solarResults: SolarCalculationResult;
  
  let showModal = false;
  let modalTitle = '';
  let modalContent = '';
  let modalSources: Array<{name: string, url: string}> = [];
  
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
  
  function formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(Math.round(value));
  }
  
  function formatPercent(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  }
  
  function handleShowInfo(event: CustomEvent) {
    modalTitle = event.detail.title;
    modalContent = event.detail.explanation;
    modalSources = event.detail.sources;
    showModal = true;
  }
  
  // Prepare rows for the monthly summary card
  $: monthlyRows = [
    {
      name: 'Energy Consumption',
      value: formatNumber(solarResults.facilityMonthlyConsumptionKwh),
      units: 'kWh',
      infoTitle: 'Monthly Energy Consumption',
      infoExplanation: solarResults.explanations.facilityConsumption,
      infoSources: solarResults.sources
    },
    {
      name: 'Electricity Cost',
      value: formatCurrency(solarResults.monthlyElectricityCost),
      infoTitle: 'Monthly Electricity Cost',
      infoExplanation: solarResults.explanations.electricityCost,
      infoSources: solarResults.sources
    },
    {
      name: 'Solar Generation',
      value: formatNumber(solarResults.monthlySolarGenerationKwh),
      units: 'kWh',
      infoTitle: 'Monthly Solar Generation',
      infoExplanation: solarResults.explanations.energyProduction,
      infoSources: solarResults.sources
    },
    {
      name: 'Energy Offset',
      value: formatPercent(solarResults.energyOffsetPercentage),
      infoTitle: 'Energy Offset Percentage',
      infoExplanation: `The solar system offsets ${formatPercent(solarResults.energyOffsetPercentage)} of the facility's energy consumption. This is calculated by comparing the monthly solar generation (${formatNumber(solarResults.monthlySolarGenerationKwh)} kWh) to the monthly energy consumption (${formatNumber(solarResults.facilityMonthlyConsumptionKwh)} kWh).`,
      infoSources: solarResults.sources
    },
    {
      name: 'Monthly Savings',
      value: formatCurrency(solarResults.monthlySavings),
      infoTitle: 'Monthly Cost Savings',
      infoExplanation: `The monthly savings of ${formatCurrency(solarResults.monthlySavings)} includes both energy savings and demand charge reduction. This is calculated based on the local electricity rate and the amount of energy offset by the solar system.`,
      infoSources: solarResults.sources
    }
  ];
  
  // Prepare rows for the system summary card
  $: systemRows = [
    {
      name: 'System Size',
      value: solarResults.systemCapacityKw.toFixed(2),
      units: 'kW',
      infoTitle: 'Solar System Size',
      infoExplanation: solarResults.explanations.systemSize,
      infoSources: solarResults.sources
    },
    {
      name: 'Number of Panels',
      value: formatNumber(solarResults.numberOfSolarPanels),
      infoTitle: 'Solar Panel Count',
      infoExplanation: `The system consists of ${formatNumber(solarResults.numberOfSolarPanels)} solar panels. This is determined by the system size (${solarResults.systemCapacityKw.toFixed(2)} kW) and the capacity of each panel (400W).`,
      infoSources: solarResults.sources
    },
    {
      name: 'Roof Area Needed',
      value: formatNumber(solarResults.roofAreaNeeded || 0),
      units: 'sq ft',
      infoTitle: 'Roof Area Required',
      infoExplanation: solarResults.explanations.roofArea,
      infoSources: solarResults.sources
    },
    {
      name: 'Installation Cost',
      value: formatCurrency(solarResults.installationCost),
      infoTitle: 'System Installation Cost',
      infoExplanation: `The installation cost of ${formatCurrency(solarResults.installationCost)} is calculated based on the system size (${solarResults.systemCapacityKw.toFixed(2)} kW) and an installation cost of $2.85 per watt. This includes equipment, labor, and other installation costs.`,
      infoSources: solarResults.sources
    },
    {
      name: 'Payback Period',
      value: (solarResults.roiMonths / 12).toFixed(1),
      units: 'years',
      infoTitle: 'Payback Period',
      infoExplanation: solarResults.explanations.financialReturns,
      infoSources: solarResults.sources
    },
    {
      name: 'ROI (25-year)',
      value: formatPercent(solarResults.roi || 0),
      infoTitle: '25-Year Return on Investment',
      infoExplanation: `The 25-year ROI of ${formatPercent(solarResults.roi || 0)} represents the return on investment over the 25-year lifespan of the system. This is calculated by dividing the lifetime savings (${formatCurrency(solarResults.lifetimeSavings || 0)}) by the initial investment (${formatCurrency(solarResults.installationCost)}).`,
      infoSources: solarResults.sources
    }
  ];
</script>

<div class="space-y-4">
  <SummaryCard 
    icon="payments" 
    title="Monthly Energy & Savings"
    rows={monthlyRows}
    on:showInfo={handleShowInfo}
  />
  
  <SummaryCard 
    icon="solar_power" 
    title="Solar System Details"
    rows={systemRows}
    on:showInfo={handleShowInfo}
  />
</div>

{#if showModal}
  <InfoModal 
    title={modalTitle}
    content={modalContent}
    sources={modalSources}
    on:close={() => showModal = false}
  />
{/if} 