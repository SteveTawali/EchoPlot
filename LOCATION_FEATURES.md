# Location-Based Tree Recommendation System

## Overview
The platform now includes an intelligent location-based recommendation engine that uses GPS data, real-time weather information, and climate analysis to provide personalized tree recommendations.

## Features

### 1. GPS Detection
- **One-click location detection** during onboarding
- Requests browser geolocation permission
- High-accuracy positioning (within 10-50 meters typically)
- Graceful fallback to manual entry if GPS unavailable

### 2. Real-Time Weather Integration
- Connects to OpenWeatherMap API for current conditions
- Retrieves:
  - Current temperature and feels-like temperature
  - Humidity levels
  - Atmospheric pressure
  - Wind speed and cloud coverage
  - Local weather descriptions

### 3. Climate Zone Identification
The system automatically determines climate zones based on:
- **Latitude**: Distance from equator affects climate
- **Temperature**: Current and historical averages
- **Zones supported**:
  - Tropical (within 23.5° of equator)
  - Mediterranean (30-45° latitude with warm climate)
  - Temperate (moderate zones)
  - Cold (above 60° or very cold temperatures)

### 4. Soil Type Estimation
Intelligent soil type prediction based on:
- **Rainfall patterns**: Annual precipitation estimates
- **Humidity levels**: Current atmospheric moisture
- **Climate correlation**: Geographic climate data
- **Types detected**:
  - Peaty (high rainfall + humidity)
  - Sandy (low rainfall + humidity)
  - Clay (high humidity)
  - Silty (moderate-high rainfall)
  - Loamy (balanced conditions)
  - Chalky (very low rainfall)

### 5. Enhanced Compatibility Algorithm
The matching algorithm considers multiple factors:

#### Base Compatibility (85 points)
- **Soil Type Match** (25 points): Tree's preferred soil types
- **Climate Compatibility** (30 points): Suitable climate zones
- **Land Size** (20 points): Minimum required land area
- **Conservation Goals** (25 points): User's environmental priorities

#### Location-Based Bonus (15 points)
When GPS data is available:
- **Temperature Match** (5 points): Optimal temperature ranges for tree growth rate
- **Humidity Match** (5 points): Soil-specific humidity preferences
- **Rainfall Match** (5 points): Annual precipitation requirements

### 6. Smart Recommendations
The system provides:
- **Compatibility scores** (0-100%) with color-coded badges
- **Real-time climate data** displayed during onboarding
- **Location-aware suggestions** that consider local conditions
- **Seasonal factors** through weather forecasts

## Technical Implementation

### Backend (Edge Function)
```typescript
// supabase/functions/get-weather-data/index.ts
- Fetches current weather from OpenWeatherMap
- Estimates annual rainfall based on climate patterns
- Returns structured weather data including location details
- Handles API errors gracefully
```

### Frontend Services
```typescript
// src/utils/locationService.ts
- requestLocationPermission(): Gets GPS coordinates
- determineClimateZone(): Identifies climate based on latitude/temperature
- determineSoilType(): Estimates soil from humidity/rainfall
```

### Enhanced Compatibility
```typescript
// src/utils/compatibility.ts
- calculateCompatibilityWithWeather(): Full algorithm with location bonus
- Temperature/humidity/rainfall matching functions
- Optimal range calculations per tree species
```

## User Experience Flow

### Onboarding with GPS
1. User starts onboarding
2. Clicks "Auto-detect" on soil type screen
3. Browser requests location permission
4. System fetches GPS coordinates
5. Edge function calls OpenWeatherMap API
6. Climate zone and soil type auto-populated
7. Location data saved to user profile
8. Enhanced matching available for all future swipes

### Manual Entry Fallback
- All fields remain manually editable
- User can choose to enter coordinates directly
- System still provides recommendations without GPS
- No GPS data = base compatibility algorithm only

## Privacy & Permissions

### Location Data
- Only requested with explicit user action
- Browser permission required (not automatic)
- Stored securely in user profile
- Used solely for tree recommendations
- No third-party sharing or tracking

