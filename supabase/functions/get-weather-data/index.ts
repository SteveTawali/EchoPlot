import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude } = await req.json();
    
    if (!latitude || !longitude) {
      throw new Error('Latitude and longitude are required');
    }

    const OPENWEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY');
    if (!OPENWEATHER_API_KEY) {
      throw new Error('OpenWeather API key not configured');
    }

    // Get current weather data
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const weatherResponse = await fetch(weatherUrl);
    
    if (!weatherResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const weatherData = await weatherResponse.json();

    // Get climate data (historical averages)
    const climateUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric&exclude=minutely,hourly,alerts`;
    const climateResponse = await fetch(climateUrl);
    
    let dailyData = null;
    if (climateResponse.ok) {
      const climateData = await climateResponse.json();
      dailyData = climateData.daily?.slice(0, 7); // Next 7 days
    }

    const result = {
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
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
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

function calculateAnnualRainfall(humidity: number, cloudCoverage: number): number {
  // Rough estimation based on humidity and cloud coverage
  // Real implementation would use historical climate data
  const baseRainfall = 500; // mm per year baseline
  const humidityFactor = (humidity / 100) * 800; // 0-800mm based on humidity
  const cloudFactor = (cloudCoverage / 100) * 400; // 0-400mm based on clouds
  
  return Math.round(baseRainfall + humidityFactor + cloudFactor);
}
