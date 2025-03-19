<script lang="ts">
  import { onMount } from 'svelte';
  import type { BillComponents } from '../services/energyRateService';
  import InputNumber from './InputNumber.svelte';
  import Expandable from './Expandable.svelte';
  import Icon from './Icon.svelte';
  
  export let totalRate: number;
  export let components: BillComponents;
  export let regionalAverage: number;
  export let escalationRate: number = 4.23;
  
  // Allow custom escalation rate
  export let customEscalationRate = escalationRate;
  export let useCustomEscalation = false;
  
  $: effectiveEscalationRate = useCustomEscalation ? customEscalationRate : escalationRate;
  
  // Calculate component percentages
  $: baseEnergyPercent = (components.baseEnergyRate / totalRate) * 100;
  $: deliveryPercent = (components.deliveryCharges / totalRate) * 100;
  $: regulatoryPercent = (components.regulatoryFees / totalRate) * 100;
  $: surchargePercent = (components.locationSurcharges / totalRate) * 100;
  
  // Format currency
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4
    }).format(value);
  }
  
  // Format percentage
  function formatPercent(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  }
  
  // Calculate projected rates
  let projectedRates: Array<{year: number, rate: number}> = [];
  
  $: {
    const currentYear = new Date().getFullYear();
    projectedRates = Array(25).fill(0).map((_, i) => ({
      year: currentYear + i,
      rate: totalRate * Math.pow(1 + (effectiveEscalationRate / 100), i)
    }));
  }
  
  // Chart setup
  let chartCanvas: HTMLCanvasElement;
  let chart: any;
  
  // Draw chart on mount and when data changes
  onMount(() => {
    drawChart();
    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  });
  
  $: if (chartCanvas && projectedRates.length > 0) {
    drawChart();
  }
  
  function drawChart() {
    if (!chartCanvas) return;
    
    const ctx = chartCanvas.getContext('2d');
    if (!ctx) return;
    
    // Clear previous chart
    if (chart) {
      chart.destroy();
    }
    
    // Prepare data
    const labels = projectedRates.map(d => d.year);
    const rates = projectedRates.map(d => d.rate);
    
    // Draw simple line chart
    ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
    
    // Set styles
    ctx.strokeStyle = '#0ea5e9'; // primary-500
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(14, 165, 233, 0.2)'; // primary-500 with opacity
    
    // Calculate scale
    const maxRate = Math.max(...rates) * 1.1;
    const xStep = chartCanvas.width / (labels.length - 1);
    const yScale = chartCanvas.height / maxRate;
    
    // Draw grid lines
    ctx.strokeStyle = '#333333'; // dark-border
    ctx.lineWidth = 0.5;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = chartCanvas.height - (maxRate * i / 5) * yScale;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartCanvas.width, y);
      ctx.stroke();
    }
    
    // Draw path
    ctx.strokeStyle = '#0ea5e9'; // primary-500
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, chartCanvas.height - rates[0] * yScale);
    
    for (let i = 1; i < rates.length; i++) {
      ctx.lineTo(i * xStep, chartCanvas.height - rates[i] * yScale);
    }
    
    // Stroke line
    ctx.stroke();
    
    // Fill area under line
    ctx.lineTo(chartCanvas.width, chartCanvas.height);
    ctx.lineTo(0, chartCanvas.height);
    ctx.closePath();
    ctx.fill();
    
    // Draw axes and labels
    ctx.fillStyle = '#aaaaaa'; // dark-text-secondary
    ctx.font = '10px Inter, sans-serif';
    
    // X-axis labels (every 5 years)
    for (let i = 0; i < labels.length; i += 5) {
      ctx.fillText(labels[i].toString(), i * xStep, chartCanvas.height - 5);
    }
    
    // Y-axis labels
    for (let i = 0; i <= 5; i++) {
      const value = (maxRate * i / 5);
      ctx.fillText('$' + value.toFixed(2), 5, chartCanvas.height - (value * yScale) - 5);
    }
  }
</script>