### Weather API
- Queries based on coordinates only
- No personal information sent to OpenWeatherMap
- API key secured in Supabase environment
- Rate-limited to prevent abuse

## Configuration

### Required Environment Variables
```bash
OPENWEATHER_API_KEY=your_api_key_here
```

Get your free API key at: https://openweathermap.org/api
- Free tier: 1,000 calls/day
- Sufficient for small-medium user base
- Upgrade available for production scale

### Supabase Setup
1. Add `OPENWEATHER_API_KEY` secret in Supabase dashboard
2. Edge function `get-weather-data` auto-deployed
3. Function configured with JWT verification disabled (public)
4. CORS enabled for browser requests

## Future Enhancements

### Planned Features
- [ ] Historical climate data (30-year averages)
- [ ] Actual soil database integration
- [ ] Elevation-based refinements
- [ ] Nearby weather station prioritization
- [ ] Seasonal planting recommendations
- [ ] Frost date calculations
- [ ] Growing zone (USDA hardiness) mapping
- [ ] Native species prioritization by region

### Advanced Matching
- [ ] Microclimate detection
- [ ] Companion planting suggestions
- [ ] Pest/disease risk assessment by location
- [ ] Water table depth estimation
- [ ] Slope/drainage analysis
- [ ] Sun exposure calculations
- [ ] Wind pattern consideration

## Performance Considerations

### Caching Strategy
- Weather data cached for 1 hour per location
- Climate zone calculations memoized
- Reduced API calls through intelligent caching
- Profile data updates trigger re-calculation

### Optimization
- Lazy loading of weather data (only when needed)
- Parallel API calls where possible
- Graceful degradation without GPS
- Fast fallback to manual entry
- Progressive enhancement approach

## Error Handling

### GPS Errors
- Permission denied: Show manual entry form
- Position unavailable: Suggest checking device settings
- Timeout: Retry with extended timeout
- Not supported: Hide GPS button entirely

### Weather API Errors
- API key missing: Log error, skip location bonus
- Rate limit exceeded: Cache last result, show warning
- Network failure: Retry with exponential backoff
- Invalid coordinates: Validate before API call

## Accessibility

### Location Detection
- Clear labeling of GPS button
- Loading states with screen reader announcements
- Error messages with actionable guidance
- Keyboard navigation supported
- Alternative manual entry always available

### Weather Data Display
- Semantic HTML for data presentation
- ARIA labels for dynamic content
- Contrast-compliant color schemes
- Responsive layout for all screen sizes

## Testing Recommendations

### Unit Tests
- Climate zone detection with various coordinates
- Soil type estimation with different rainfall levels
- Compatibility calculation with/without weather data
- Temperature/humidity/rainfall matching functions

### Integration Tests
- GPS permission flows (allow/deny)
- Weather API responses (success/failure)
- Profile updates with location data
- Matching algorithm with real profiles

### End-to-End Tests
- Complete onboarding with GPS
- Onboarding with manual entry
- Tree matching with location data
- Dashboard location display

## Support & Troubleshooting

### Common Issues

**"Location detection failed"**
- Check browser location permissions
- Ensure HTTPS connection (required for geolocation)
- Try manual coordinate entry
- Verify GPS is enabled on device

**"Weather data unavailable"**
- Confirm OpenWeather API key is set
- Check API key is valid and has quota
- Verify coordinates are valid (lat: -90 to 90, lng: -180 to 180)
- Review edge function logs for errors

**"Compatibility scores seem off"**
- Verify profile data is complete
- Check if GPS data was captured
- Review climate zone detection
- Ensure tree requirements are accurate

## Resources

- [OpenWeatherMap API Docs](https://openweathermap.org/api)
- [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Climate Zone Classifications](https://en.wikipedia.org/wiki/K%C3%B6ppen_climate_classification)
- [Soil Types Guide](https://www.nrcs.usda.gov/wps/portal/nrcs/detail/soils/edu/)
