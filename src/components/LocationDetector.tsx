import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { requestLocationPermission } from "@/utils/locationService";
import { supabase } from "@/integrations/supabase/client";

interface LocationDetectorProps {
  onLocationDetected?: (location: { latitude: number; longitude: number; weatherData: any }) => void;
  className?: string;
}

export const LocationDetector = ({ onLocationDetected, className }: LocationDetectorProps) => {
  const [detecting, setDetecting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleDetectLocation = async () => {
    setDetecting(true);
    setStatus('idle');
    
    try {
      // Request GPS permission
      const location = await requestLocationPermission();
      
      // Fetch weather data
      const { data: weatherData, error } = await supabase.functions.invoke('get-weather-data', {
        body: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      });

      if (error) throw error;

      setStatus('success');
      setMessage(`Location detected: ${weatherData.location.name}, ${weatherData.location.country}`);
      
      if (onLocationDetected) {
        onLocationDetected({
          latitude: location.latitude,
          longitude: location.longitude,
          weatherData,
        });
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Failed to detect location');
    } finally {
      setDetecting(false);
    }
  };

  return (
    <div className={className}>
      <Button
        type="button"
        variant="outline"
        onClick={handleDetectLocation}
        disabled={detecting}
        className="w-full gap-2"
      >
        {detecting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Detecting Location...
          </>
        ) : (
          <>
            <MapPin className="w-4 h-4" />
            Detect My Location
          </>
        )}
      </Button>

      {status !== 'idle' && (
        <Alert className={`mt-3 ${status === 'success' ? 'border-green-500/50 bg-green-500/10' : 'border-destructive/50 bg-destructive/10'}`}>
          <div className="flex items-start gap-2">
            {status === 'success' ? (
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
            )}
            <AlertDescription className="text-sm">
              {message}
            </AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  );
};
