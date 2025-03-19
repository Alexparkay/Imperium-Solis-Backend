<script lang="ts">
  import { onMount } from 'svelte';
  import InputNumber from './InputNumber.svelte';
  import Expandable from './Expandable.svelte';
  import Icon from './Icon.svelte';
  import type { FinancialMetrics } from '../services/financialModelService';
  import { calculateFinancialMetrics } from '../services/financialModelService';
  
  // System specifications
  export let systemCostUSD: number;
  export let systemCapacityKW: number;
  export let annualProductionKWh: number;
  export let electricityRate: number;
  
  // Financial parameters with defaults
  export let rateEscalation: number = 4.23;
  export let panelDegradation: number = 0.5;
  export let downPayment: number = 0;
  export let loanTermYears: number = 20;
  export let interestRate: number = 5.5;
  export let incentiveAmount: number = 0;
  
  // Financing options
  export let useFinancing: boolean = false;
  
  // Calculate metrics
  let financialMetrics: FinancialMetrics;
  
  $: {
    const params = {
      systemCostUSD,
      systemCapacityKW,
      annualProductionKWh,
      electricityRate,
      rateEscalation,
      panelDegradation,
      financingTerms: useFinancing ? {
        loanAmount: systemCostUSD - downPayment,
        downPayment,
        interestRate,
        loanTermYears,
        incentiveAmount
      } : undefined
    };
    
    financialMetrics = calculateFinancialMetrics(params);
  }
  
  // Format currency
  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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
  
  // Chart setup
  let cashFlowCanvas: HTMLCanvasElement;
  let cumulativeCanvas: HTMLCanvasElement;
  let cashFlowChart: any;
  let cumulativeChart: any;
  
  // Draw charts on mount and when data changes
  onMount(() => {
    drawCharts();
    return () => {
      if (cashFlowChart) cashFlowChart.destroy();
      if (cumulativeChart) cumulativeChart.destroy();
    };
  });
  
  $: if ((cashFlowCanvas && cumulativeCanvas) && financialMetrics) {
    drawCharts();
  }
  
  function drawCharts() {
    if (!cashFlowCanvas || !cumulativeCanvas || !financialMetrics) return;
    
    drawCashFlowChart();
    drawCumulativeChart();
  }
  
  function drawCashFlowChart() {
    const ctx = cashFlowCanvas.getContext('2d');
    if (!ctx) return;
    
    // Clear previous chart
    ctx.clearRect(0, 0, cashFlowCanvas.width, cashFlowCanvas.height);
    
    // Prepare data
    const years = financialMetrics.cashFlow.map(cf => cf.year);
    const savings = financialMetrics.cashFlow.map(cf => cf.energySavings);
    const payments = financialMetrics.cashFlow.map(cf => cf.loanPayment);
    const netFlow = financialMetrics.cashFlow.map(cf => cf.netCashFlow);
    
    // Calculate scale
    const maxValue = Math.max(...savings, ...payments) * 1.1;
    const xStep = cashFlowCanvas.width / (years.length - 1);
    const yScale = cashFlowCanvas.height / (maxValue * 2);
    const zeroY = cashFlowCanvas.height / 2;
    
    // Draw grid
    ctx.strokeStyle = '#333333'; // dark-border
    ctx.lineWidth = 0.5;
    
    // Horizontal grid line (zero line)
    ctx.beginPath();
    ctx.moveTo(0, zeroY);
    ctx.lineTo(cashFlowCanvas.width, zeroY);
    ctx.stroke();
    
    // Draw savings (positive)
    ctx.strokeStyle = '#22c55e'; // success-500
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, zeroY - savings[0] * yScale);
    
    for (let i = 1; i < savings.length; i++) {
      ctx.lineTo(i * xStep, zeroY - savings[i] * yScale);
    }
    ctx.stroke();
    
    // Draw payments (negative)
    if (useFinancing) {
      ctx.strokeStyle = '#ef4444'; // danger-500
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, zeroY + payments[0] * yScale);
      
      for (let i = 1; i < payments.length; i++) {
        ctx.lineTo(i * xStep, zeroY + payments[i] * yScale);
      }
      ctx.stroke();
    }
    
    // Draw net flow
    ctx.strokeStyle = '#0ea5e9'; // primary-500
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, zeroY - netFlow[0] * yScale);
    
    for (let i = 1; i < netFlow.length; i++) {
      ctx.lineTo(i * xStep, zeroY - netFlow[i] * yScale);
    }
    ctx.stroke();
    
    // Draw labels
    ctx.fillStyle = '#aaaaaa'; // dark-text-secondary
    ctx.font = '10px Inter, sans-serif';
    
    // X-axis labels (every 5 years)
    for (let i = 0; i < years.length; i += 5) {
      ctx.fillText(years[i].toString(), i * xStep, cashFlowCanvas.height - 5);
    }
  }
  
  function drawCumulativeChart() {
    const ctx = cumulativeCanvas.getContext('2d');
    if (!ctx) return;
    
    // Clear previous chart
    ctx.clearRect(0, 0, cumulativeCanvas.width, cumulativeCanvas.height);
    
    // Prepare data
    const years = financialMetrics.cashFlow.map(cf => cf.year);
    const cumulative = financialMetrics.cashFlow.map(cf => cf.cumulativeCashFlow);
    
    // Find min and max for scaling
    const minValue = Math.min(0, ...cumulative);
    const maxValue = Math.max(0, ...cumulative);
    const range = maxValue - minValue;
    
    // Calculate scale
    const xStep = cumulativeCanvas.width / (years.length - 1);
    const yScale = cumulativeCanvas.height * 0.8 / range;
    const zeroY = cumulativeCanvas.height * 0.9 - (minValue * yScale);
    
    // Draw grid
    ctx.strokeStyle = '#333333'; // dark-border
    ctx.lineWidth = 0.5;
    
    // Horizontal grid line (zero line)
    ctx.beginPath();
    ctx.moveTo(0, zeroY);
    ctx.lineTo(cumulativeCanvas.width, zeroY);
    ctx.stroke();
    
    // Draw cumulative cash flow
    ctx.strokeStyle = '#0ea5e9'; // primary-500
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, zeroY - cumulative[0] * yScale);
    
    for (let i = 1; i < cumulative.length; i++) {
      ctx.lineTo(i * xStep, zeroY - cumulative[i] * yScale);
    }
    ctx.stroke();
    
    // Fill area under line
    ctx.fillStyle = 'rgba(14, 165, 233, 0.2)'; // primary-500 with opacity
    ctx.lineTo(cumulativeCanvas.width, zeroY);
    ctx.lineTo(0, zeroY);
    ctx.closePath();
    ctx.fill();
    
    // Draw payback point
    if (financialMetrics.paybackPeriodYears < 25) {
      const paybackX = financialMetrics.paybackPeriodYears * xStep;
      
      ctx.fillStyle = '#22c55e'; // success-500
      ctx.beginPath();
      ctx.arc(paybackX, zeroY, 5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#aaaaaa'; // dark-text-secondary
      ctx.fillText(`Payback: Year ${financialMetrics.paybackPeriodYears}`, paybackX - 40, zeroY - 10);
    }
    
    // Draw labels
    ctx.fillStyle = '#aaaaaa'; // dark-text-secondary
    ctx.font = '10px Inter, sans-serif';
    
    // X-axis labels (every 5 years)
    for (let i = 0; i < years.length; i += 5) {
      ctx.fillText(years[i].toString(), i * xStep, cumulativeCanvas.height - 5);
    }
  }
