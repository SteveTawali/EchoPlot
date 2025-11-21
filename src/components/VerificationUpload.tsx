import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { logger } from "@/utils/logger";
import { Upload, MapPin, Calendar, X } from "lucide-react";
import { extractGPSData, compressImage, validateImage } from "@/utils/imageUtils";
import { reverseGeocode } from "@/utils/kenyaLocation";
import { verificationSchema, validateInput, sanitizeString, latitudeSchema, longitudeSchema } from "@/utils/validation";

interface VerificationUploadProps {
  matchId?: string;
  treeName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const VerificationUpload = ({
  matchId,
  treeName,
  onSuccess,
  onCancel,
}: VerificationUploadProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [gpsData, setGpsData] = useState<{ latitude?: number; longitude?: number }>({});
  const [locationName, setLocationName] = useState<string>("");
  const [manualLocation, setManualLocation] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [notes, setNotes] = useState("");
  const [plantingDate, setPlantingDate] = useState(new Date().toISOString().split('T')[0]);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Load user profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (data) {
        setUserProfile(data);
        // Pre-fill with user's profile location if available
        if (data.latitude && data.longitude) {
          setGpsData({ latitude: data.latitude, longitude: data.longitude });
        }
      }
    };
    loadProfile();
  }, [user]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImage(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setProgress(10);

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      setSelectedImage(file);
      setProgress(30);

      // Extract GPS data from photo
      const metadata = await extractGPSData(file);
      setProgress(50);

      if (metadata.latitude && metadata.longitude) {
        setGpsData(metadata);
        // Reverse geocode to get location name
        const location = await reverseGeocode(metadata.latitude, metadata.longitude);
        const locationStr = [location.constituency, location.county].filter(Boolean).join(", ");
        setLocationName(locationStr || "Location detected");
        toast.success("📍 GPS coordinates detected from photo!");
      } else if (userProfile?.latitude && userProfile?.longitude) {
        // Use profile location as fallback
        setGpsData({ 
          latitude: userProfile.latitude, 
          longitude: userProfile.longitude 
        });
        const location = await reverseGeocode(userProfile.latitude, userProfile.longitude);
        const locationStr = [location.constituency, location.county].filter(Boolean).join(", ");
        setLocationName(locationStr || "Location detected");
        toast.success("📍 Using your profile location");
      } else {
        // No GPS data available
        setManualLocation(true);
        toast.info("💡 Please enter location or enable GPS", {
          description: "Location helps verify your planting"
        });
      }
    } catch (error) {
      toast.error("Failed to process image");
      logger.error(error);
    } finally {
      setProgress(0);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser");
      return;
    }

    toast.info("Getting your location...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setGpsData({ latitude, longitude });
        setManualLocation(false);
        // Reverse geocode to get location name
        const location = await reverseGeocode(latitude, longitude);
        const locationStr = [location.constituency, location.county].filter(Boolean).join(", ");
        setLocationName(locationStr || "Location detected");
        toast.success("📍 Location detected!");
      },
      (error) => {
        toast.error("Failed to get location. Please enter manually.");
        setManualLocation(true);
      }
    );
  };

  const handleUpload = async () => {
    if (!selectedImage || !user) {
      toast.error("Please select an image");
      return;
    }

    // Get final GPS coordinates
    let finalLat = gpsData.latitude;
    let finalLng = gpsData.longitude;

    // If manual location is being used
    if (manualLocation && manualLat && manualLng) {
      const latNum = parseFloat(manualLat);
      const lngNum = parseFloat(manualLng);
      
      // Validate coordinates
      const latValidation = latitudeSchema.safeParse(latNum);
      const lngValidation = longitudeSchema.safeParse(lngNum);
      
      if (!latValidation.success || !lngValidation.success) {
        toast.error("Invalid coordinates. Latitude must be -90 to 90, Longitude must be -180 to 180.");
        return;
      }
      
      finalLat = latNum;
      finalLng = lngNum;
    }

    if (!finalLat || !finalLng) {
      toast.error("Location required. Please enable GPS or enter manually.");
      return;
    }
    
    // Validate verification data
    const validation = validateInput(verificationSchema, {
      tree_name: treeName,
      latitude: finalLat,
      longitude: finalLng,
      planting_date: plantingDate || new Date().toISOString().split('T')[0],
      notes: notes || undefined,
    });
    
    if (!validation.success) {
      const firstError = validation.errors?.errors[0];
      toast.error(firstError?.message || "Invalid input data");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Compress image
      setProgress(20);
      const compressedImage = await compressImage(selectedImage);
      
      // Upload to storage
      setProgress(40);
      const fileName = `${user.id}/${Date.now()}-${selectedImage.name}`;
      const { error: uploadError, data } = await supabase.storage
        .from("planting-verifications")
        .upload(fileName, compressedImage);

      if (uploadError) throw uploadError;

      // Get public URL
      setProgress(60);
      const { data: urlData } = supabase.storage
        .from("planting-verifications")
        .getPublicUrl(fileName);

      // Get user profile for county/constituency
      const { data: profile } = await supabase
        .from("profiles")
        .select("county, constituency, phone")
        .eq("user_id", user.id)
        .maybeSingle();

      // Create verification record (with sanitized data)
      setProgress(80);
      const { error: insertError } = await supabase
        .from("planting_verifications")
        .insert({
          user_id: user.id,
          tree_match_id: matchId || null,
          tree_name: sanitizeString(treeName),
          image_url: urlData.publicUrl,
          latitude: finalLat,
          longitude: finalLng,
          county: profile?.county ? sanitizeString(profile.county) : null,
          constituency: profile?.constituency ? sanitizeString(profile.constituency) : null,
          phone: profile?.phone || null,
          planting_date: plantingDate || new Date().toISOString().split('T')[0],
          notes: notes ? sanitizeString(notes) : null,
        });

      if (insertError) throw insertError;

      setProgress(100);
      toast.success("🌳 Verification submitted successfully!", {
        description: "Awaiting review by county moderator"
      });
      
      // Cleanup
      URL.revokeObjectURL(preview);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      logger.error("Upload error:", error);
      toast.error(error.message || "Failed to upload verification");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const clearImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setSelectedImage(null);
    setPreview("");
    setGpsData({});
    setProgress(0);
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">Verify Your Planting</h3>
        <p className="text-muted-foreground">
          Upload a photo of your planted {treeName} to track your impact
        </p>
      </div>

      {!preview ? (
        <div>
          <Label
            htmlFor="image-upload"
            className="cursor-pointer block"
          >
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Click to upload photo</p>
              <p className="text-sm text-muted-foreground">
                JPEG, PNG or WebP (max 5MB)
              </p>
            </div>
          </Label>
          <Input
            id="image-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={handleImageSelect}
            disabled={uploading}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={preview}
              alt="Planting verification"
              className="w-full h-64 object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={clearImage}
              disabled={uploading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Location Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Location *</Label>
              {!manualLocation && !gpsData.latitude && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={useCurrentLocation}
                  disabled={uploading}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Use Current Location
                </Button>
              )}
            </div>

            {gpsData.latitude && gpsData.longitude && !manualLocation ? (
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="text-green-700 dark:text-green-300 font-medium">
                    {locationName || "Location detected"}
                  </span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 ml-6">
                  {gpsData.latitude.toFixed(6)}, {gpsData.longitude.toFixed(6)}
                </p>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="text-xs p-0 h-auto ml-6"
                  onClick={() => setManualLocation(true)}
                >
                  Enter different location
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="latitude" className="text-xs">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="0.000001"
                      placeholder="-1.2921"
                      value={manualLat}
                      onChange={(e) => setManualLat(e.target.value)}
                      disabled={uploading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude" className="text-xs">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="0.000001"
                      placeholder="36.8219"
                      value={manualLng}
                      onChange={(e) => setManualLng(e.target.value)}
                      disabled={uploading}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={useCurrentLocation}
                    disabled={uploading}
                    className="flex-1"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Detect Location
                  </Button>
                  {gpsData.latitude && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setManualLocation(false);
                        setManualLat("");
                        setManualLng("");
                      }}
                    >
                      Use Auto-detected
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Location is required for verification. Enable GPS or enter coordinates manually.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="planting-date">Planting Date</Label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Input
                id="planting-date"
                type="date"
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                disabled={uploading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Share details about your planting..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={uploading}
              rows={3}
            />
          </div>

          {progress > 0 && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">
                {uploading ? "Uploading..." : "Processing..."}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            {onCancel && (
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={uploading}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button
              variant="hero"
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1"
            >
              {uploading ? "Uploading..." : "Submit Verification"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
