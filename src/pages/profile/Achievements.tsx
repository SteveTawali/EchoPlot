import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Award, Target } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress?: number;
  target?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const Achievements = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [stats, setStats] = useState({ verified: 0, total: 0 });
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    if (!user) return;

    const loadAchievements = async () => {
      const { data: verifications } = await supabase
        .from('planting_verifications')
        .select('status')
        .eq('user_id', user.id);

      if (verifications) {
        const verified = verifications.filter(v => v.status === 'verified').length;
        setStats({ verified, total: verifications.length });

        // Generate achievements based on stats
        const badges: Achievement[] = [
          {
            id: '1',
            name: language === 'en' ? 'First Seedling' : 'Mche wa Kwanza',
            description: language === 'en' ? 'Plant your first tree' : 'Panda mti wako wa kwanza',
            icon: '🌱',
            earned: verified >= 1,
            progress: Math.min(verified, 1),
            target: 1,
            rarity: 'common',
          },
          {
            id: '2',
            name: language === 'en' ? 'Tree Planter' : 'Mpanda Miti',
            description: language === 'en' ? 'Plant 10 trees' : 'Panda miti 10',
            icon: '🌳',
            earned: verified >= 10,
            progress: Math.min(verified, 10),
            target: 10,
            rarity: 'common',
          },
          {
            id: '3',
            name: language === 'en' ? 'Forest Builder' : 'Mjenzi wa Msitu',
            description: language === 'en' ? 'Plant 50 trees' : 'Panda miti 50',
            icon: '🌲',
            earned: verified >= 50,
            progress: Math.min(verified, 50),
            target: 50,
            rarity: 'rare',
          },
          {
            id: '4',
            name: language === 'en' ? 'Reforestation Hero' : 'Shujaa wa Kuanzisha Misitu',
            description: language === 'en' ? 'Plant 100 trees' : 'Panda miti 100',
            icon: '🏆',
            earned: verified >= 100,
            progress: Math.min(verified, 100),
            target: 100,
            rarity: 'epic',
          },
          {
            id: '5',
            name: language === 'en' ? 'Climate Champion' : 'Bingwa wa Hali ya Hewa',
            description: language === 'en' ? 'Plant 500 trees' : 'Panda miti 500',
            icon: '👑',
            earned: verified >= 500,
            progress: Math.min(verified, 500),
            target: 500,
            rarity: 'legendary',
          },
        ];

        setAchievements(badges);
      }
    };

    loadAchievements();
  }, [user, language]);

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'bg-gray-500',
      rare: 'bg-blue-500',
      epic: 'bg-purple-500',
      legendary: 'bg-yellow-500',
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-600" />
              {language === 'en' ? 'Achievements' : 'Mafanikio'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {achievements.filter(a => a.earned).length}/{achievements.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-blue-600" />
              {language === 'en' ? 'Total Points' : 'Jumla ya Pointi'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.verified * 10}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-600" />
              {language === 'en' ? 'Level' : 'Kiwango'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{Math.floor(stats.verified / 10) + 1}</p>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          {language === 'en' ? 'Your Badges' : 'Medali Zako'}
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={`${achievement.earned ? 'border-primary shadow-lg' : 'opacity-60'} transition-all hover:scale-105`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`text-4xl ${!achievement.earned && 'grayscale'}`}>
                      {achievement.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{achievement.name}</CardTitle>
                      <CardDescription>{achievement.description}</CardDescription>
                    </div>
                  </div>
                  <Badge className={getRarityColor(achievement.rarity)}>
                    {achievement.rarity}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {!achievement.earned && achievement.target && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{language === 'en' ? 'Progress' : 'Maendeleo'}</span>
                      <span>{achievement.progress}/{achievement.target}</span>
                    </div>
                    <Progress value={(achievement.progress! / achievement.target) * 100} />
                  </div>
                )}
                {achievement.earned && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Target className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {language === 'en' ? 'Unlocked!' : 'Imefunguliwa!'}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Achievements;
