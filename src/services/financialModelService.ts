import type { BillComponents } from './energyRateService';

interface FinancingTerms {
  loanAmount: number;  // Total loan amount in USD
  downPayment: number;  // Down payment amount in USD
  interestRate: number;  // Annual interest rate percentage
  loanTermYears: number;  // Loan term in years
  incentiveAmount: number;  // Federal/state/local incentives in USD
}

export interface FinancialParameters {
  systemCostUSD: number;  // Total system cost in USD
  systemCapacityKW: number;  // System capacity in kilowatts
  annualProductionKWh: number;  // Annual energy production in kWh
  electricityRate: number;  // Current electricity rate in $/kWh
  rateEscalation: number;  // Annual electricity rate escalation percentage
  panelDegradation: number;  // Annual panel degradation percentage
  financingTerms?: FinancingTerms;  // Optional financing terms
  billComponents?: BillComponents;  // Optional detailed bill components
}

export interface FinancialMetrics {
  paybackPeriodYears: number;  // Simple payback period in years
  roi25Year: number;  // 25-year return on investment percentage
  npv25Year: number;  // 25-year net present value in USD
  irr25Year: number;  // 25-year internal rate of return percentage
  lcoe: number;  // Levelized cost of energy in $/kWh
  firstYearSavings: number;  // First year savings in USD
  lifetimeSavings: number;  // Lifetime (25-year) savings in USD
  monthlyLoanPayment?: number;  // Monthly loan payment if financing
  cashFlow: Array<{  // Annual cash flow for 25 years
    year: number;
    energyProduction: number;  // kWh
    energySavings: number;  // USD
    loanPayment: number;  // USD
    netCashFlow: number;  // USD
    cumulativeCashFlow: number;  // USD
  }>;
}

/**
 * Calculates detailed financial metrics for a solar installation
 * 
 * @param params Financial parameters for the calculation
 * @returns Financial metrics including ROI, payback period, and cash flow
 */
export function calculateFinancialMetrics(params: FinancialParameters): FinancialMetrics {
  // Initialize cash flow array
  const cashFlow = [];
  let cumulativeCashFlow = -params.systemCostUSD;
  
  // Calculate loan payment if financing terms are provided
  let monthlyLoanPayment = 0;
  let annualLoanPayment = 0;
  
  if (params.financingTerms) {
    const { loanAmount, interestRate, loanTermYears, incentiveAmount } = params.financingTerms;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTermYears * 12;
    
    // Calculate monthly payment using standard loan formula
    monthlyLoanPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                         (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    annualLoanPayment = monthlyLoanPayment * 12;
    
    // Apply incentives to initial cash flow
    cumulativeCashFlow += incentiveAmount;
  }
  
  // Calculate annual cash flow for 25 years
  let paybackPeriodYears = 25;
  let paybackAchieved = false;
  let totalSavings = 0;
  
  for (let year = 1; year <= 25; year++) {
    // Calculate degraded energy production
    const degradationFactor = Math.pow(1 - (params.panelDegradation / 100), year - 1);
    const yearlyProduction = params.annualProductionKWh * degradationFactor;
    
    // Calculate escalated electricity rate
    const escalationFactor = Math.pow(1 + (params.rateEscalation / 100), year - 1);
    const yearlyRate = params.electricityRate * escalationFactor;
    
    // Calculate energy savings
    const energySavings = yearlyProduction * yearlyRate;
    totalSavings += energySavings;
    
    // Calculate loan payment (0 if no financing or after loan is paid off)
    const yearlyLoanPayment = params.financingTerms && year <= params.financingTerms.loanTermYears 
      ? annualLoanPayment 
      : 0;
    
    // Calculate net cash flow
    const netCashFlow = energySavings - yearlyLoanPayment;
    cumulativeCashFlow += netCashFlow;
    
    // Determine payback period (first year with positive cumulative cash flow)
    if (!paybackAchieved && cumulativeCashFlow > 0) {
      paybackPeriodYears = year;
      paybackAchieved = true;
    }
    
    // Add to cash flow array
    cashFlow.push({
      year,
      energyProduction: yearlyProduction,
      energySavings,
      loanPayment: yearlyLoanPayment,
      netCashFlow,
      cumulativeCashFlow
    });
  }
  
  // Calculate ROI (Return on Investment)
  const roi25Year = (totalSavings / params.systemCostUSD) * 100;
  
  // Calculate NPV (Net Present Value) with 5% discount rate
  const discountRate = 0.05;
  const npv25Year = cashFlow.reduce((acc, cf) => {
    return acc + (cf.netCashFlow / Math.pow(1 + discountRate, cf.year));
  }, -params.systemCostUSD);
  
  // Calculate IRR (Internal Rate of Return) - simplified approximation
  // For a more accurate IRR, use numerical methods like Newton-Raphson
  let irr25Year = 0;
  for (let rate = 0.01; rate <= 0.25; rate += 0.0025) {
    const npvAtRate = cashFlow.reduce((acc, cf) => {
      return acc + (cf.netCashFlow / Math.pow(1 + rate, cf.year));
    }, -params.systemCostUSD);
    
    if (npvAtRate <= 0) {
      irr25Year = (rate - 0.0025) * 100;
      break;
    }
  }
  
  // Calculate LCOE (Levelized Cost of Energy)
  const totalLifetimeEnergy = cashFlow.reduce((acc, cf) => acc + cf.energyProduction, 0);
  const lcoe = params.systemCostUSD / totalLifetimeEnergy;
  
  return {
    paybackPeriodYears,
    roi25Year,
    npv25Year,
    irr25Year,
    lcoe,
    firstYearSavings: cashFlow[0].energySavings,
    lifetimeSavings: totalSavings,
    monthlyLoanPayment: monthlyLoanPayment || undefined,
    cashFlow
  };
}

/**
 * Calculates the optimal system size based on financial constraints
 * 
 * @param targetPaybackYears Target payback period in years
 * @param electricityRate Current electricity rate in $/kWh
 * @param annualConsumptionKWh Annual energy consumption in kWh
 * @param costPerWatt Installation cost per watt
 * @param rateEscalation Annual electricity rate escalation percentage
 * @returns Optimal system size in kW
 */
export function calculateOptimalSystemSize(
  targetPaybackYears: number,
  electricityRate: number,
  annualConsumptionKWh: number,
  costPerWatt: number,
  rateEscalation: number = 4.23
): number {
  // Calculate average electricity rate over target payback period
  const avgEscalationFactor = Array.from({length: targetPaybackYears})
    .reduce((acc: number, _, i) => acc + Math.pow(1 + (rateEscalation / 100), i), 0) / targetPaybackYears;
  
  const avgElectricityRate = electricityRate * avgEscalationFactor;
  
  // Calculate annual production needed for target payback
  const annualSavingsNeeded = (costPerWatt * 1000) / targetPaybackYears;
  const annualProductionNeeded = annualSavingsNeeded / avgElectricityRate;
  
  // Convert to system size in kW (assuming 1,400 kWh/kW/year production)
  const optimalSystemSizeKW = annualProductionNeeded / 1400;
  
  // Cap at 100% of consumption (1,400 kWh/kW/year)
  const maxSystemSizeKW = annualConsumptionKWh / 1400;
  
  return Math.min(optimalSystemSizeKW, maxSystemSizeKW);
} 