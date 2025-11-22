import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, MapPin, Loader2 } from "lucide-react";
import { KENYAN_COUNTIES } from "@/data/kenya";
import { detectLocation, determineClimateZone, determineSoilType } from "@/utils/locationService";
import { reverseGeocode, determineAgroZone } from "@/utils/kenyaLocation";
import { onboardingSchema, validateInput, sanitizeString } from "@/utils/validation";
import { logger } from "@/utils/logger";

type SoilType = "clay" | "sandy" | "loamy" | "silty" | "peaty" | "chalky";
type ClimateZone = "tropical" | "temperate" | "cold" | "mediterranean";

const soilTypes: { value: SoilType; label: string; labelSw: string }[] = [
  { value: "clay", label: "Clay", labelSw: "Udongo wa Tope" },
  { value: "sandy", label: "Sandy", labelSw: "Udongo wa Mchanga" },
  { value: "loamy", label: "Loamy", labelSw: "Udongo Mchanganyiko" },
  { value: "silty", label: "Silty", labelSw: "Udongo wa Matope" },
  { value: "peaty", label: "Peaty", labelSw: "Udongo wa Vumbi" },
  { value: "chalky", label: "Chalky", labelSw: "Udongo wa Chaki" },
];

const conservationGoals = [
  { value: "carbon_sequestration", label: "Carbon Sequestration", labelSw: "Kuhifadhi Kaboni" },
  { value: "biodiversity", label: "Biodiversity", labelSw: "Utofauti wa Viumbe" },
  { value: "erosion_control", label: "Erosion Control", labelSw: "Kudhibiti Mmomonyoko" },
  { value: "water_management", label: "Water Management", labelSw: "Usimamizi wa Maji" },
  { value: "wildlife_habitat", label: "Wildlife Habitat", labelSw: "Makazi ya Wanyamapori" },
  { value: "food_production", label: "Food Production", labelSw: "Uzalishaji wa Chakula" },
];

