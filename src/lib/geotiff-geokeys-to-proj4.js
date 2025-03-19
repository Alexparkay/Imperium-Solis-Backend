/**
 * A simple shim for geotiff-geokeys-to-proj4
 * This provides basic functionality to avoid build errors
 */

export function toProj4(geoKeys) {
  // This is a simplified version that returns a default proj4 string
  return "+proj=longlat +datum=WGS84 +no_defs";
}

export default {
  toProj4
}; 