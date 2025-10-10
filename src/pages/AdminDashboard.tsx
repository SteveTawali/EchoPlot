import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  MapPin,
  Calendar,
  User,
  Phone,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';

interface VerificationItem {
  id: string;
  user_id: string;
  full_name: string;
  user_phone: string;
  submission_phone: string;
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
  mpesa_transaction_id: string;
}

interface AdminStats {
  total_pending: number;
  total_approved: number;
  total_rejected: number;
  approval_rate: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { canModerate, loading: authLoading } = useAdminAuth();
  const { t } = useLanguage();
  const [verifications, setVerifications] = useState<VerificationItem[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<VerificationItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  useEffect(() => {
    if (!authLoading && !canModerate) {
      toast.error('Access denied');
      navigate('/');
    }
  }, [canModerate, authLoading, navigate]);

  useEffect(() => {
    if (canModerate) {
      fetchVerifications();
      fetchStats();
    }
  }, [canModerate]);

  const fetchVerifications = async () => {
    try {
      const { data, error } = await supabase.rpc('get_verification_queue');
      
      if (error) throw error;
      
      setVerifications(data || []);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast.error('Failed to load verifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_admin_stats');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setStats(data[0]);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApprove = async (verification: VerificationItem) => {
    try {
      const { error } = await supabase
        .from('planting_verifications')
        .update({
          status: 'verified',
          verified_at: new Date().toISOString(),
          verified_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', verification.id);

      if (error) throw error;

      toast.success('Verification approved');
      fetchVerifications();
      fetchStats();
    } catch (error) {
      console.error('Error approving verification:', error);
      toast.error('Failed to approve verification');
    }
  };

  const handleReject = async () => {
    if (!selectedVerification || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      const { error } = await supabase
        .from('planting_verifications')
        .update({
          status: 'rejected',
          verified_at: new Date().toISOString(),
          verified_by: (await supabase.auth.getUser()).data.user?.id,
          rejection_reason: rejectionReason
        })
        .eq('id', selectedVerification.id);

      if (error) throw error;

      toast.success('Verification rejected');
      setShowRejectDialog(false);
      setSelectedVerification(null);
      setRejectionReason('');
      fetchVerifications();
      fetchStats();
    } catch (error) {
      console.error('Error rejecting verification:', error);
      toast.error('Failed to reject verification');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!canModerate) return null;

  const pendingVerifications = verifications.filter(v => v.status === 'pending');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('admin.title')}</h1>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">{t('admin.pending')}</p>
                <p className="text-2xl font-bold">{stats.total_pending}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">{t('admin.approved')}</p>
                <p className="text-2xl font-bold">{stats.total_approved}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">{t('admin.rejected')}</p>
                <p className="text-2xl font-bold">{stats.total_rejected}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">{t('admin.approvalRate')}</p>
                <p className="text-2xl font-bold">{stats.approval_rate}%</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Verification Queue */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">{t('admin.queue')}</h2>
        
        {pendingVerifications.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {t('admin.noVerifications')}
          </p>
        ) : (
          <div className="space-y-4">
            {pendingVerifications.map((verification) => (
              <Card key={verification.id} className="p-4">
                <div className="flex gap-4">
                  <img
                    src={verification.image_url}
                    alt="Planting"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{verification.tree_name}</h3>
                        <Badge variant="secondary">{verification.status}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(verification)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {t('common.approve')}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedVerification(verification);
                            setShowRejectDialog(true);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          {t('common.reject')}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{verification.full_name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{verification.submission_phone || verification.user_phone}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{verification.county}, {verification.constituency}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(verification.planting_date).toLocaleDateString()}</span>
                      </div>

                      {verification.mpesa_transaction_id && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs font-mono">{verification.mpesa_transaction_id}</span>
                        </div>
                      )}
                    </div>

                    {verification.notes && (
                      <p className="text-sm text-muted-foreground border-l-2 pl-4">
                        {verification.notes}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this verification.
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              {t('common.reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
