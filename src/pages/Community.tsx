import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Users, TreePine, Leaf } from "lucide-react";
import { toast } from "sonner";

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  verified_count: number;
  total_matches: number;
  carbon_sequestered: number;
  rank: number;
}

interface CommunityStats {
  total_users: number;
  total_verified_plantings: number;
  total_carbon_sequestered: number;
  total_matches: number;
}

const Community = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    try {
      // Fetch leaderboard
      const { data: leaderboardData, error: leaderboardError } = await supabase.rpc('get_leaderboard');
      
      if (leaderboardError) throw leaderboardError;

      // Fetch community stats
      const { data: statsData, error: statsError } = await supabase.rpc('get_community_stats');
      
      if (statsError) throw statsError;

      setLeaderboard(leaderboardData || []);
      setStats(statsData?.[0] || null);
    } catch (error) {
      console.error('Error fetching community data:', error);
      toast.error('Failed to load community data');
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Community</h1>
          <p className="text-muted-foreground">Join our global reforestation movement</p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-fade-in">
          {loading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-20 w-full" />
                </Card>
              ))}
            </>
          ) : (
            <>
              <Card className="p-6 hover-scale">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-muted-foreground">Active Planters</p>
                    <p className="text-2xl font-bold">{stats?.total_users || 0}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 hover-scale">
                <div className="flex items-center gap-3">
                  <TreePine className="h-8 w-8 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-muted-foreground">Trees Planted</p>
                    <p className="text-2xl font-bold">{stats?.total_verified_plantings || 0}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 hover-scale">
                <div className="flex items-center gap-3">
                  <Leaf className="h-8 w-8 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-muted-foreground">CO₂ Sequestered</p>
                    <p className="text-2xl font-bold">{stats?.total_carbon_sequestered || 0} kg</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 hover-scale">
                <div className="flex items-center gap-3">
                  <Trophy className="h-8 w-8 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Matches</p>
                    <p className="text-2xl font-bold">{stats?.total_matches || 0}</p>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Leaderboard */}
        <Card className="p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="text-2xl font-bold">Top Planters</h2>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <TreePine className="h-16 w-16 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
              <p className="text-muted-foreground mb-4">No verified plantings yet. Be the first!</p>
              <Button onClick={() => navigate('/matches')}>
                Start Planting
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.user_id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-md ${
                    index < 3 ? 'bg-primary/5 border-primary/20' : 'bg-card'
                  }`}
                  role="listitem"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <span 
                      className="text-2xl font-bold min-w-[3rem] text-center"
                      aria-label={`Rank ${entry.rank}`}
                    >
                      {getRankBadge(entry.rank)}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold">{entry.full_name || 'Anonymous Planter'}</p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span aria-label={`${entry.verified_count} trees verified`}>
                          🌳 {entry.verified_count} verified
                        </span>
                        <span aria-label={`${entry.carbon_sequestered} kilograms carbon sequestered`}>
                          🍃 {entry.carbon_sequestered}kg CO₂
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="mt-8 flex gap-4 justify-center animate-fade-in">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            View Dashboard
          </Button>
          <Button onClick={() => navigate('/matches')}>
            Find Your Match
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Community;
