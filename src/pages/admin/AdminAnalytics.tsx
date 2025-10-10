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

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [countyData, setCountyData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch admin stats
      const { data: statsData, error: statsError } = await supabase.rpc('get_admin_stats');
      if (statsError) throw statsError;
      if (statsData && statsData.length > 0) {
        setStats(statsData[0]);
      }

      // Fetch county breakdown
      const { data: verifications, error: verifError } = await supabase
        .from('planting_verifications')
        .select('county, status');
      
      if (verifError) throw verifError;

      // Group by county
      const grouped = verifications?.reduce((acc: any, item) => {
        if (!acc[item.county]) {
          acc[item.county] = { verified: 0, pending: 0, rejected: 0 };
        }
        if (item.status === 'verified') acc[item.county].verified++;
        if (item.status === 'pending') acc[item.county].pending++;
        if (item.status === 'rejected') acc[item.county].rejected++;
        return acc;
      }, {});

      const countyArray = Object.entries(grouped || {}).map(([county, data]: any) => ({
        county,
        ...data,
        total: data.verified + data.pending + data.rejected
      })).sort((a, b) => b.total - a.total);

      setCountyData(countyArray);
    } catch (error) {
      console.error('Error fetching analytics:', error);
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
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics & Reports</h1>
        <p className="text-muted-foreground">System performance and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/10">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Verified</p>
              <p className="text-2xl font-bold">{stats?.total_approved || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/10">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approval Rate</p>
              <p className="text-2xl font-bold">{stats?.approval_rate || 0}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-500/10">
              <TreePine className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Carbon Sequestered</p>
              <p className="text-2xl font-bold">
                {((stats?.total_approved || 0) * 22).toLocaleString()} kg
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* County Performance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Performance by County</h3>
        <div className="space-y-4">
          {countyData.map((county) => (
            <div key={county.county} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{county.county}</span>
                <span className="text-sm text-muted-foreground">
                  {county.total} total submissions
                </span>
              </div>
              <div className="flex gap-2 h-6">
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
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>✓ {county.verified} verified</span>
                <span>⏳ {county.pending} pending</span>
                <span>✗ {county.rejected} rejected</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
