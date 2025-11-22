import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle,
  DollarSign,
  TreePine
} from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

interface DashboardStats {
  total_approved: number;
  total_rejected: number;
  approval_rate: number;
}

interface CountyStats {
  county: string;
  verified: number;
  pending: number;
  rejected: number;
  total: number;
}

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [countyData, setCountyData] = useState<CountyStats[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch admin stats
      const { data: statsData, error: statsError } = await supabase.rpc('get_admin_stats');
      if (statsError) throw statsError;
      if (statsData && statsData.length > 0) {
        setStats(statsData[0] as unknown as DashboardStats);
      }

      // Fetch county breakdown
      const { data: verifications, error: verifError } = await supabase
        .from('planting_verifications')
        .select('county, status');

      if (verifError) throw verifError;

      // Group by county
      const grouped = verifications?.reduce((acc: Record<string, { verified: number; pending: number; rejected: number }>, item) => {
        if (!acc[item.county]) {
          acc[item.county] = { verified: 0, pending: 0, rejected: 0 };
        }
        if (item.status === 'verified') acc[item.county].verified++;
        if (item.status === 'pending') acc[item.county].pending++;
        if (item.status === 'rejected') acc[item.county].rejected++;
        return acc;
      }, {});

      const countyArray = Object.entries(grouped || {}).map(([county, data]) => {
        const stats = data as { verified: number; pending: number; rejected: number };
        return {
          county,
          ...stats,
          total: stats.verified + stats.pending + stats.rejected
        };
      }).sort((a, b) => b.total - a.total);

      setCountyData(countyArray);
    } catch (error) {
      logger.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Analytics & Reports</h1>
        <p className="text-sm md:text-base text-muted-foreground">System performance and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="p-2 md:p-3 rounded-full bg-green-500/10">
              <CheckCircle className="h-4 w-4 md:h-6 md:w-6 text-green-500" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Total Verified</p>
              <p className="text-xl md:text-2xl font-bold">{stats?.total_approved || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="p-2 md:p-3 rounded-full bg-blue-500/10">
              <TrendingUp className="h-4 w-4 md:h-6 md:w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Approval Rate</p>
              <p className="text-xl md:text-2xl font-bold">{stats?.approval_rate || 0}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="p-2 md:p-3 rounded-full bg-purple-500/10">
              <TreePine className="h-4 w-4 md:h-6 md:w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Carbon Sequestered</p>
              <p className="text-xl md:text-2xl font-bold">
                {((stats?.total_approved || 0) * 22).toLocaleString()} kg
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* County Performance */}
      <Card className="p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Performance by County</h3>
        <div className="space-y-3 md:space-y-4">
          {countyData.map((county) => (
            <div key={county.county} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm md:text-base font-medium truncate mr-2">{county.county}</span>
                <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                  {county.total} total
                </span>
              </div>
              <div className="flex gap-1 md:gap-2 h-5 md:h-6">
                <div
                  className="bg-green-500 rounded flex items-center justify-center text-xs text-white"
                  style={{ width: `${(county.verified / county.total) * 100}%` }}
                  title={`${county.verified} verified`}
                >
                  {county.verified > 0 && county.verified}
                </div>
                <div
                  className="bg-orange-500 rounded flex items-center justify-center text-xs text-white"
                  style={{ width: `${(county.pending / county.total) * 100}%` }}
                  title={`${county.pending} pending`}
                >
                  {county.pending > 0 && county.pending}
                </div>
                <div
                  className="bg-red-500 rounded flex items-center justify-center text-xs text-white"
                  style={{ width: `${(county.rejected / county.total) * 100}%` }}
                  title={`${county.rejected} rejected`}
                >
                  {county.rejected > 0 && county.rejected}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 md:gap-4 text-xs text-muted-foreground">
                <span>✓ {county.verified}</span>
                <span>⏳ {county.pending}</span>
                <span>✗ {county.rejected}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
