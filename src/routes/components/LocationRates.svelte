<script lang="ts">
  import { onMount } from 'svelte';
  import type { BuildingInsightsResponse } from '../solar';

  export let buildingInsights: BuildingInsightsResponse | undefined;
  export let energyCostPerKwhInput: number;
  export let onChange: () => void;

  let loading = true;
  let error = '';

  const EIA_API_KEY = '8oXNeP8BxYNolzsxulnI9TWLMgSJPHE47ZfHwHhm';

  onMount(async () => {
    try {
      const state = buildingInsights?.administrativeArea;
      // Using the latest EIA API v2 endpoint for electricity retail sales data
      const response = await fetch(
        `https://api.eia.gov/v2/electricity/retail-sales/data/?api_key=${EIA_API_KEY}&frequency=monthly&data[0]=price&facets[state][]=${state}&facets[sectorid][]=RES&sort[0][column]=period&sort[0][direction]=desc&length=1`
      );
      const data = await response.json();
      
      if (data.response?.data?.[0]?.price) {
        energyCostPerKwhInput = data.response.data[0].price / 100; // Convert cents to dollars
        onChange();
      }
    } catch (e) {
      console.warn('Failed to fetch state-specific rates:', e);
      error = 'Using national average electricity rates';
    } finally {
      loading = false;
    }
  });
</script>

<div class="flex flex-col gap-2">
  <div class="flex items-center gap-2">
    <md-icon>location_on</md-icon>
    <span class="text-lg">Location Rates</span>
  </div>

  <div class="flex flex-col gap-1">
    <div class="flex items-center justify-between">
      <span>State</span>
      <span class="font-semibold">{buildingInsights?.administrativeArea}</span>
    </div>
    <div class="flex items-center justify-between">
      <span>Zip Code</span>
      <span class="font-semibold">{buildingInsights?.postalCode}</span>
    </div>
    <div class="flex items-center justify-between">
      <span>Energy Rate</span>
      <span class="font-semibold">${energyCostPerKwhInput.toFixed(3)}/kWh</span>
    </div>
  </div>

  {#if loading}
    <div class="text-sm text-gray-600">Loading rates...</div>
  {:else if error}
    <div class="text-sm text-yellow-600">{error}</div>
  {/if}
</div> 