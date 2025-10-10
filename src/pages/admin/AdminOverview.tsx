import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  TreePine,
  DollarSign,
  AlertTriangle,
  ClipboardCheck,
  BarChart3,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface DashboardStats {
  total_pending: number;
  total_approved: number;
  total_rejected: number;
  approval_rate: number;
  pending_by_county: any;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const { data: statsData, error: statsError } = await supabase.rpc('get_admin_stats');
      if (statsError) throw statsError;
      if (statsData && statsData.length > 0) {
        setStats(statsData[0]);
      }

      // Fetch recent verifications
      const { data: activityData, error: activityError } = await supabase
        .from('planting_verifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (activityError) throw activityError;
      setRecentActivity(activityData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const countyData = stats?.pending_by_county || {};
  const topCounties = Object.entries(countyData)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>
        <Link to="/admin/verifications">
          <Button>
            <Clock className="h-4 w-4 mr-2" />
            View Queue
          </Button>
        </Link>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-orange-500/10">
              <Clock className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{stats?.total_pending || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/10">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold">{stats?.total_approved || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-red-500/10">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold">{stats?.total_rejected || 0}</p>
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
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Counties */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Pending by County</h3>
          {topCounties.length > 0 ? (
            <div className="space-y-3">
              {topCounties.map(([county, count]) => (
                <div key={county} className="flex justify-between items-center">
                  <span className="text-sm">{county}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${(count as number / Math.max(...Object.values(countyData).map(v => v as number))) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-8 text-right">{String(count)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No pending verifications
            </p>
          )}
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Submissions</h3>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <div className={`p-2 rounded-full ${
                    item.status === 'verified' ? 'bg-green-500/10' :
                    item.status === 'rejected' ? 'bg-red-500/10' :
                    'bg-orange-500/10'
                  }`}>
                    {item.status === 'verified' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : item.status === 'rejected' ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.tree_name}</p>
                    <p className="text-xs text-muted-foreground">{item.county}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent activity
            </p>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-4">
          <Link to="/admin/verifications">
            <Button variant="outline" className="w-full justify-start">
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Review Queue
            </Button>
          </Link>
          <Link to="/admin/users">
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
          </Link>
          <Link to="/admin/analytics">
            <Button variant="outline" className="w-full justify-start">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </Link>
          <Link to="/admin/settings">
            <Button variant="outline" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