</script>

<div class="flex flex-col space-y-4">
  <Expandable section="roiCalculator" icon="calculate" title="ROI Calculator" subtitle={`Payback: ${financialMetrics?.paybackPeriodYears.toFixed(1)} years`}>
    <div class="p-5 backdrop-blur bg-dark-card/90 rounded-xl shadow-dark border border-dark-border">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="bg-dark-panel p-4 rounded-xl border border-dark-border">
          <div class="flex items-center mb-4">
            <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-blue text-white mr-3">
              <Icon icon="solar_power" size="medium" />
            </div>
            <h3 class="text-lg font-display font-semibold text-dark-text-primary">System Information</h3>
          </div>
          <div class="space-y-3">
            <div class="flex justify-between items-center py-2 border-b border-dark-border last:border-0">
              <span class="text-sm font-medium text-dark-text-secondary">System Cost:</span>
              <span class="text-sm font-semibold text-dark-text-primary">{formatCurrency(systemCostUSD)}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-dark-border last:border-0">
              <span class="text-sm font-medium text-dark-text-secondary">System Size:</span>
              <span class="text-sm font-semibold text-dark-text-primary">{systemCapacityKW.toFixed(2)} kW</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-dark-border last:border-0">
              <span class="text-sm font-medium text-dark-text-secondary">Annual Production:</span>
              <span class="text-sm font-semibold text-dark-text-primary">{annualProductionKWh.toFixed(0)} kWh</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-dark-border last:border-0">
              <span class="text-sm font-medium text-dark-text-secondary">Electricity Rate:</span>
              <span class="text-sm font-semibold text-dark-text-primary">${electricityRate.toFixed(4)}/kWh</span>
            </div>
          </div>
        </div>
        
        <div class="bg-primary-900/30 p-4 rounded-xl border border-primary-700/30">
          <div class="flex items-center mb-4">
            <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-blue text-white mr-3">
              <Icon icon="trending_up" size="medium" />
            </div>
            <h3 class="text-lg font-display font-semibold text-dark-text-primary">Financial Summary</h3>
          </div>
          <div class="space-y-3">
            <div class="flex justify-between items-center py-2 border-b border-primary-700/20 last:border-0">
              <span class="text-sm font-medium text-dark-text-secondary">Payback Period:</span>
              <span class="text-sm font-semibold text-primary-300">{financialMetrics?.paybackPeriodYears.toFixed(1)} years</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-primary-700/20 last:border-0">
              <span class="text-sm font-medium text-dark-text-secondary">25-Year ROI:</span>
              <span class="text-sm font-semibold text-primary-300">{formatPercent(financialMetrics?.roi25Year || 0)}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-primary-700/20 last:border-0">
              <span class="text-sm font-medium text-dark-text-secondary">First Year Savings:</span>
              <span class="text-sm font-semibold text-primary-300">{formatCurrency(financialMetrics?.firstYearSavings || 0)}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-primary-700/20 last:border-0">
              <span class="text-sm font-medium text-dark-text-secondary">Lifetime Savings:</span>
              <span class="text-sm font-semibold text-primary-300">{formatCurrency(financialMetrics?.lifetimeSavings || 0)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="mb-8 p-5 rounded-xl bg-dark-panel border border-dark-border">
        <div class="flex items-center mb-4">
          <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-blue text-white mr-3">
            <Icon icon="account_balance" size="medium" />
          </div>
          <h3 class="text-lg font-display font-semibold text-dark-text-primary">Financing Options</h3>
        </div>
        
        <div class="flex items-center space-x-3 mb-5">
          <div class="relative">
            <input type="checkbox" bind:checked={useFinancing} id="useFinancing" class="sr-only peer">
            <div class="w-11 h-6 bg-dark-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-dark-panel after:border-dark-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-blue"></div>
          </div>
          <label for="useFinancing" class="text-sm font-medium text-dark-text-secondary cursor-pointer">
            Use financing
          </label>
        </div>
        
        {#if useFinancing}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputNumber
              bind:value={downPayment}
              icon="payments"
              label="Down Payment"
              prefix="$"
              min={0}
              max={systemCostUSD}
              step={1000}
            />
            
            <InputNumber
              bind:value={loanTermYears}
              icon="calendar_month"
              label="Loan Term"
              suffix="years"
              min={5}
              max={30}
              step={1}
            />
            
            <InputNumber
              bind:value={interestRate}
              icon="percent"
              label="Interest Rate"
              suffix="%"
              min={0}
              max={15}
              step={0.25}
            />
            
            <InputNumber
              bind:value={incentiveAmount}
              icon="savings"
              label="Incentives"
              prefix="$"
              min={0}
              max={systemCostUSD}
              step={1000}
            />
          </div>
          
          {#if financialMetrics?.monthlyLoanPayment}
            <div class="mt-5 p-4 bg-secondary-900/30 rounded-lg border border-secondary-700/30">
              <div class="flex justify-between items-center">
                <span class="font-medium text-dark-text-secondary flex items-center">
                  <Icon icon="payments" className="mr-2" size="small" />
                  Monthly Payment:
                </span>
                <span class="font-bold text-secondary-300">{formatCurrency(financialMetrics.monthlyLoanPayment)}</span>
              </div>
            </div>
          {/if}
        {/if}
      </div>
      
      <div class="mb-8">
        <div class="flex items-center mb-4">
          <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-green text-white mr-3">
            <Icon icon="show_chart" size="medium" />
          </div>
          <h3 class="text-lg font-display font-semibold text-dark-text-primary">Cash Flow Analysis</h3>
        </div>
        
        <div class="chart-container w-full h-48 mb-4">
          <canvas bind:this={cashFlowCanvas} width="400" height="180"></canvas>
        </div>
        
        <div class="flex flex-wrap justify-center gap-4 text-xs text-center text-dark-text-secondary">
          <div class="flex items-center px-3 py-2 rounded-lg bg-success-900/30">
            <span class="w-3 h-3 bg-success-500 rounded-full mr-2"></span>
            Energy Savings
          </div>
          
          {#if useFinancing}
            <div class="flex items-center px-3 py-2 rounded-lg bg-danger-900/30">
              <span class="w-3 h-3 bg-danger-500 rounded-full mr-2"></span>
              Loan Payments
            </div>
          {/if}
          
          <div class="flex items-center px-3 py-2 rounded-lg bg-primary-900/30">
            <span class="w-3 h-3 bg-primary-500 rounded-full mr-2"></span>
            Net Cash Flow
          </div>
        </div>
      </div>
      
      <div>
        <div class="flex items-center mb-4">
          <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-blue text-white mr-3">
            <Icon icon="savings" size="medium" />
          </div>
          <h3 class="text-lg font-display font-semibold text-dark-text-primary">Cumulative Cash Flow</h3>
        </div>
        
        <div class="chart-container w-full h-48 mb-4">
          <canvas bind:this={cumulativeCanvas} width="400" height="180"></canvas>
        </div>
        
        <div class="flex items-center justify-center text-sm font-medium text-primary-300 bg-primary-900/30 rounded-lg p-3 border border-primary-700/30">
          <Icon icon="paid" className="mr-2" />
          Total 25-year net cash flow: {formatCurrency(financialMetrics?.cashFlow[financialMetrics?.cashFlow.length - 1]?.cumulativeCashFlow || 0)}
        </div>
      </div>
    </div>
  </Expandable>
</div> 