<div class="flex flex-col space-y-4">
  <Expandable section="energyRates" icon="bolt" title="Energy Rate Breakdown" subtitle={formatCurrency(totalRate) + "/kWh"}>
    <div class="p-5 backdrop-blur bg-dark-card/90 rounded-xl shadow-dark border border-dark-border">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h3 class="text-lg font-display font-semibold text-dark-text-primary">Current Rate</h3>
          <p class="text-2xl font-display font-bold text-primary-400">{formatCurrency(totalRate)}<span class="text-sm font-normal text-dark-text-secondary">/kWh</span></p>
        </div>
        <div class="px-4 py-2 rounded-lg {totalRate > regionalAverage ? 'bg-danger-900/50 text-danger-200' : 'bg-success-900/50 text-success-200'} flex items-center">
          <Icon icon={totalRate > regionalAverage ? 'trending_up' : 'trending_down'} className="mr-2" />
          <span class="font-medium">
            {totalRate > regionalAverage ? 'Above' : 'Below'} regional avg by 
            {Math.abs(((totalRate - regionalAverage) / regionalAverage) * 100).toFixed(1)}%
          </span>
        </div>
      </div>
      
      <div class="mb-8">
        <h4 class="text-md font-display font-medium text-dark-text-primary mb-3">Bill Components</h4>
        <div class="w-full bg-dark-panel rounded-full h-5 mb-4 overflow-hidden">
          <div class="flex h-full">
            <div class="bg-primary-500 h-full" style="width: {baseEnergyPercent}%"></div>
            <div class="bg-secondary-500 h-full" style="width: {deliveryPercent}%"></div>
            <div class="bg-warning-500 h-full" style="width: {regulatoryPercent}%"></div>
            <div class="bg-danger-500 h-full" style="width: {surchargePercent}%"></div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div class="flex items-center p-3 rounded-lg bg-primary-900/30">
            <div class="w-4 h-4 bg-primary-500 rounded-full mr-2"></div>
            <div>
              <span class="font-medium">Base Energy:</span>
              <span class="ml-1">{formatCurrency(components.baseEnergyRate)}/kWh ({formatPercent(baseEnergyPercent)})</span>
            </div>
          </div>
          <div class="flex items-center p-3 rounded-lg bg-secondary-900/30">
            <div class="w-4 h-4 bg-secondary-500 rounded-full mr-2"></div>
            <div>
              <span class="font-medium">Delivery:</span>
              <span class="ml-1">{formatCurrency(components.deliveryCharges)}/kWh ({formatPercent(deliveryPercent)})</span>
            </div>
          </div>
          <div class="flex items-center p-3 rounded-lg bg-warning-900/30">
            <div class="w-4 h-4 bg-warning-500 rounded-full mr-2"></div>
            <div>
              <span class="font-medium">Regulatory:</span>
              <span class="ml-1">{formatCurrency(components.regulatoryFees)}/kWh ({formatPercent(regulatoryPercent)})</span>
            </div>
          </div>
          <div class="flex items-center p-3 rounded-lg bg-danger-900/30">
            <div class="w-4 h-4 bg-danger-500 rounded-full mr-2"></div>
            <div>
              <span class="font-medium">Surcharges:</span>
              <span class="ml-1">{formatCurrency(components.locationSurcharges)}/kWh ({formatPercent(surchargePercent)})</span>
            </div>
          </div>
          <div class="flex items-center p-3 rounded-lg bg-accent-900/30 col-span-2">
            <div class="w-4 h-4 bg-accent-500 rounded-full mr-2"></div>
            <div>
              <span class="font-medium">Demand Charges:</span>
              <span class="ml-1">${components.demandCharges.toFixed(2)}/kW (billed separately)</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="mb-8 p-5 rounded-xl bg-dark-panel border border-dark-border">
        <h4 class="text-md font-display font-medium text-dark-text-primary mb-3">Rate Escalation</h4>
        <div class="flex items-center space-x-3 mb-4">
          <div class="relative">
            <input type="checkbox" bind:checked={useCustomEscalation} id="customEscalation" class="sr-only peer">
            <div class="w-11 h-6 bg-dark-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-dark-panel after:border-dark-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-blue"></div>
          </div>
          <label for="customEscalation" class="text-sm font-medium text-dark-text-secondary cursor-pointer">
            Use custom escalation rate
          </label>
        </div>
        
        {#if useCustomEscalation}
          <InputNumber
            bind:value={customEscalationRate}
            icon="trending_up"
            label="Annual Rate Escalation"
            suffix="%"
            min={0}
            max={20}
            step={0.1}
          />
        {:else}
          <div class="flex items-center p-3 rounded-lg bg-primary-900/30">
            <Icon icon="info" className="text-primary-400 mr-2" size="small" />
            <div class="text-sm">
              Using <span class="font-semibold">{escalationRate.toFixed(2)}%</span> annual rate escalation 
              <span class="text-xs text-dark-text-tertiary">(based on historical data)</span>
            </div>
          </div>
        {/if}
      </div>
      
      <div>
        <h4 class="text-md font-display font-medium text-dark-text-primary mb-3">Projected Rates (25 Years)</h4>
        <div class="chart-container w-full h-48 mb-3">
          <canvas bind:this={chartCanvas} width="400" height="180"></canvas>
        </div>
        <div class="text-xs text-dark-text-secondary mt-1 flex items-center">
          <Icon icon="insights" className="text-primary-400 mr-1" size="small" />
          Projected rate in 25 years: <span class="font-semibold ml-1 text-primary-300">{formatCurrency(projectedRates[projectedRates.length - 1]?.rate || 0)}/kWh</span>
        </div>
      </div>
    </div>
  </Expandable>
</div> 