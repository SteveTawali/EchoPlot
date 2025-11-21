/**
 * Supabase Edge Function: Get Weather Data
 * 
 * Fetches current weather and climate data from OpenWeatherMap API
 * 
 * Environment Variables Required:
 * - OPENWEATHER_API_KEY: Your OpenWeatherMap API key
 * 
 * Environment Variables Optional:
 * - ALLOWED_ORIGINS: Comma-separated list of allowed CORS origins (e.g., "https://yourdomain.com,https://www.yourdomain.com")
 *   If not set, allows all origins (development mode)
 * - ENVIRONMENT: Set to "production" to enforce CORS restrictions
 * 
 * Configuration in Supabase Dashboard:
 * 1. Go to Edge Functions > get-weather-data > Settings
 * 2. Add secrets: OPENWEATHER_API_KEY, ALLOWED_ORIGINS (optional), ENVIRONMENT (optional)
 * 3. For production: Set ENVIRONMENT=production and ALLOWED_ORIGINS to your domain(s)
 */

// @ts-expect-error - Deno runtime types
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Deno global type declaration for TypeScript
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// CORS configuration
// Allowed origins can be set via ALLOWED_ORIGINS environment variable (comma-separated)
// Example: ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
// In development or if not set, allows all origins for easier testing
const getCorsHeaders = (origin: string | null) => {
  const allowedOriginsEnv = Deno.env.get('ALLOWED_ORIGINS');
  const isDev = Deno.env.get('ENVIRONMENT') !== 'production';
  
  // Determine allowed origins
  let allowedOrigins: string[] = [];
  if (allowedOriginsEnv) {
    // Parse comma-separated origins from environment variable
    allowedOrigins = allowedOriginsEnv.split(',').map(o => o.trim()).filter(Boolean);
  }
  
  // Determine the CORS origin header value
  let corsOrigin: string;
  if (isDev || allowedOrigins.length === 0) {
    // Development mode or no restrictions: allow all origins
    corsOrigin = '*';
  } else if (origin && allowedOrigins.includes(origin)) {
    // Production: only allow if origin is in the allowed list
    corsOrigin = origin;
  } else {
    // Production: origin not allowed, reject by not setting CORS header
    // Return null to indicate request should be rejected
    return null;
  }
  
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
  };
};

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    if (corsHeaders === null) {
      // Origin not allowed - reject preflight
      return new Response(null, { status: 403 });
    }
    return new Response(null, { headers: corsHeaders });
  }
  
  // Reject requests from disallowed origins
  if (corsHeaders === null) {
    return new Response(
      JSON.stringify({ error: 'Origin not allowed' }),
      { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const { latitude, longitude } = await req.json();
    const { lat, lon } = validateCoordinates(latitude, longitude);
    const weatherData = await fetchWeatherData(lat, lon);
    const dailyData = await fetchClimateData(lat, lon);
    const result = buildWeatherResult(weatherData, dailyData);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error fetching weather data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Full error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

/**
 * Validate and parse coordinates
 */
function validateCoordinates(latitude: unknown, longitude: unknown): { lat: number; lon: number } {
  if (latitude === undefined || longitude === undefined) {
    throw new Error('Latitude and longitude are required');
  }
  
  const lat = Number(latitude);
  const lon = Number(longitude);
  
  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    throw new TypeError('Latitude and longitude must be valid numbers');
  }
  
  if (lat < -90 || lat > 90) {
    throw new Error('Latitude must be between -90 and 90');
  }
  
  if (lon < -180 || lon > 180) {
    throw new Error('Longitude must be between -180 and 180');
  }
  
  return { lat, lon };
}

/**
 * Fetch current weather data from OpenWeatherMap
 */
async function fetchWeatherData(lat: number, lon: number) {
  const OPENWEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY');
  if (!OPENWEATHER_API_KEY) {
    console.error('OpenWeather API key not configured');
    throw new Error('OpenWeather API key not configured');
  }

  console.log('Fetching weather for:', { latitude: lat, longitude: lon });

  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
  const weatherResponse = await fetch(weatherUrl);
  
  if (!weatherResponse.ok) {
    const errorText = await weatherResponse.text();
    console.error('OpenWeather API error:', {
      status: weatherResponse.status,
      statusText: weatherResponse.statusText,
      error: errorText
    });
    throw new Error(`Weather API returned ${weatherResponse.status}: ${errorText}`);
  }

  const weatherData = await weatherResponse.json();
  console.log('Weather data received successfully');
  return weatherData;
}

/**
 * Fetch climate forecast data (non-critical, returns null if fails)
 */
async function fetchClimateData(lat: number, lon: number) {
  const OPENWEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY');
  if (!OPENWEATHER_API_KEY) return null;

  const climateUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&exclude=minutely,hourly,alerts`;
  const climateResponse = await fetch(climateUrl);
  
  if (climateResponse.ok) {
    const climateData = await climateResponse.json();
    return climateData.daily?.slice(0, 7) || null; // Next 7 days
  } else {
    console.warn('Climate data fetch failed (non-critical):', climateResponse.status);
    return null;
  }
}

/**
 * Build the weather result object
 */
function buildWeatherResult(weatherData: any, dailyData: any) {
  return {
    current: {
      temperature: weatherData.main.temp,
      feels_like: weatherData.main.feels_like,
      humidity: weatherData.main.humidity,
      pressure: weatherData.main.pressure,
      weather: weatherData.weather[0].main,
      description: weatherData.weather[0].description,
      wind_speed: weatherData.wind.speed,
      clouds: weatherData.clouds.all,
    },
    location: {
      name: weatherData.name,
      country: weatherData.sys.country,
      sunrise: weatherData.sys.sunrise,
      sunset: weatherData.sys.sunset,
    },
    forecast: dailyData,
    // Estimate annual rainfall based on current conditions and climate
    // This is a rough estimation - for production, use climate database APIs
    estimated_annual_rainfall: calculateAnnualRainfall(weatherData.main.humidity, weatherData.clouds.all),
  };
}

/**
 * Calculate estimated annual rainfall
 */
function calculateAnnualRainfall(humidity: number, cloudCoverage: number): number {
  // Rough estimation based on humidity and cloud coverage
  // Real implementation would use historical climate data
  const baseRainfall = 500; // mm per year baseline
  const humidityFactor = (humidity / 100) * 800; // 0-800mm based on humidity
  const cloudFactor = (cloudCoverage / 100) * 400; // 0-400mm based on clouds
  
  return Math.round(baseRainfall + humidityFactor + cloudFactor);
}
