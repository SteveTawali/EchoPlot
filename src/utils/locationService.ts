export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface ClimateData {
  zone: 'tropical' | 'temperate' | 'cold' | 'mediterranean';
  temperature: number;
  humidity: number;
  rainfall: number;
  season: string;
}

export const requestLocationPermission = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
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
