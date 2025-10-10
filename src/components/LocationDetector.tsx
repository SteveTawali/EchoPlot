import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { MapPin, Loader2, CheckCircle, AlertCircle, MapPinned } from "lucide-react";
import { detectLocation, getLocationAccuracyRating, type LocationData } from "@/utils/locationService";
import { supabase } from "@/integrations/supabase/client";

interface LocationDetectorProps {
  onLocationDetected?: (location: { latitude: number; longitude: number; weatherData: any }) => void;
  className?: string;
}

export const LocationDetector = ({ onLocationDetected, className }: LocationDetectorProps) => {
  const [detecting, setDetecting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [locationData, setLocationData] = useState<LocationData | null>(null);

  const handleDetectLocation = async () => {
    setDetecting(true);
    setStatus('idle');
    
    try {
      // Use smart detection with GPS -> IP fallback
      const location = await detectLocation();
      
      const accuracyInfo = getLocationAccuracyRating(location.accuracy, location.source);
      
      // Fetch weather data
      const { data: weatherData, error } = await supabase.functions.invoke('get-weather-data', {
        body: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      });

      if (error) throw error;

      setStatus('success');
      setLocationData(location);
      
      const sourceLabel = location.source === 'gps' ? 'GPS' : 
                         location.source === 'ip' ? 'IP address' : 
                         location.source === 'cached' ? 'cached data' : 'manual entry';
      
      setMessage(`Location detected via ${sourceLabel}: ${weatherData.location.name}, ${weatherData.location.country}`);
      
      if (onLocationDetected) {
        onLocationDetected({
          latitude: location.latitude,
          longitude: location.longitude,
          weatherData,
        });
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Failed to detect location. Please try manual entry.');
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
            <div className="flex-1">
              <AlertDescription className="text-sm">
                {message}
              </AlertDescription>
              {status === 'success' && locationData && (
                <div className="mt-2 flex items-center gap-2">
                  <MapPinned className="w-3 h-3" />
                  <Badge variant="outline" className={getLocationAccuracyRating(locationData.accuracy, locationData.source).color}>
                    {getLocationAccuracyRating(locationData.accuracy, locationData.source).description}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </Alert>
      )}
    </div>
  );
};
