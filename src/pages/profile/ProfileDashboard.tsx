import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Leaf, CheckCircle2, Clock, TrendingUp, Wallet, Wind } from 'lucide-react';

interface Activity {
  id: string;
  status: 'verified' | 'pending' | 'rejected';
  created_at: string;
  tree_name: string;
  county: string;
  reward_amount: number;
}

const ProfileDashboard = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTrees: 0,
    verifiedCount: 0,
    pendingCount: 0,
    totalRewards: 0,
    carbonImpact: 0,
    survivalRate: 0,
  });
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadDashboard = async () => {
      // Load verification stats
      const { data: verifications } = await supabase
        .from('planting_verifications')
        .select('*')
        .eq('user_id', user.id);

      if (verifications) {
        const verified = verifications.filter(v => v.status === 'verified');
        const pending = verifications.filter(v => v.status === 'pending');
        const totalRewards = verified.reduce((sum, v) => sum + (v.reward_amount || 0), 0);

        setStats({
          totalTrees: verifications.length,
          verifiedCount: verified.length,
          pendingCount: pending.length,
          totalRewards,
          carbonImpact: verified.length * 22, // 22kg CO2 per tree per year
          survivalRate: verified.length > 0 ? 85 : 0, // Placeholder
        });

        // Recent activity (last 5)
        const sorted = [...verifications]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);
        setRecentActivity(sorted);
      }

      setLoading(false);
    };

    loadDashboard();
  }, [user]);

  const statCards = [
    {
      title: language === 'en' ? 'Total Trees' : 'Jumla ya Miti',
      value: stats.totalTrees,
      subtitle: language === 'en' ? 'Planted' : 'Imepandwa',
      icon: Leaf,
      color: 'text-green-600',
    },
    {
      title: language === 'en' ? 'Verified' : 'Imethibitishwa',
      value: stats.verifiedCount,
      subtitle: language === 'en' ? 'Trees confirmed' : 'Miti imehakikishwa',
      icon: CheckCircle2,
      color: 'text-blue-600',
    },
    {
      title: language === 'en' ? 'Pending' : 'Inasubiri',
      value: stats.pendingCount,
      subtitle: language === 'en' ? 'Awaiting review' : 'Inasubiri uhakiki',
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      title: language === 'en' ? 'Rewards' : 'Zawadi',
      value: `KSh ${stats.totalRewards}`,
      subtitle: language === 'en' ? 'Total earned' : 'Jumla iliyopatikana',
      icon: Wallet,
      color: 'text-emerald-600',
    },
    {
      title: language === 'en' ? 'Carbon Impact' : 'Athari ya Kaboni',
      value: `${stats.carbonImpact} kg`,
      subtitle: language === 'en' ? 'CO₂ sequestered/year' : 'CO₂ iliyobatizwa/mwaka',
      icon: Wind,
      color: 'text-cyan-600',
    },
    {
      title: language === 'en' ? 'Survival Rate' : 'Kiwango cha Kuishi',
      value: `${stats.survivalRate}%`,
      subtitle: language === 'en' ? 'Tree health' : 'Afya ya miti',
      icon: TrendingUp,
      color: 'text-purple-600',
    },
  ];

  if (loading) {
    return <div className="text-center py-8">{language === 'en' ? 'Loading...' : 'Inapakia...'}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'en' ? 'Quick Actions' : 'Vitendo vya Haraka'}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => navigate('/verifications')} variant="default">
            🌱 {language === 'en' ? 'Add Verification' : 'Ongeza Uthibitisho'}
          </Button>
          <Button onClick={() => navigate('/profile/rewards')} variant="outline">
            💰 {language === 'en' ? 'Withdraw Funds' : 'Ondoa Fedha'}
          </Button>
          <Button onClick={() => navigate('/profile/edit')} variant="outline">
            ✏️ {language === 'en' ? 'Edit Profile' : 'Hariri Wasifu'}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'en' ? 'Recent Activity' : 'Shughuli za Hivi Karibuni'}</CardTitle>
          <CardDescription>
            {language === 'en' ? 'Your latest planting verifications' : 'Uthibitisho wako wa hivi karibuni'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              {language === 'en' ? 'No activity yet' : 'Hakuna shughuli bado'}
            </p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-shrink-0">
                    {activity.status === 'verified' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    {activity.status === 'pending' && <Clock className="h-5 w-5 text-yellow-600" />}
                    {activity.status === 'rejected' && <span className="text-red-600">❌</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{activity.tree_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleDateString()} • {activity.county}
                    </p>
                  </div>
                  <div className="text-right">
                    {activity.status === 'verified' && (
                      <p className="text-sm font-medium text-green-600">
                        +KSh {activity.reward_amount || 0}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileDashboard;
