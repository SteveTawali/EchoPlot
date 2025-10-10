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
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    soilType: null as SoilType | null,
    climateZone: null as ClimateZone | null,
    landSize: "",
    latitude: "",
    longitude: "",
    goals: [] as ConservationGoal[],
  });

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
              <div>
                <Label className="text-lg mb-4 block">What's your soil type?</Label>
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
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude (optional)</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.000001"
                  placeholder="e.g., 40.7128"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude (optional)</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.000001"
                  placeholder="e.g., -74.0060"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                />
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
