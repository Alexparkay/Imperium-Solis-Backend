<script lang="ts">
  import { onMount } from 'svelte';
  import SummaryCard from './SummaryCard.svelte';
  import InfoModal from './InfoModal.svelte';
  import type { FacilityData } from '../services/perplexityService';
  
  export let facilityData: FacilityData;
  
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
    return new Intl.NumberFormat('en-US').format(value);
  }
  
  function handleShowInfo(event: CustomEvent) {
    modalTitle = event.detail.title;
    modalContent = event.detail.explanation;
    modalSources = event.detail.sources;
    showModal = true;
  }
  
  // Prepare rows for the summary card
  $: facilityRows = [
    {
      name: 'Facility Type',
      value: facilityData.facilityType,
      infoTitle: 'Facility Type Classification',
      infoExplanation: facilityData.explanations.facilityType,
      infoSources: facilityData.sources
    },
    {
      name: 'Building Size',
      value: formatNumber(facilityData.sizeSquareFeet),
      units: 'sq ft',
      infoTitle: 'Building Size Estimation',
      infoExplanation: facilityData.explanations.sizeEstimation,
      infoSources: facilityData.sources
    },
    {
      name: 'Energy Use Intensity',
      value: facilityData.euiKwhPerSqFtPerYear.toFixed(2),
      units: 'kWh/sq ft/year',
      infoTitle: 'Energy Use Intensity (EUI)',
      infoExplanation: facilityData.explanations.euiDetermination,
      infoSources: facilityData.sources
    },
    {
      name: 'Electricity Rate',
      value: facilityData.electricityRatePerKwh.toFixed(4),
      units: '$/kWh',
      infoTitle: 'Local Electricity Rate',
      infoExplanation: facilityData.explanations.electricityRate,
      infoSources: facilityData.sources
    },
    {
      name: 'Demand Charge',
      value: facilityData.demandChargePerKw.toFixed(2),
      units: '$/kW',
      infoTitle: 'Demand Charge Estimation',
      infoExplanation: facilityData.explanations.demandCharge,
      infoSources: facilityData.sources
    },
    {
      name: 'Annual Energy Cost',
      value: formatCurrency(facilityData.annualEnergyCost),
      infoTitle: 'Annual Energy Cost Calculation',
      infoExplanation: `This annual energy cost is calculated by combining the energy consumption charges and demand charges:
      <ul class="list-disc pl-5 mt-2 mb-4">
        <li>Energy Consumption: ${formatNumber(facilityData.sizeSquareFeet)} sq ft × ${facilityData.euiKwhPerSqFtPerYear.toFixed(2)} kWh/sq ft/year × $${facilityData.electricityRatePerKwh.toFixed(4)}/kWh = ${formatCurrency(facilityData.sizeSquareFeet * facilityData.euiKwhPerSqFtPerYear * facilityData.electricityRatePerKwh)}</li>
        <li>Peak Demand: Estimated at ${formatNumber(Math.round((facilityData.sizeSquareFeet * facilityData.euiKwhPerSqFtPerYear) / (8760 * 0.65) * 1.5))} kW</li>
        <li>Annual Demand Charges: ${formatNumber(Math.round((facilityData.sizeSquareFeet * facilityData.euiKwhPerSqFtPerYear) / (8760 * 0.65) * 1.5))} kW × $${facilityData.demandChargePerKw.toFixed(2)}/kW × 12 months = ${formatCurrency(Math.round((facilityData.sizeSquareFeet * facilityData.euiKwhPerSqFtPerYear) / (8760 * 0.65) * 1.5) * facilityData.demandChargePerKw * 12)}</li>
      </ul>`,
      infoSources: facilityData.sources
    }
  ];
</script>

<SummaryCard 
  icon="business" 
  title={facilityData.facilityName}
  rows={facilityRows}
  on:showInfo={handleShowInfo}
/>

{#if showModal}
  <InfoModal 
    title={modalTitle}
    content={modalContent}
    sources={modalSources}
    on:close={() => showModal = false}
  />
{/if} 