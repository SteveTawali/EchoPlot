import { useEffect, useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Profile = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const loadProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      setProfile(data);
      setLoading(false);
    };

    loadProfile();
  }, [user, navigate]);

  const tabs = [
    { value: '/profile/dashboard', label: language === 'en' ? 'Dashboard' : 'Dashibodi', icon: '📊' },
    { value: '/profile/plantings', label: language === 'en' ? 'Plantings' : 'Miche', icon: '🌱' },
    { value: '/profile/rewards', label: language === 'en' ? 'Rewards' : 'Zawadi', icon: '💰' },
    { value: '/profile/achievements', label: language === 'en' ? 'Badges' : 'Medali', icon: '🏆' },
    { value: '/profile/settings', label: language === 'en' ? 'Settings' : 'Mipangilio', icon: '⚙️' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  const currentTab = tabs.find(tab => location.pathname.startsWith(tab.value))?.value || '/profile/dashboard';

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 border-b">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="text-2xl">
                {profile?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{profile?.full_name || 'User'}</h1>
              <p className="text-sm text-muted-foreground">
                {profile?.county ? `${profile.county}, Kenya` : 'Kenya'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'en' ? 'Joined' : 'Alijiunga'}{' '}
                {new Date(profile?.created_at).toLocaleDateString()}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/profile/edit')}
            >
              {language === 'en' ? 'Edit' : 'Hariri'}
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-4xl mx-auto px-4">
          <Tabs value={currentTab} className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  onClick={() => navigate(tab.value)}
                  className="flex items-center gap-2"
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default Profile;
