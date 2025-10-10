import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, MapPin, Loader2 } from "lucide-react";
import { requestLocationPermission, determineClimateZone, determineSoilType, detectLocation } from "@/utils/locationService";

type SoilType = "clay" | "sandy" | "loamy" | "silty" | "peaty" | "chalky";
type ClimateZone = "tropical" | "subtropical" | "temperate" | "cold" | "arid" | "mediterranean";
type ConservationGoal = "carbon_sequestration" | "biodiversity" | "erosion_control" | "water_management" | "wildlife_habitat" | "food_production" | "aesthetic_beauty";

const soilTypes: { value: SoilType; label: string }[] = [
  { value: "clay", label: "Clay" },
  { value: "sandy", label: "Sandy" },
  { value: "loamy", label: "Loamy" },
  { value: "silty", label: "Silty" },
  { value: "peaty", label: "Peaty" },
  { value: "chalky", label: "Chalky" },
];

const climateZones: { value: ClimateZone; label: string }[] = [
  { value: "tropical", label: "Tropical" },
  { value: "subtropical", label: "Subtropical" },
  { value: "temperate", label: "Temperate" },
  { value: "cold", label: "Cold" },
  { value: "arid", label: "Arid" },
  { value: "mediterranean", label: "Mediterranean" },
];

const conservationGoals: { value: ConservationGoal; label: string }[] = [
  { value: "carbon_sequestration", label: "Carbon Sequestration" },
  { value: "biodiversity", label: "Biodiversity" },
  { value: "erosion_control", label: "Erosion Control" },
  { value: "water_management", label: "Water Management" },
  { value: "wildlife_habitat", label: "Wildlife Habitat" },
  { value: "food_production", label: "Food Production" },
  { value: "aesthetic_beauty", label: "Aesthetic Beauty" },
];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    soilType: null as SoilType | null,
    climateZone: null as ClimateZone | null,
    landSize: "",
    latitude: "",
    longitude: "",
    goals: [] as ConservationGoal[],
    weatherData: null as any,
  });

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      // Use smart detection with GPS -> IP fallback
      const location = await detectLocation();
      
      // Get weather data from our edge function
      const { data: weatherData, error } = await supabase.functions.invoke('get-weather-data', {
        body: { 
          latitude: location.latitude, 
          longitude: location.longitude 
        }
      });

      if (error) throw error;

      // Auto-populate location fields
      setFormData(prev => ({
        ...prev,
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        weatherData,
      }));

      // Auto-detect climate zone and soil type based on weather data
      if (weatherData?.current) {
        const detectedClimate = determineClimateZone(location.latitude, weatherData.current.temperature);
        const detectedSoil = determineSoilType(weatherData.current.humidity, weatherData.estimated_annual_rainfall);
        
        setFormData(prev => ({
          ...prev,
          climateZone: detectedClimate as ClimateZone,
          soilType: detectedSoil,
        }));

        const sourceLabel = location.source === 'gps' ? 'GPS' : 
                           location.source === 'ip' ? 'IP location' : 
                           'cached data';

        toast.success(`Location detected via ${sourceLabel}: ${weatherData.location.name}, ${weatherData.location.country}`, {
          description: `Climate: ${detectedClimate}, Soil: ${detectedSoil}`,
        });
      }
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
      toast.error("Please select a soil type");
      return;
    }
    if (step === 2 && !formData.climateZone) {
      toast.error("Please select a climate zone");
      return;
    }
    if (step === 3 && !formData.landSize) {
      toast.error("Please enter your land size");
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const toggleGoal = (goal: ConservationGoal) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const handleSubmit = async () => {
    if (formData.goals.length === 0) {
      toast.error("Please select at least one conservation goal");
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
          conservation_goals: formData.goals,
          onboarding_completed: true,
        })
        .eq("user_id", user?.id);

      if (error) throw error;

      toast.success("Profile completed! Let's find your perfect trees.");
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
          <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
          <p className="text-muted-foreground mb-4">
            Step {step} of {totalSteps}
          </p>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-lg">What's your soil type?</Label>
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
                      Detecting...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4" />
                      Auto-detect
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Use GPS detection for smart recommendations based on your exact location and climate.
              </p>
              <div>
                <div className="grid grid-cols-2 gap-3">
                  {soilTypes.map((type) => (
                    <Button
                      key={type.value}
                      type="button"
                      variant={formData.soilType === type.value ? "default" : "outline"}
                      className="h-auto py-4"
                      onClick={() => setFormData({ ...formData, soilType: type.value })}
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <Label className="text-lg mb-4 block">What's your climate zone?</Label>
                <div className="grid grid-cols-2 gap-3">
                  {climateZones.map((zone) => (
                    <Button
                      key={zone.value}
                      type="button"
                      variant={formData.climateZone === zone.value ? "default" : "outline"}
                      className="h-auto py-4"
                      onClick={() => setFormData({ ...formData, climateZone: zone.value })}
                    >
                      {zone.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="landSize">Land Size (hectares)</Label>
                <Input
                  id="landSize"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 2.5"
                  value={formData.landSize}
                  onChange={(e) => setFormData({ ...formData, landSize: e.target.value })}
                  required
                />
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Location Coordinates</Label>
                  {!formData.latitude && !formData.longitude && (
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
                          Detecting...
                        </>
                      ) : (
                        <>
                          <MapPin className="w-4 h-4" />
                          Use GPS
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Location helps us provide accurate tree recommendations
                </p>
                
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="space-y-1">
                    <Label htmlFor="latitude" className="text-xs">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="0.000001"
                      placeholder="e.g., 40.7128"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="longitude" className="text-xs">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="0.000001"
                      placeholder="e.g., -74.0060"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
                
                {formData.weatherData && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs font-semibold mb-1">Detected Climate Data:</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>📍 {formData.weatherData.location.name}, {formData.weatherData.location.country}</p>
                      <p>🌡️ Temperature: {formData.weatherData.current.temperature}°C</p>
                      <p>💧 Humidity: {formData.weatherData.current.humidity}%</p>
                      <p>🌧️ Est. Annual Rainfall: {formData.weatherData.estimated_annual_rainfall}mm</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <Label className="text-lg mb-4 block">What are your conservation goals?</Label>
                <p className="text-sm text-muted-foreground mb-4">Select all that apply</p>
                <div className="grid grid-cols-1 gap-3">
                  {conservationGoals.map((goal) => (
                    <Button
                      key={goal.value}
                      type="button"
                      variant={formData.goals.includes(goal.value) ? "default" : "outline"}
                      className="h-auto py-4 justify-start"
                      onClick={() => toggleGoal(goal.value)}
                    >
                      {goal.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1 || loading}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {step < totalSteps ? (
            <Button variant="hero" onClick={handleNext} disabled={loading}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button variant="hero" onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Complete Profile"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Onboarding;
