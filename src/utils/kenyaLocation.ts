import { KENYAN_COUNTIES } from '@/data/kenya';

// Kenya county boundaries (simplified - in production, use proper GeoJSON)
const COUNTY_BOUNDARIES: Record<string, { lat: [number, number]; lng: [number, number] }> = {
  'Nairobi': { lat: [-1.35, -1.20], lng: [36.70, 36.92] },
  'Kiambu': { lat: [-1.17, -0.90], lng: [36.70, 37.15] },
  'Nakuru': { lat: [-1.08, 0.40], lng: [35.70, 36.40] },
  'Mombasa': { lat: [-4.08, -3.95], lng: [39.58, 39.75] },
  'Kisumu': { lat: [-0.18, 0.05], lng: [34.60, 34.90] },
  'Machakos': { lat: [-1.55, -0.90], lng: [36.90, 37.50] },
  'Kajiado': { lat: [-2.90, -1.00], lng: [36.00, 37.50] },
  'Nyeri': { lat: [-0.65, -0.20], lng: [36.80, 37.15] },
  'Murang\'a': { lat: [-0.95, -0.55], lng: [36.80, 37.25] },
  'Meru': { lat: [-0.40, 0.20], lng: [37.40, 38.00] },
  // Add more counties as needed
};

export const detectKenyanCounty = (latitude: number, longitude: number): string | null => {
  for (const [county, bounds] of Object.entries(COUNTY_BOUNDARIES)) {
    if (
      latitude >= bounds.lat[0] &&
      latitude <= bounds.lat[1] &&
      longitude >= bounds.lng[0] &&
      longitude <= bounds.lng[1]
    ) {
      return county;
    }
  }
  return null;
};

// Reverse geocode using nominatim (free service)
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<{ county: string | null; constituency: string | null }> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
    );
    
    const data = await response.json();
    
    // Try to extract county from OpenStreetMap data
    const county = data.address?.county || data.address?.state || detectKenyanCounty(latitude, longitude);
    const constituency = data.address?.suburb || data.address?.town || null;
    
    return { county, constituency };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      county: detectKenyanCounty(latitude, longitude),
      constituency: null
    };
  }
};

// Determine agro-ecological zone based on altitude and location
export const determineAgroZone = (
  latitude: number,
  longitude: number,
  altitude?: number
): string => {
  // Simplified agro-zone determination
  // In production, use proper maps and altitude data
  
  const absLat = Math.abs(latitude);
  const estimatedAltitude = altitude || 1000; // default estimate
  
  // Coastal lowland
  if (longitude > 39.5 && estimatedAltitude < 500) {
    return 'CL2';
  }
  
  // Upper highland (above 2400m)
  if (estimatedAltitude > 2400) {
    return 'UH2';
  }
  
  // Lower highland (1800-2400m)
  if (estimatedAltitude > 1800) {
    return 'LH2';
  }
  
  // Upper midland (1500-1800m)
  if (estimatedAltitude > 1500) {
    return 'UM2';
  }
  
  // Lower midland
  if (estimatedAltitude > 900) {
    return 'LM3';
  }
  
  // Inland lowland
  return 'IL3';
};

export const formatKenyanPhone = (phone: string): string => {
  // Remove any non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If starts with 0, replace with 254
  if (digits.startsWith('0')) {
    return '254' + digits.substring(1);
  }
  
  // If starts with +254 or 254, ensure it's 254
  if (digits.startsWith('254')) {
    return digits;
  }
  
  // If it's 9 digits, assume it's missing the country code
  if (digits.length === 9) {
    return '254' + digits;
  }
  
  return digits;
};

export const validateKenyanPhone = (phone: string): boolean => {
  const formatted = formatKenyanPhone(phone);
  // Kenyan numbers are 254 + 9 digits (e.g., 254712345678)
  return /^254\d{9}$/.test(formatted);
};
