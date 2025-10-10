# Kenya Location-Based Tree Recommendation System

## Overview
The Canopy Connections platform uses advanced location-based matching to recommend trees that are scientifically proven to thrive in specific Kenyan regions.

## Location Detection & Filtering

### 1. GPS & County Detection
- **Automatic GPS Detection**: Uses device location to determine county and constituency
- **Manual Selection**: Users can manually select their county during onboarding
- **Agro-Ecological Zone Mapping**: System maps locations to Kenya's agro-ecological zones (LH1-UH6)

### 2. Smart Tree Filtering
Trees are filtered BEFORE being shown to users based on:
- **County Match (40 points)**: Trees must be suitable for the user's county
- **Agro-Zone Match (35 points)**: Trees must match the local agro-ecological zone
- **Conservation Goals (25 points)**: Trees must align with user's goals

#### Compatibility Threshold
- Only trees with **50%+ compatibility** are shown
- Trees are sorted by compatibility score (best matches first)
- Real-time recalculation when location is updated

### 3. Weather Integration
- **Kenya Met Department Data**: Real-time weather data for accurate recommendations
- **Temperature Matching**: Validates tree suitability based on current temperatures
- **Rainfall Estimation**: Annual rainfall patterns matched to tree requirements

## Tree Species Database

### KEFRI-Aligned Data
All tree species include:
- English and Swahili names
- Scientific names
- KEFRI codes (where applicable)
- Suitable counties list
- Compatible agro-ecological zones
- Pricing (KSH)
- Use cases (fruit, timber, fodder, medicine, shade, conservation)

### Example Species:
1. **Grevillea (Grevelia)**
   - Counties: Nyeri, Kiambu, Murang'a, Embu, Meru, Nakuru
   - Zones: UH1, UH2, UM1, UM2, LH1, LH2
   - Uses: Timber, shade, conservation
   - Price: KSH 150

2. **Mango (Muembe)**
   - Counties: Mombasa, Kilifi, Kwale, Taita-Taveta, Makueni, Machakos
   - Zones: CL1, CL2, LM1, LM2
   - Uses: Fruit, shade
   - Price: KSH 200

3. **Acacia (Mgunga)**
   - Counties: Kajiado, Taita-Taveta, Makueni, Kitui, Baringo
   - Zones: IL1, IL2, IL3, LM3, LM4
   - Uses: Fodder, conservation, timber
   - Price: KSH 100

## Seasonal Recommendations

### Kenya's Planting Seasons
1. **Long Rains**: March - May (Primary season)
2. **Short Rains**: October - November (Secondary season)

### Season Rating System
- **Optimal**: Current month is a planting season
- **Acceptable**: 1-2 months until next planting season
- **Poor**: More than 2 months until next season

## Success Probability Calculator

Factors considered:
- **Location Factor (35%)**: County compatibility
- **Agro-Zone Factor (30%)**: Zone suitability
- **Season Factor (20%)**: Current planting season
- **Weather Factor (15%)**: Real-time weather conditions

### Ratings
- **Very High (85%+)**: Perfect conditions
- **High (70-84%)**: Excellent conditions
- **Moderate (50-69%)**: Acceptable conditions
- **Low (<50%)**: Not recommended

## Admin Verification Workflow

### County-Based Moderation
- KFS officers assigned to specific counties
- Agricultural extension officers as moderators
- County-level verification queues

### Verification Process
1. User plants tree and submits photo with GPS location
2. System validates location matches user's county
3. Moderator assigned to that county reviews submission
4. Verification status: Pending → Verified/Rejected
5. M-Pesa reward payment upon approval

### Admin Dashboard Features
- Verification queue filtered by county
- Bulk approve/reject capabilities
- Map view of submissions
- County performance analytics
- M-Pesa transaction tracking

## User Journey

### Complete Flow
1. **Onboarding**
   - Location detection (GPS or manual)
   - County and constituency selection
   - Agro-zone identification
   - Conservation goals selection

2. **Tree Discovery**
   - View filtered trees (50%+ compatibility)
   - Trees sorted by compatibility score
   - Real-time weather data integration
   - Seasonal planting advice

3. **Matching**
   - Swipe right on suitable trees
   - Compatibility scores displayed
   - Success probability shown
   - Matches saved to database

4. **Purchase (Future)**
   - M-Pesa payment to nurseries
   - Location-specific nursery recommendations
   - Delivery coordination

5. **Planting**
   - User plants tree
   - Takes photo with GPS coordinates
   - Uploads to verification system

6. **Verification**
   - County moderator reviews submission
   - Checks photo quality and location
   - Approves or rejects with reason
   - Audit trail maintained

7. **Rewards**
   - M-Pesa payment upon approval
   - Carbon credits calculated
   - Leaderboard updated
   - Community impact tracked

## Technical Implementation

### Location Service
```typescript
// Detects county, constituency, and agro-zone
detectLocation(latitude, longitude) → {
  county: string,
  constituency: string,
  agroZone: string
}
```

### Compatibility Calculation
```typescript
calculateKenyanCompatibility(tree, profile) → score (0-100)
// Factors: County (40%), Agro-zone (35%), Goals (25%)
```

### Weather Integration
```typescript
getWeatherData(latitude, longitude) → {
  current: { temperature, humidity, ... },
  estimated_annual_rainfall: number
}
```

### Filtering Algorithm
```typescript
1. Calculate compatibility for all trees
2. Filter trees with score >= 50%
3. Sort by compatibility (highest first)
4. Return filtered & sorted list
```

## Benefits

### For Farmers
- Scientifically-backed recommendations
- Location-specific tree selection
- Reduced risk of tree failure
- Optimal planting times
- Fair market prices

### For Environment
- Appropriate species for each region
- Higher survival rates
- Effective carbon sequestration
- Biodiversity preservation
- Ecosystem restoration

### For Government
- Data-driven forestry programs
- County-level monitoring
- KFS officer engagement
- Transparent verification
- Impact tracking

## Future Enhancements
- AI-powered species identification
- Soil testing integration
- Drone verification
- Blockchain certification
- Carbon credit marketplace
- Community nursery network
