import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload, MapPin, Calendar, X } from "lucide-react";
import { extractGPSData, compressImage, validateImage } from "@/utils/imageUtils";

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
  const [notes, setNotes] = useState("");
  const [plantingDate, setPlantingDate] = useState(new Date().toISOString().split('T')[0]);

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

      // Extract GPS data
      const metadata = await extractGPSData(file);
      setGpsData(metadata);
      setProgress(50);

      if (metadata.latitude && metadata.longitude) {
        toast.success("📍 GPS coordinates detected!");
      } else {
        toast.info("No GPS data found. You can manually enter location.");
      }
    } catch (error) {
      toast.error("Failed to process image");
      console.error(error);
    } finally {
      setProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage || !user) {
      toast.error("Please select an image");
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

      // Create verification record
      setProgress(80);
      const { error: insertError } = await supabase
        .from("planting_verifications")
        .insert({
          user_id: user.id,
          tree_match_id: matchId || null,
          tree_name: treeName,
          image_url: urlData.publicUrl,
          latitude: gpsData.latitude,
          longitude: gpsData.longitude,
          planting_date: plantingDate,
          notes: notes || null,
        });

      if (insertError) throw insertError;

      setProgress(100);
      toast.success("🌳 Planting verified! Awaiting review.");
      
      // Cleanup
      URL.revokeObjectURL(preview);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Upload error:", error);
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

          {gpsData.latitude && gpsData.longitude && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
              <MapPin className="w-4 h-4" />
              <span>
                Location: {gpsData.latitude.toFixed(4)}, {gpsData.longitude.toFixed(4)}
              </span>
            </div>
          )}

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
