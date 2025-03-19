// Detailed explanations for solar potential calculations

export const solarExplanations = {
  systemSize: {
    title: 'System Size',
    explanation: `The system size is calculated based on the number of solar panels and the capacity of each panel.
    
    <strong>Calculation:</strong>
    System Size (kW) = Number of Panels × Panel Capacity (kW)
    
    A larger system size will generate more electricity but will also cost more to install. The optimal system size depends on your energy consumption, available roof space, and budget.`,
    sources: [
      {
        name: 'National Renewable Energy Laboratory (NREL) - PVWatts Calculator',
        url: 'https://pvwatts.nrel.gov/'
      },
      {
        name: 'Solar Energy Industries Association (SEIA)',
        url: 'https://www.seia.org/'
      }
    ]
  },
  
  roofArea: {
    title: 'Roof Area Needed',
    explanation: `The roof area needed is calculated based on the number of panels and the area of each panel.
    
    <strong>Calculation:</strong>
    Roof Area (sq ft) = Number of Panels × Panel Area (sq ft)
    
    Standard solar panels are approximately 17.6 square feet (65" × 39"). Additional space is needed for mounting hardware, setbacks from roof edges, and maintenance access.`,
    sources: [
      {
        name: 'Solar Energy Industries Association (SEIA)',
        url: 'https://www.seia.org/'
      },
      {
        name: 'Department of Energy - Solar Rooftop Potential',
        url: 'https://www.energy.gov/eere/solar/solar-rooftop-potential'
      }
    ]
  },
  
  annualProduction: {
    title: 'Annual Energy Production',
    explanation: `Annual energy production is calculated based on the system size, sun hours per day, and system efficiency.
    
    <strong>Calculation:</strong>
    Annual Production (kWh) = System Size (kW) × Sun Hours per Day × 365 days × System Efficiency
    
    System efficiency accounts for factors like panel orientation, shading, temperature effects, inverter losses, and other system losses. Typical system efficiency ranges from 70% to 80%.`,
    sources: [
      {
        name: 'National Renewable Energy Laboratory (NREL) - PVWatts Calculator',
        url: 'https://pvwatts.nrel.gov/'
      },
      {
        name: 'U.S. Department of Energy - Solar Performance and Efficiency',
        url: 'https://www.energy.gov/eere/solar/solar-performance-and-efficiency'
      }
    ]
  },
  
  monthlyProduction: {
    title: 'Monthly Energy Production',
    explanation: `Monthly energy production is calculated by dividing the annual production by 12, with adjustments for seasonal variations.
    
    <strong>Calculation:</strong>
    Monthly Production (kWh) = Annual Production (kWh) ÷ 12
    
    Actual monthly production varies throughout the year based on seasonal sun hours, weather patterns, and panel temperature. Summer months typically produce more energy than winter months.`,
    sources: [
      {
        name: 'National Renewable Energy Laboratory (NREL) - PVWatts Calculator',
        url: 'https://pvwatts.nrel.gov/'
      },
      {
        name: 'U.S. Energy Information Administration (EIA) - Solar Generation Data',
        url: 'https://www.eia.gov/electricity/data/browser/'
      }
    ]
  },
  
  energyOffset: {
    title: 'Energy Offset',
    explanation: `Energy offset is the percentage of your electricity consumption that will be covered by solar energy.
    
    <strong>Calculation:</strong>
    Energy Offset (%) = (Annual Solar Production (kWh) ÷ Annual Energy Consumption (kWh)) × 100%
    
    A 100% offset means your solar system generates as much electricity as you consume annually. However, you may still need grid electricity at night or during cloudy days, while exporting excess energy at other times.`,
    sources: [
      {
        name: 'Solar Energy Industries Association (SEIA)',
        url: 'https://www.seia.org/'
      },
      {
        name: 'Department of Energy - Solar for Homeowners',
        url: 'https://www.energy.gov/eere/solar/homeowner-s-guide-going-solar'
      }
    ]
  },
  
  systemCost: {
    title: 'System Cost',
    explanation: `The system cost is calculated based on the system size and the cost per watt.
    
    <strong>Calculation:</strong>
    System Cost ($) = System Size (kW) × 1000 × Cost per Watt ($)
    
    The cost per watt typically ranges from $2.50 to $3.50 for residential systems and $1.80 to $2.80 for commercial systems. This includes equipment, installation labor, permitting, and other soft costs.`,
    sources: [
      {
        name: 'Solar Energy Industries Association (SEIA) - Solar Market Insight',
        url: 'https://www.seia.org/research-resources/solar-market-insight-report'
      },
      {
        name: 'National Renewable Energy Laboratory (NREL) - Cost Benchmarks',
        url: 'https://www.nrel.gov/solar/solar-installed-system-cost.html'
      }
    ]
  },
  
  federalTaxCredit: {
    title: 'Federal Tax Credit',
    explanation: `The federal solar investment tax credit (ITC) allows you to deduct 30% of the cost of installing a solar energy system from your federal taxes.
    
    <strong>Calculation:</strong>
    Federal Tax Credit ($) = System Cost ($) × 30%
    
    The 30% tax credit is available through 2032. It will decrease to 26% in 2033 and 22% in 2034 before expiring for residential installations in 2035. Commercial installations will receive a permanent 10% credit after 2034.`,
    sources: [
      {
        name: 'Department of Energy - Federal Tax Credits for Solar',
        url: 'https://www.energy.gov/eere/solar/homeowner-s-guide-federal-tax-credit-solar-photovoltaics'
      },
      {
        name: 'Solar Energy Industries Association (SEIA) - Solar Investment Tax Credit',
        url: 'https://www.seia.org/initiatives/solar-investment-tax-credit-itc'
      }
    ]
  },
  
  paybackPeriod: {
    title: 'Payback Period',
    explanation: `The payback period is the time it takes for the energy savings to equal the initial investment.
    
    <strong>Calculation:</strong>
    Payback Period (years) = Net System Cost ($) ÷ Annual Energy Savings ($)
    
    Net System Cost = System Cost - Federal Tax Credit - Other Incentives
    Annual Energy Savings = Annual Production (kWh) × Electricity Rate ($/kWh)
    
    The payback period is affected by electricity rates, system performance, and available incentives. Typical payback periods range from 5 to 15 years.`,
    sources: [
      {
        name: 'National Renewable Energy Laboratory (NREL) - Solar Payback Calculator',
        url: 'https://www.nrel.gov/analysis/tech-lcoe-re-cost-est.html'
      },
      {
        name: 'Department of Energy - Solar Payback Period',
        url: 'https://www.energy.gov/energysaver/planning-home-solar-electric-system'
      }
    ]
  },
  
  lifetimeSavings: {
    title: '25-Year Savings',
    explanation: `The 25-year savings represent the total financial benefit over the expected lifetime of the solar system.
    
    <strong>Calculation:</strong>
    25-Year Savings ($) = (Annual Energy Savings ($) × 25 years) - Net System Cost ($)
    
    This calculation accounts for panel degradation (typically 0.5% per year), electricity rate increases (typically 2-4% per year), and maintenance costs. Solar panels typically have a 25-30 year warranty but can produce electricity for 30-40 years.`,
    sources: [
      {
        name: 'National Renewable Energy Laboratory (NREL) - Solar Lifetime Value',
        url: 'https://www.nrel.gov/docs/fy19osti/72399.pdf'
      },
      {
        name: 'Solar Energy Industries Association (SEIA)',
        url: 'https://www.seia.org/'
      }
    ]
  },
  
  roi: {
    title: 'Return on Investment (ROI)',
    explanation: `ROI measures the profitability of your solar investment as a percentage.
    
    <strong>Calculation:</strong>
    ROI (%) = (25-Year Savings ($) ÷ Net System Cost ($)) × 100%
    
    A higher ROI indicates a more profitable investment. Solar systems typically have an ROI of 10-20%, which compares favorably to many other investments. The ROI is affected by electricity rates, system performance, and available incentives.`,
    sources: [
      {
        name: 'National Renewable Energy Laboratory (NREL) - Solar ROI Analysis',
        url: 'https://www.nrel.gov/analysis/tech-lcoe-re-cost-est.html'
      },
      {
        name: 'Solar Energy Industries Association (SEIA)',
        url: 'https://www.seia.org/'
      }
    ]
  }
}; 