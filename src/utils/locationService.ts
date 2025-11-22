import { logger } from "@/utils/logger";

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  source: 'gps' | 'ip' | 'manual' | 'cached';
  timestamp: number;
}

export interface CachedLocationData extends LocationData {
  weatherData?: Record<string, unknown>;
}

export interface ClimateData {
  zone: 'tropical' | 'temperate' | 'cold' | 'mediterranean';
  temperature: number;
  humidity: number;
  rainfall: number;
  season: string;
  optimalPlantingMonths: number[];
}

const LOCATION_CACHE_KEY = 'treeMatch_locationCache';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// Cache management
export const getCachedLocation = (): CachedLocationData | null => {
  try {
    const cached = localStorage.getItem(LOCATION_CACHE_KEY);
    if (!cached) return null;

    const data = JSON.parse(cached) as CachedLocationData;
    const isExpired = Date.now() - data.timestamp > CACHE_EXPIRY_MS;

    if (isExpired) {
      localStorage.removeItem(LOCATION_CACHE_KEY);
      return null;
    }

    return data;
  } catch {
    return null;
  }
};

export const cacheLocation = (location: LocationData, weatherData?: Record<string, unknown>): void => {
  try {
    const cacheData: CachedLocationData = {
      ...location,
      weatherData,
      timestamp: Date.now(),
    };
    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    logger.error('Failed to cache location:', error);
  }
};

// GPS-based location with high accuracy
export const requestLocationPermission = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          source: 'gps',
          timestamp: Date.now(),
        };
        cacheLocation(locationData);
        resolve(locationData);
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Trying IP-based location...';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }

        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

// IP-based location fallback
export const getLocationFromIP = async (): Promise<LocationData> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();

    if (!data.latitude || !data.longitude) {
      throw new Error('Unable to determine location from IP');
    }

    const locationData: LocationData = {
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: 5000, // IP-based is less accurate (approx 5km)
      source: 'ip',
      timestamp: Date.now(),
    };

    cacheLocation(locationData);
    return locationData;
  } catch (error) {
    throw new Error('Failed to get location from IP address');
  }
};

// Smart location detection with fallback chain
export const detectLocation = async (): Promise<LocationData> => {
  // 1. Try cached location first
  const cached = getCachedLocation();
  if (cached) {
    logger.log('Using cached location');
    return cached;
  }

  // 2. Try GPS
  try {
    logger.log('Attempting GPS location...');
    return await requestLocationPermission();
  } catch (gpsError) {
    logger.log('GPS failed, falling back to IP location');

    // 3. Fallback to IP-based location
    try {
      return await getLocationFromIP();
    } catch (ipError) {
      throw new Error('All location detection methods failed. Please enter location manually.');
    }
  }
};

export const determineClimateZone = (latitude: number, temperature: number): ClimateData['zone'] => {
  const absLat = Math.abs(latitude);

  // Mediterranean climate (30-45 degrees with warm dry summers)
  if (absLat >= 30 && absLat <= 45 && temperature > 15) {
    return 'mediterranean';
  }

  // Tropical (within 23.5 degrees of equator)
  if (absLat < 23.5) {
    return 'tropical';
  }

  // Cold (above 60 degrees or very cold temps)
  if (absLat > 60 || temperature < 5) {
    return 'cold';
  }

  // Temperate (everything else)
  return 'temperate';
};

export const determineSoilType = (humidity: number, rainfall: number): 'clay' | 'sandy' | 'loamy' | 'silty' | 'peaty' | 'chalky' => {
  // This is a simplified estimation based on climate data
  // In a production app, you'd want to use actual soil data APIs or databases

  if (rainfall > 1000 && humidity > 70) {
    return 'peaty'; // High rainfall and humidity suggests organic-rich soil
  }

  if (rainfall < 500 && humidity < 50) {
    return 'sandy'; // Low rainfall and humidity suggests sandy soil
  }

  if (humidity > 80) {
    return 'clay'; // High humidity often correlates with clay-heavy soils
  }

  if (rainfall > 800 && rainfall < 1000) {
    return 'silty'; // Moderate-high rainfall suggests silty soil
  }

  if (rainfall < 300) {
    return 'chalky'; // Very low rainfall suggests chalky/alkaline soil
  }

  return 'loamy'; // Default to loamy as it's most common
};

// Determine current season and optimal planting months
export const getCurrentSeason = (latitude: number): { season: string; optimalPlantingMonths: number[] } => {
  const month = new Date().getMonth(); // 0-11
  const isNorthern = latitude >= 0;

  let season: string;
  let optimalPlantingMonths: number[];

  if (isNorthern) {
    // Northern hemisphere
    if (month >= 2 && month <= 4) {
      season = 'Spring';
      optimalPlantingMonths = [2, 3, 4]; // March, April, May
    } else if (month >= 5 && month <= 7) {
      season = 'Summer';
      optimalPlantingMonths = [8, 9]; // September, October
    } else if (month >= 8 && month <= 10) {
      season = 'Fall';
      optimalPlantingMonths = [2, 3, 4, 9, 10]; // Spring or Fall
    } else {
      season = 'Winter';
      optimalPlantingMonths = [2, 3, 4]; // Wait for Spring
    }
  } else {
    // Southern hemisphere (seasons reversed)
    if (month >= 2 && month <= 4) {
      season = 'Fall';
      optimalPlantingMonths = [2, 3, 4, 9, 10];
    } else if (month >= 5 && month <= 7) {
      season = 'Winter';
      optimalPlantingMonths = [8, 9];
    } else if (month >= 8 && month <= 10) {
      season = 'Spring';
      optimalPlantingMonths = [8, 9, 10];
    } else {
      season = 'Summer';
      optimalPlantingMonths = [2, 3];
    }
  }

  return { season, optimalPlantingMonths };
};

// Get location accuracy rating
export const getLocationAccuracyRating = (accuracy: number, source: LocationData['source']): {
  rating: 'high' | 'medium' | 'low';
  description: string;
  color: string;
} => {
  if (source === 'gps' && accuracy < 100) {
    return {
      rating: 'high',
      description: 'Precise GPS location (±' + Math.round(accuracy) + 'm)',
      color: 'text-green-600'
    };
  } else if (source === 'gps' || (source === 'ip' && accuracy < 10000)) {
    return {
      rating: 'medium',
      description: source === 'gps' ? 'GPS location (±' + Math.round(accuracy) + 'm)' : 'IP-based location (±5km)',
      color: 'text-yellow-600'
    };
  } else {
    return {
      rating: 'low',
      description: 'Approximate location - consider manual entry',
      color: 'text-orange-600'
    };
  }
};