export default function KenyaOnboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const { user } = useAuth();
  const { language } = useLanguage();

  const [formData, setFormData] = useState({
    soilType: null as SoilType | null,
    climateZone: null as ClimateZone | null,
    landSize: "",
    latitude: "",
    longitude: "",
    county: "",
    constituency: "",
    agroZone: "",
    phone: "",
    goals: [] as string[],
  });

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    let detectedCounty = "";
    let detectedConstituency = "";
    let detectedAgroZone = "";
    let detectedClimate: ClimateZone | null = null;
    let detectedSoil: SoilType | null = null;

    try {
      // Step 1: Get GPS location (CRITICAL - must work)
      logger.log('Starting location detection...');
      const location = await detectLocation();
      logger.log('GPS location obtained:', { lat: location.latitude, lng: location.longitude });

      // Step 2: Determine agro-zone from coordinates (CRITICAL - always works)
      detectedAgroZone = determineAgroZone(location.latitude, location.longitude);
      logger.log('Agro-zone determined:', detectedAgroZone);

      // Step 3: Get county via reverse geocoding (IMPORTANT - try but don't fail)
      try {
        logger.log('Attempting reverse geocoding...');
        const geocodeResult = await reverseGeocode(location.latitude, location.longitude);
        detectedCounty = geocodeResult.county || "";
        detectedConstituency = geocodeResult.constituency || "";
        logger.log('Reverse geocoding successful:', { county: detectedCounty, constituency: detectedConstituency });
      } catch (geocodeError: unknown) {
        logger.error('Reverse geocoding failed:', geocodeError);
        // Continue - user can select county manually
      }

      // Step 4: Get weather data for climate/soil detection (OPTIONAL - nice to have)
      try {
        logger.log('Fetching weather data...');
        const { data, error } = await supabase.functions.invoke('get-weather-data', {
          body: { latitude: location.latitude, longitude: location.longitude }
        });

        if (error) {
          logger.error('Weather API returned error:', error);
          // Check if it's a CORS or network error
          if (error.message?.includes('Failed to send') || error.message?.includes('fetch')) {
            logger.warn('Edge function request failed - may be CORS or network issue');
          }
          throw error;
        }

        if (data?.current) {
          logger.log('Weather data received successfully');

          // Determine climate and soil from weather data
          detectedClimate = determineClimateZone(location.latitude, data.current.temperature) as ClimateZone;
          detectedSoil = determineSoilType(data.current.humidity, data.estimated_annual_rainfall) as SoilType;
          logger.log('Climate and soil determined:', { climate: detectedClimate, soil: detectedSoil });
        }
      } catch (weatherError: unknown) {
        logger.error('Weather data fetch failed:', weatherError);
        // Weather is optional - continue without it
        // We'll use default climate zone based on latitude
        if (!detectedClimate) {
          detectedClimate = determineClimateZone(location.latitude, 20) as ClimateZone; // Default temp
        }
      }

      // Step 5: Update form with all detected data
      setFormData(prev => ({
        ...prev,
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        county: detectedCounty || prev.county,
        constituency: detectedConstituency || prev.constituency,
        agroZone: detectedAgroZone || prev.agroZone,
        climateZone: detectedClimate || prev.climateZone,
        soilType: detectedSoil || prev.soilType,
      }));

      // Step 6: Show success message
      const successParts: string[] = [];
      if (detectedCounty) successParts.push(detectedCounty);
      if (detectedAgroZone) successParts.push(`Zone: ${detectedAgroZone}`);

      const descriptionParts: string[] = [];
      if (detectedClimate) descriptionParts.push(`Climate: ${detectedClimate}`);
      if (detectedSoil) descriptionParts.push(`Soil: ${detectedSoil}`);

      toast.success(
        successParts.length > 0
          ? `Location detected: ${successParts.join(', ')}`
          : 'Location coordinates detected',
        {
          description: descriptionParts.length > 0
            ? descriptionParts.join(', ')
            : detectedAgroZone
              ? `Agro-zone: ${detectedAgroZone}`
              : undefined,
        }
      );

      logger.log('Location detection completed successfully');
    } catch (error: unknown) {
      logger.error('Location detection failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Provide helpful error message
      const userMessage = 'Location detection failed';
      let userDescription = errorMessage;

      if (errorMessage.includes('permission')) {
        userDescription = 'Please allow location access in your browser settings';
      } else if (errorMessage.includes('timeout')) {
        userDescription = 'Location request timed out. Please try again or enter manually.';
      } else if (errorMessage.includes('unavailable')) {
        userDescription = 'Location services unavailable. Please enter your location manually.';
      }

      toast.error(userMessage, {
        description: userDescription,
      });
    } finally {
      setDetectingLocation(false);
    }
  };

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step === 1 && !formData.soilType) {
      toast.error(language === 'sw' ? "Tafadhali chagua aina ya udongo" : "Please select a soil type");
      return;
    }
    if (step === 2 && (!formData.county || !formData.phone || !formData.agroZone)) {
      toast.error(language === 'sw' ? "Tafadhali jaza kaunti, nambari ya simu, na eneo la kilimo-ekolojia" : "Please fill county, phone number, and agro-ecological zone");
      return;
    }
    if (step === 3 && !formData.landSize) {
      toast.error(language === 'sw' ? "Tafadhali ingiza ukubwa wa ardhi" : "Please enter your land size");
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const toggleGoal = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    // Validate all input using Zod schema
    const landSizeNum = Number.parseFloat(formData.landSize);
    if (Number.isNaN(landSizeNum) || landSizeNum <= 0) {
      toast.error(language === 'sw' ? "Ingiza ukubwa halali wa ardhi" : "Please enter a valid land size");
      setLoading(false);
      return;
    }

    if (!formData.soilType || !formData.climateZone || !formData.county || !formData.agroZone) {
      toast.error(language === 'sw' ? "Tafadhali jaza sehemu zote za lazima" : "Please complete all required fields");
      setLoading(false);
      return;
    }

    const validation = validateInput(onboardingSchema, {
      county: formData.county,
      constituency: formData.constituency || undefined,
      agro_zone: formData.agroZone,
      soil_type: formData.soilType,
      climate_zone: formData.climateZone,
      land_size_hectares: landSizeNum,
      conservation_goals: formData.goals,
      phone: formData.phone,
    });

    if (!validation.success) {
      const firstError = validation.errors?.errors[0];
      toast.error(firstError?.message || (language === 'sw' ? "Tafadhali angalia maingizo yako" : "Please check your input"));
      setLoading(false);
      return;
    }

    try {
      // Sanitize inputs before saving
      const { error } = await supabase
        .from("profiles")
        .update({
          soil_type: validation.data?.soil_type,
          climate_zone: validation.data?.climate_zone,
          land_size_hectares: validation.data?.land_size_hectares,
          latitude: formData.latitude ? Number.parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? Number.parseFloat(formData.longitude) : null,
          county: sanitizeString(validation.data?.county || ''),
          constituency: validation.data?.constituency ? sanitizeString(validation.data.constituency) : null,
          agro_zone: sanitizeString(validation.data?.agro_zone || ''),
          phone: validation.data?.phone,
          conservation_goals: validation.data?.conservation_goals,
          onboarding_completed: true,
        })
        .eq("user_id", user?.id);

      if (error) throw error;

      toast.success(language === 'sw' ? "Umekamilisha! Hebu tuone miti inayofaa" : "Profile completed! Let's find your perfect trees.");

      // Small delay to ensure database update propagates
      await new Promise(resolve => setTimeout(resolve, 500));

      // Force page reload to ensure ProtectedRoute sees updated data
      globalThis.location.href = "/";
    } catch (error) {
      toast.error(error.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-card p-4">
      <Card className="w-full max-w-2xl p-8 shadow-card">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">
            {language === 'sw' ? 'Kamilisha Wasifu Wako' : 'Complete Your Profile'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {language === 'sw' ? `Hatua ${step} ya ${totalSteps}` : `Step ${step} of ${totalSteps}`}
          </p>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-lg">
                  {language === 'sw' ? 'Aina ya udongo yako ni ipi?' : 'What\'s your soil type?'}
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDetectLocation}
                  disabled={detectingLocation}
                  className="gap-2"
                >
                  {detectingLocation ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {language === 'sw' ? 'Inatafuta...' : 'Detecting...'}
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4" />
                      {language === 'sw' ? 'Gundua Kiotomatiki' : 'Auto-detect'}
                    </>
                  )}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {soilTypes.map((type) => (
                  <Button
                    key={type.value}
                    type="button"
                    variant={formData.soilType === type.value ? "default" : "outline"}
                    className="h-auto py-4"
                    onClick={() => setFormData({ ...formData, soilType: type.value })}
                  >
                    {language === 'sw' ? type.labelSw : type.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <Label className="text-lg block mb-4">
                {language === 'sw' ? 'Wapi unaishi?' : 'Where are you located?'}
              </Label>

              <div>
                <Label>{language === 'sw' ? 'Kaunti' : 'County'}</Label>
                <Select value={formData.county} onValueChange={(value) => setFormData({ ...formData, county: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'sw' ? 'Chagua kaunti' : 'Select county'} />
                  </SelectTrigger>
                  <SelectContent>
                    {KENYAN_COUNTIES.map((county) => (
                      <SelectItem key={county} value={county}>
                        {county}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{language === 'sw' ? 'Nambari ya Simu (M-Pesa)' : 'Phone Number (M-Pesa)'}</Label>
                <Input
                  type="tel"
                  placeholder="0712345678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'sw' ? 'Format: 0712345678 au +254712345678' : 'Format: 0712345678 or +254712345678'}
                </p>
              </div>

              <div>
                <Label>{language === 'sw' ? 'Kata / Jimbo (Hiari)' : 'Constituency (Optional)'}</Label>
                <Input
                  placeholder={language === 'sw' ? 'Ingiza kata' : 'Enter constituency'}
                  value={formData.constituency}
                  onChange={(e) => setFormData({ ...formData, constituency: e.target.value })}
                />
              </div>

              <div>
                <Label>{language === 'sw' ? 'Eneo la Kilimo-Ekolojia' : 'Agro-Ecological Zone'} *</Label>
                <Select value={formData.agroZone} onValueChange={(value) => setFormData({ ...formData, agroZone: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'sw' ? 'Chagua eneo la kilimo-ekolojia' : 'Select agro-ecological zone'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LH1">LH1 - Lower Highland 1</SelectItem>
                    <SelectItem value="LH2">LH2 - Lower Highland 2</SelectItem>
                    <SelectItem value="LH3">LH3 - Lower Highland 3</SelectItem>
                    <SelectItem value="LH4">LH4 - Lower Highland 4</SelectItem>
                    <SelectItem value="UM1">UM1 - Upper Midland 1</SelectItem>
                    <SelectItem value="UM2">UM2 - Upper Midland 2</SelectItem>
                    <SelectItem value="UM3">UM3 - Upper Midland 3</SelectItem>
                    <SelectItem value="UM4">UM4 - Upper Midland 4</SelectItem>
                    <SelectItem value="LM1">LM1 - Lower Midland 1</SelectItem>
                    <SelectItem value="LM2">LM2 - Lower Midland 2</SelectItem>
                    <SelectItem value="LM3">LM3 - Lower Midland 3</SelectItem>
                    <SelectItem value="LM4">LM4 - Lower Midland 4</SelectItem>
                    <SelectItem value="LM5">LM5 - Lower Midland 5</SelectItem>
                    <SelectItem value="IL1">IL1 - Inland Lowland 1</SelectItem>
                    <SelectItem value="IL2">IL2 - Inland Lowland 2</SelectItem>
                    <SelectItem value="IL3">IL3 - Inland Lowland 3</SelectItem>
                    <SelectItem value="IL4">IL4 - Inland Lowland 4</SelectItem>
                    <SelectItem value="IL5">IL5 - Inland Lowland 5</SelectItem>
                    <SelectItem value="IL6">IL6 - Inland Lowland 6</SelectItem>
                    <SelectItem value="CL1">CL1 - Coastal Lowland 1</SelectItem>
                    <SelectItem value="CL2">CL2 - Coastal Lowland 2</SelectItem>
                    <SelectItem value="CL3">CL3 - Coastal Lowland 3</SelectItem>
                    <SelectItem value="CL4">CL4 - Coastal Lowland 4</SelectItem>
                    <SelectItem value="CL5">CL5 - Coastal Lowland 5</SelectItem>
                    <SelectItem value="UH1">UH1 - Upper Highland 1</SelectItem>
                    <SelectItem value="UH2">UH2 - Upper Highland 2</SelectItem>
                    <SelectItem value="UH3">UH3 - Upper Highland 3</SelectItem>
                    <SelectItem value="UH4">UH4 - Upper Highland 4</SelectItem>
                    <SelectItem value="UH5">UH5 - Upper Highland 5</SelectItem>
                    <SelectItem value="UH6">UH6 - Upper Highland 6</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'sw' ? 'Eneo hili linaathiri aina za miti zinazofaa' : 'This zone affects which trees are suitable for your area'}
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <Label className="text-lg block">
                {language === 'sw' ? 'Ardhi yako ni hekta ngapi?' : 'How much land do you have?'}
              </Label>
              <div>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 2.5"
                  value={formData.landSize}
                  onChange={(e) => setFormData({ ...formData, landSize: e.target.value })}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {language === 'sw' ? 'Ingiza hekta (1 hekta = 2.47 ekari)' : 'Enter in hectares (1 hectare = 2.47 acres)'}
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <Label className="text-lg block mb-4">
                {language === 'sw' ? 'Malengo yako ya uhifadhi?' : 'What are your conservation goals?'}
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                {language === 'sw' ? 'Chagua angalau moja' : 'Select at least one'}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {conservationGoals.map((goal) => (
                  <Button
                    key={goal.value}
                    type="button"
                    variant={formData.goals.includes(goal.value) ? "default" : "outline"}
                    className="h-auto py-4 text-sm"
                    onClick={() => toggleGoal(goal.value)}
                  >
                    {language === 'sw' ? goal.labelSw : goal.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={step === 1 || loading}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {language === 'sw' ? 'Rudi' : 'Back'}
          </Button>

          {step < totalSteps ? (
            <Button type="button" onClick={handleNext}>
              {language === 'sw' ? 'Endelea' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === 'sw' ? 'Inahifadhi...' : 'Saving...'}
                </>
              ) : (
                <>{language === 'sw' ? 'Kamilisha' : 'Complete Profile'}</>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
