import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, Wifi } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export const OfflineIndicator = () => {
  const { isOnline, wasOffline } = useOnlineStatus();
  const { t } = useLanguage();

  if (isOnline && !wasOffline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
      <Alert
        variant={isOnline ? 'default' : 'destructive'}
        className="shadow-lg animate-in slide-in-from-bottom-5"
      >
        {isOnline ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        <AlertDescription>
          {isOnline
            ? t('offline.back_online')
            : t('offline.offline_mode')}
        </AlertDescription>
      </Alert>
    </div>
  );
};
