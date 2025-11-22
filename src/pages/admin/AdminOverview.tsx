import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  MapPin,
  Image as ImageIcon,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { sanitizeString, notesSchema } from '@/utils/validation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface DashboardStats {
  total_pending: number;
  total_approved: number;
  total_rejected: number;
  approval_rate: number;
  pending_by_county: Record<string, number>;
}

interface PlantingSubmission {
  id: string;
  user_id: string;
  full_name: string;
  tree_name: string;
  county: string;
  constituency: string;
  latitude: number;
  longitude: number;
  image_url: string;
  notes: string;
  planting_date: string;
  status: string;
  created_at: string;
  user_phone: string;
  submission_phone: string;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingSubmissions, setPendingSubmissions] = useState<PlantingSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<PlantingSubmission | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const { data: statsData, error: statsError } = await supabase.rpc('get_admin_stats');
      if (statsError) throw statsError;
      if (statsData && statsData.length > 0) {
        setStats(statsData[0] as unknown as DashboardStats);
      }

      // Fetch pending verifications using the RPC function
      const { data: queueData, error: queueError } = await supabase.rpc('get_verification_queue');
      if (queueError) throw queueError;

      // Filter for pending only
      const pending = (queueData || []).filter((item: PlantingSubmission) => item.status === 'pending');
      setPendingSubmissions(pending);
    } catch (error) {
      logger.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submission: PlantingSubmission) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('planting_verifications')
        .update({
          status: 'verified',
          verified_at: new Date().toISOString(),
          verified_by: (await supabase.auth.getUser()).data.user?.id,
          reward_amount: 100, // Default reward amount
        })
        .eq('id', submission.id);

      if (error) throw error;

      toast.success('Planting verified! Payment will be processed.');

      // TODO: Trigger M-Pesa payment via edge function
      // await supabase.functions.invoke('process-mpesa-payment', {
      //   body: { verificationId: submission.id, phone: submission.submission_phone }
      // });

      fetchDashboardData();
    } catch (error) {
      logger.error('Error approving submission:', error);
      toast.error('Failed to approve submission');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    // Validate and sanitize rejection reason
    const validation = notesSchema.safeParse(rejectionReason);
    if (!validation.success) {
      toast.error('Rejection reason is too long (max 1000 characters)');
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('planting_verifications')
        .update({
          status: 'rejected',
          verified_at: new Date().toISOString(),
          verified_by: (await supabase.auth.getUser()).data.user?.id,
          rejection_reason: sanitizeString(rejectionReason),
        })
        .eq('id', selectedSubmission.id);

      if (error) throw error;

      toast.success('Submission rejected');

      // TODO: Send SMS notification
      // await supabase.functions.invoke('send-sms-notification', {
      //   body: { phone: selectedSubmission.submission_phone, message: `Your planting submission was rejected: ${rejectionReason}` }
      // });

      setRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedSubmission(null);
      fetchDashboardData();
    } catch (error) {
      logger.error('Error rejecting submission:', error);
      toast.error('Failed to reject submission');
    } finally {
      setProcessing(false);
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
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Verification Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">Review and approve planting submissions</p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="p-2 md:p-3 rounded-full bg-orange-500/10">
              <Clock className="h-4 w-4 md:h-6 md:w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Pending</p>
              <p className="text-xl md:text-2xl font-bold">{stats?.total_pending || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="p-2 md:p-3 rounded-full bg-green-500/10">
              <CheckCircle className="h-4 w-4 md:h-6 md:w-6 text-green-500" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Approved</p>
              <p className="text-xl md:text-2xl font-bold">{stats?.total_approved || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="p-2 md:p-3 rounded-full bg-red-500/10">
              <XCircle className="h-4 w-4 md:h-6 md:w-6 text-red-500" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Rejected</p>
              <p className="text-xl md:text-2xl font-bold">{stats?.total_rejected || 0}</p>
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
      </div>

      {/* Pending Submissions Grid */}
      <div className="space-y-3 md:space-y-4">
        <h2 className="text-lg md:text-xl font-semibold">Pending Submissions ({pendingSubmissions.length})</h2>

        {pendingSubmissions.length === 0 ? (
          <Card className="p-8 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No pending submissions to review</p>
          </Card>
        ) : (
          <div className="grid gap-3 md:gap-4">
            {pendingSubmissions.map((submission) => (
              <Card key={submission.id} className="p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  {/* Image */}
                  <div className="space-y-2">
                    <img
                      src={submission.image_url}
                      alt="Planting verification"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Badge variant="secondary" className="w-full justify-center">
                      <ImageIcon className="h-3 w-3 mr-1" />
                      With GPS Data
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{submission.tree_name}</h3>
                      <p className="text-sm text-muted-foreground">by {submission.full_name}</p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          {submission.constituency && submission.county ? (
                            <p className="font-medium">{submission.constituency}, {submission.county}</p>
                          ) : (
                            <p className="font-medium text-muted-foreground">Location not provided</p>
                          )}
                          {submission.latitude != null && submission.longitude != null ? (
                            <p className="text-xs text-muted-foreground">
                              {Number(submission.latitude).toFixed(6)}, {Number(submission.longitude).toFixed(6)}
                            </p>
                          ) : (
                            <p className="text-xs text-red-500">⚠️ No GPS data</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Planted: {new Date(submission.planting_date).toLocaleDateString()}</span>
                      </div>

                      {submission.notes && (
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <p className="text-xs">{submission.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 md:gap-3">
                    {submission.latitude != null && submission.longitude != null ? (
                      <a
                        href={`https://www.google.com/maps?q=${submission.latitude},${submission.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full"
                      >
                        <Button variant="outline" className="w-full">
                          <MapPin className="h-4 w-4 mr-2" />
                          View on Map
                        </Button>
                      </a>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        <MapPin className="h-4 w-4 mr-2" />
                        No GPS Data
                      </Button>
                    )}

                    <Button
                      onClick={() => handleApprove(submission)}
                      disabled={processing}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve & Send Payment
                    </Button>

                    <Button
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setRejectDialogOpen(true);
                      }}
                      disabled={processing}
                      variant="destructive"
                      className="w-full"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>

                    <div className="text-xs text-muted-foreground text-center">
                      Submitted {new Date(submission.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* County Statistics */}
      <div className="grid gap-6 md:grid-cols-2">
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
                          width: `${(() => {
                            const values = Object.values(countyData).map(v => v as number);
                            const max = values.length > 0 ? Math.max(...values) : 1;
                            return max > 0 ? ((count as number / max) * 100) : 0;
                          })()}%`
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

        {/* Overall Stats */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Overall Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Approved</span>
              <span className="text-2xl font-bold text-green-600">{stats?.total_approved || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Rejected</span>
              <span className="text-2xl font-bold text-red-600">{stats?.total_rejected || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Approval Rate</span>
              <span className="text-2xl font-bold text-blue-600">{stats?.approval_rate || 0}%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejecting this planting verification. The user will receive this feedback.
            </p>
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !rejectionReason.trim()}
            >
              Reject Submission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
