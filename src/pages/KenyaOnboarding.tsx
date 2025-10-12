import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { KENYAN_COUNTIES, AGRO_ECOLOGICAL_ZONES } from "@/data/kenya";
import { detectLocation, determineClimateZone, determineSoilType } from "@/utils/locationService";
import { reverseGeocode, determineAgroZone, formatKenyanPhone, validateKenyanPhone } from "@/utils/kenyaLocation";

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
  const { t, language } = useLanguage();
  const navigate = useNavigate();

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
    try {
      const location = await detectLocation();
      
      // Get Kenya-specific location data
      const { county, constituency } = await reverseGeocode(location.latitude, location.longitude);
      const agroZone = determineAgroZone(location.latitude, location.longitude);

      // Get weather data
      const { data: weatherData, error } = await supabase.functions.invoke('get-weather-data', {
        body: { latitude: location.latitude, longitude: location.longitude }
      });

      if (error) throw error;

      const detectedClimate = weatherData?.current
        ? (determineClimateZone(location.latitude, weatherData.current.temperature) as ClimateZone)
        : null;
      const detectedSoil = weatherData?.current
        ? (determineSoilType(weatherData.current.humidity, weatherData.estimated_annual_rainfall) as SoilType)
        : null;

      setFormData(prev => ({
        ...prev,
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        county: county || "",
        constituency: constituency || "",
        agroZone,
        climateZone: detectedClimate ?? prev.climateZone,
        soilType: detectedSoil ?? prev.soilType,
      }));

      toast.success(`Location detected: ${county || 'Unknown'}, Kenya`, {
        description: detectedSoil && detectedClimate ? `Climate: ${detectedClimate}, Soil: ${detectedSoil}` : undefined,
      });
    } catch (error: any) {
      toast.error('Location detection failed', {
        description: error.message || 'Please enter your location manually',
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
    if (step === 2 && (!formData.county || !formData.phone)) {
      toast.error(language === 'sw' ? "Tafadhali jaza kaunti na nambari ya simu" : "Please fill county and phone number");
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
    if (formData.goals.length === 0) {
      toast.error(language === 'sw' ? "Chagua angalau lengo moja" : "Please select at least one conservation goal");
      return;
    }

    if (!validateKenyanPhone(formData.phone)) {
      toast.error(language === 'sw' ? "Nambari ya simu si sahihi" : "Invalid phone number. Use format: 0712345678 or +254712345678");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          soil_type: formData.soilType,
          climate_zone: formData.climateZone,
          land_size_hectares: parseFloat(formData.landSize),
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          county: formData.county,
          constituency: formData.constituency,
          agro_zone: formData.agroZone,
          phone: formatKenyanPhone(formData.phone),
          conservation_goals: formData.goals as ("aesthetic_beauty" | "biodiversity" | "carbon_sequestration" | "erosion_control" | "food_production" | "water_management" | "wildlife_habitat")[],
          onboarding_completed: true,
        })
        .eq("user_id", user?.id);

      if (error) throw error;

      toast.success(language === 'sw' ? "Umekamilisha! Hebu tuone miti inayofaa" : "Profile completed! Let's find your perfect trees.");
      navigate("/");
    } catch (error: any) {
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
                <Select value={formData.county} onValueChange={(value) => setFormData({...formData, county: value})}>
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
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, constituency: e.target.value})}
                />
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
                  onChange={(e) => setFormData({...formData, landSize: e.target.value})}
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
