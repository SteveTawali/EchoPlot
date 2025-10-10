import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Globe, Bell, Shield, Trash2 } from 'lucide-react';

const ProfileSettings = () => {
  const { user, signOut } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    notifications: {
      sms: true,
      email: true,
      plantingReminders: true,
      verificationUpdates: true,
      rewardAlerts: true,
    },
    privacy: {
      profilePublic: true,
      showExactLocation: false,
      showPlantingHistory: true,
      showAchievements: true,
    },
  });

  const handleLanguageChange = async (newLang: 'en' | 'sw') => {
    await setLanguage(newLang);
    toast({
      title: language === 'en' ? 'Language Updated' : 'Lugha Imebadilishwa',
      description: newLang === 'en' ? 'Language changed to English' : 'Lugha imebadilishwa kuwa Kiswahili',
    });
  };

  const handleSaveSettings = async () => {
    // In a real implementation, save to database
    toast({
      title: language === 'en' ? 'Settings Saved' : 'Mipangilio Imehifadhiwa',
      description: language === 'en' ? 'Your preferences have been updated' : 'Mapendeleo yako yamebadilishwa',
    });
  };

  const handleDeleteAccount = async () => {
    if (confirm(language === 'en' 
      ? 'Are you sure you want to delete your account? This action cannot be undone.' 
      : 'Je, una uhakika unataka kufuta akaunti yako? Hatua hii haiwezi kubatilishwa.')) {
      // In real implementation, call edge function to delete account
      toast({
        title: language === 'en' ? 'Account Deletion Requested' : 'Ombi la Kufuta Akaunti',
        description: language === 'en' 
          ? 'Your account will be deleted within 24 hours' 
          : 'Akaunti yako itafutwa ndani ya masaa 24',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {language === 'en' ? 'Language / Lugha' : 'Lugha / Language'}
          </CardTitle>
          <CardDescription>
            {language === 'en' ? 'Choose your preferred language' : 'Chagua lugha unayopendelea'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="lang-en">English</Label>
            <Switch
              id="lang-en"
              checked={language === 'en'}
              onCheckedChange={() => handleLanguageChange('en')}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="lang-sw">Kiswahili</Label>
            <Switch
              id="lang-sw"
              checked={language === 'sw'}
              onCheckedChange={() => handleLanguageChange('sw')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {language === 'en' ? 'Notifications' : 'Arifa'}
          </CardTitle>
          <CardDescription>
            {language === 'en' ? 'Manage how you receive updates' : 'Simamia jinsi unavyopokea taarifa'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="notif-sms">{language === 'en' ? 'SMS Notifications' : 'Arifa za SMS'}</Label>
            <Switch
              id="notif-sms"
              checked={settings.notifications.sms}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, notifications: { ...settings.notifications, sms: checked } })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="notif-email">{language === 'en' ? 'Email Notifications' : 'Arifa za Barua Pepe'}</Label>
            <Switch
              id="notif-email"
              checked={settings.notifications.email}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, notifications: { ...settings.notifications, email: checked } })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <Label htmlFor="notif-plant">{language === 'en' ? 'Planting Reminders' : 'Vikumbusho vya Kupanda'}</Label>
            <Switch
              id="notif-plant"
              checked={settings.notifications.plantingReminders}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, notifications: { ...settings.notifications, plantingReminders: checked } })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="notif-verify">{language === 'en' ? 'Verification Updates' : 'Taarifa za Uthibitisho'}</Label>
            <Switch
              id="notif-verify"
              checked={settings.notifications.verificationUpdates}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, notifications: { ...settings.notifications, verificationUpdates: checked } })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="notif-reward">{language === 'en' ? 'Reward Alerts' : 'Arifa za Zawadi'}</Label>
            <Switch
              id="notif-reward"
              checked={settings.notifications.rewardAlerts}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, notifications: { ...settings.notifications, rewardAlerts: checked } })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {language === 'en' ? 'Privacy' : 'Faragha'}
          </CardTitle>
          <CardDescription>
            {language === 'en' ? 'Control what others can see' : 'Dhibiti wengine wanaweza kuona nini'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="priv-public">{language === 'en' ? 'Public Profile' : 'Wasifu wa Umma'}</Label>
            <Switch
              id="priv-public"
              checked={settings.privacy.profilePublic}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, privacy: { ...settings.privacy, profilePublic: checked } })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="priv-location">{language === 'en' ? 'Show Exact Location' : 'Onyesha Mahali Halisi'}</Label>
            <Switch
              id="priv-location"
              checked={settings.privacy.showExactLocation}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, privacy: { ...settings.privacy, showExactLocation: checked } })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="priv-history">{language === 'en' ? 'Show Planting History' : 'Onyesha Historia ya Kupanda'}</Label>
            <Switch
              id="priv-history"
              checked={settings.privacy.showPlantingHistory}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, privacy: { ...settings.privacy, showPlantingHistory: checked } })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="priv-achieve">{language === 'en' ? 'Show Achievements' : 'Onyesha Mafanikio'}</Label>
            <Switch
              id="priv-achieve"
              checked={settings.privacy.showAchievements}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, privacy: { ...settings.privacy, showAchievements: checked } })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSaveSettings} className="w-full">
        {language === 'en' ? 'Save Settings' : 'Hifadhi Mipangilio'}
      </Button>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            {language === 'en' ? 'Danger Zone' : 'Eneo la Hatari'}
          </CardTitle>
          <CardDescription>
            {language === 'en' ? 'Irreversible actions' : 'Vitendo visivyoweza kubatilishwa'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" onClick={() => signOut()} className="w-full">
            {language === 'en' ? 'Sign Out' : 'Toka'}
          </Button>
          <Button variant="destructive" onClick={handleDeleteAccount} className="w-full">
            {language === 'en' ? 'Delete Account' : 'Futa Akaunti'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;
