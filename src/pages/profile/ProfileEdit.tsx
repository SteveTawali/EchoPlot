import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { KENYAN_COUNTIES } from '@/data/kenya';

const ProfileEdit = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    county: '',
    constituency: '',
    bio: '',
  });

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          county: data.county || '',
          constituency: data.constituency || '',
          bio: '', // Bio would need to be added to schema
        });
      }
    };

    loadProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
        county: formData.county,
        constituency: formData.constituency,
      })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: language === 'en' ? 'Error' : 'Hitilafu',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: language === 'en' ? 'Profile Updated' : 'Wasifu Umebadilishwa',
        description: language === 'en' ? 'Your profile has been updated successfully' : 'Wasifu wako umebadilishwa',
      });
      navigate('/profile/dashboard');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{language === 'en' ? 'Edit Profile' : 'Hariri Wasifu'}</CardTitle>
          <CardDescription>
            {language === 'en' ? 'Update your personal information' : 'Badilisha taarifa zako binafsi'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">{language === 'en' ? 'Full Name' : 'Jina Kamili'}</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{language === 'en' ? 'Phone Number' : 'Nambari ya Simu'}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="254XXXXXXXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="county">{language === 'en' ? 'County' : 'Kaunti'}</Label>
              <Select value={formData.county} onValueChange={(value) => setFormData({ ...formData, county: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'en' ? 'Select county' : 'Chagua kaunti'} />
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

            <div className="space-y-2">
              <Label htmlFor="constituency">{language === 'en' ? 'Constituency' : 'Jimbo'}</Label>
              <Input
                id="constituency"
                value={formData.constituency}
                onChange={(e) => setFormData({ ...formData, constituency: e.target.value })}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (language === 'en' ? 'Saving...' : 'Inahifadhi...') : (language === 'en' ? 'Save Changes' : 'Hifadhi Mabadiliko')}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/profile/dashboard')}>
                {language === 'en' ? 'Cancel' : 'Ghairi'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileEdit;
