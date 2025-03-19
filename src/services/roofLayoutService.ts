import type { BuildingInsightsResponse } from '../routes/solar';

interface SetbackRules {
  edgeSetbackFt: number;  // Setback from roof edges in feet
  obstructionSetbackFt: number;  // Setback from obstructions in feet
  walkwayWidthFt: number;  // Width of maintenance walkways in feet
}

interface RoofObstruction {
  type: 'vent' | 'hvac' | 'skylight' | 'chimney' | 'other';
  position: {
    latitude: number;
    longitude: number;
  };
  radiusFt?: number;  // For circular obstructions
  dimensions?: {
    widthFt: number;
    heightFt: number;
  };  // For rectangular obstructions
}

export interface RoofLayoutResult {
  usableAreaSqFt: number;
  maxPanelCount: number;
  panelRows: number;
  panelColumns: number;
  walkwayAreaSqFt: number;
  setbackAreaSqFt: number;
  obstructionAreaSqFt: number;
  orientationEfficiency: {
    south: number;
    west: number;
    east: number;
    north: number;
  };
  installationTimeHours: number;
  installationCostUSD: number;
}

const DEFAULT_SETBACK_RULES: SetbackRules = {
  edgeSetbackFt: 4.0,  // Default 4ft setback from roof edges
  obstructionSetbackFt: 4.0,  // Default 4ft clearance around obstructions
  walkwayWidthFt: 3.5,  // Default 3.5ft maintenance walkways
};

/**
 * Calculates the optimal solar panel layout based on roof geometry and setback rules
 * 
 * @param buildingInsights BuildingInsightsResponse from Google Solar API
 * @param panelWidthFt Width of solar panel in feet
 * @param panelHeightFt Height of solar panel in feet
 * @param obstructions Optional array of roof obstructions
 * @param setbackRules Optional custom setback rules
 * @returns RoofLayoutResult with layout details
 */
export function calculateOptimalLayout(
  buildingInsights: BuildingInsightsResponse,
  panelWidthFt: number,
  panelHeightFt: number,
  obstructions: RoofObstruction[] = [],
  setbackRules: SetbackRules = DEFAULT_SETBACK_RULES
): RoofLayoutResult {
  // Get roof dimensions from building insights
  const totalRoofAreaSqFt = buildingInsights.solarPotential.wholeRoofStats.areaMeters2 * 10.764; // Convert m² to sq ft
  
  // Calculate setback area (simplified calculation)
  const roofPerimeterFt = Math.sqrt(totalRoofAreaSqFt) * 4; // Approximate perimeter
  const setbackAreaSqFt = roofPerimeterFt * setbackRules.edgeSetbackFt;
  
  // Calculate obstruction area including setbacks
  let obstructionAreaSqFt = 0;
  for (const obstruction of obstructions) {
    if (obstruction.radiusFt) {
      // Circular obstruction
      const totalRadius = obstruction.radiusFt + setbackRules.obstructionSetbackFt;
      obstructionAreaSqFt += Math.PI * totalRadius * totalRadius;
    } else if (obstruction.dimensions) {
      // Rectangular obstruction
      const totalWidth = obstruction.dimensions.widthFt + (2 * setbackRules.obstructionSetbackFt);
      const totalHeight = obstruction.dimensions.heightFt + (2 * setbackRules.obstructionSetbackFt);
      obstructionAreaSqFt += totalWidth * totalHeight;
    }
  }
  
  // Calculate walkway area (simplified)
  // Assume one walkway per 20ft of roof width
  const roofWidth = Math.sqrt(totalRoofAreaSqFt);
  const walkwayCount = Math.max(1, Math.floor(roofWidth / 20));
  const walkwayAreaSqFt = roofWidth * setbackRules.walkwayWidthFt * walkwayCount;
  
  // Calculate usable area
  const usableAreaSqFt = Math.max(0, totalRoofAreaSqFt - setbackAreaSqFt - obstructionAreaSqFt - walkwayAreaSqFt);
  
  // Calculate max panel count
  const panelAreaSqFt = panelWidthFt * panelHeightFt;
  const maxPanelCount = Math.floor(usableAreaSqFt / panelAreaSqFt);
  
  // Calculate panel rows and columns (simplified)
  const aspectRatio = roofWidth / (totalRoofAreaSqFt / roofWidth);
  const panelColumns = Math.floor(Math.sqrt(maxPanelCount * aspectRatio));
  const panelRows = Math.floor(maxPanelCount / panelColumns);
  
  // Calculate orientation efficiency based on roof segments
  const orientationEfficiency = {
    south: 1.0,  // South-facing is optimal (100%)
    west: 0.85,  // West-facing is good for afternoon production
    east: 0.8,   // East-facing is good for morning production
    north: 0.65  // North-facing is least optimal
  };
  
  // Calculate installation time and cost
  // Industry average: 3 hours per kW for residential installations
  const avgPanelCapacityKw = buildingInsights.solarPotential.panelCapacityWatts / 1000;
  const totalCapacityKw = maxPanelCount * avgPanelCapacityKw;
  const installationTimeHours = totalCapacityKw * 3;
  
  // Installation cost: $2.85 per watt is industry average
  const installationCostUSD = totalCapacityKw * 1000 * 2.85;
  
  return {
    usableAreaSqFt,
    maxPanelCount,
    panelRows,
    panelColumns,
    walkwayAreaSqFt,
    setbackAreaSqFt,
    obstructionAreaSqFt,
    orientationEfficiency,
    installationTimeHours,
    installationCostUSD
  };
}

/**
 * Calculates the yield adjustment factor based on panel orientation
 * 
 * @param orientation Panel orientation in degrees (0 = North, 90 = East, 180 = South, 270 = West)
 * @param tilt Panel tilt in degrees from horizontal
 * @returns Yield adjustment factor (1.0 = optimal)
 */
export function calculateOrientationYieldFactor(orientation: number, tilt: number): number {
  // Normalize orientation to 0-360 range
  const normalizedOrientation = ((orientation % 360) + 360) % 360;
  
  // South is optimal (180 degrees)
  const southFactor = Math.cos((normalizedOrientation - 180) * Math.PI / 180);
  
  // Adjust for tilt (optimal tilt varies by latitude, but ~30-40 degrees is typical)
  const optimalTilt = 35; // Simplified - should be based on latitude
  const tiltFactor = Math.cos((tilt - optimalTilt) * Math.PI / 180);
  
  // Combine factors (weighted more heavily toward orientation)
  return Math.max(0.6, (southFactor * 0.7) + (tiltFactor * 0.3));
} 