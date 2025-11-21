import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle,
  XCircle,
  MapPin,
  Calendar,
  User,
  Phone,
  DollarSign,
  Search,
  Filter,
  Download,
  Map
} from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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

export default function VerificationQueue() {
  const [verifications, setVerifications] = useState<VerificationItem[]>([]);
  const [filteredVerifications, setFilteredVerifications] = useState<VerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [countyFilter, setCountyFilter] = useState('all');
  const [selectedVerification, setSelectedVerification] = useState<VerificationItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject'>('approve');

  useEffect(() => {
    fetchVerifications();
  }, []);

  useEffect(() => {
    filterVerifications();
  }, [verifications, searchQuery, statusFilter, countyFilter]);

  const fetchVerifications = async () => {
    try {
      const { data, error } = await supabase.rpc('get_verification_queue');
      if (error) throw error;
      setVerifications(data || []);
    } catch (error) {
      logger.error('Error fetching verifications:', error);
      toast.error('Failed to load verifications');
    } finally {
      setLoading(false);
    }
  };

  const filterVerifications = () => {
    let filtered = verifications;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(v => v.status === statusFilter);
    }

    // County filter
    if (countyFilter !== 'all') {
      filtered = filtered.filter(v => v.county === countyFilter);
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(v =>
        v.full_name.toLowerCase().includes(query) ||
        v.tree_name.toLowerCase().includes(query) ||
        v.county.toLowerCase().includes(query)
      );
    }

    setFilteredVerifications(filtered);
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('planting_verifications')
        .update({
          status: 'verified',
          verified_at: new Date().toISOString(),
          verified_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Verification approved');
      fetchVerifications();
    } catch (error) {
      logger.error('Error approving:', error);
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
    } catch (error) {
      logger.error('Error rejecting:', error);
      toast.error('Failed to reject verification');
    }
  };

  const handleBulkAction = async () => {
    if (selectedItems.size === 0) {
      toast.error('No items selected');
      return;
    }

    if (bulkAction === 'reject' && !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      const user = (await supabase.auth.getUser()).data.user;
      const updates = {
        status: (bulkAction === 'approve' ? 'verified' : 'rejected') as 'verified' | 'rejected',
        verified_at: new Date().toISOString(),
        verified_by: user?.id,
        ...(bulkAction === 'reject' && { rejection_reason: rejectionReason })
      };

      const { error } = await supabase
        .from('planting_verifications')
        .update(updates)
        .in('id', Array.from(selectedItems));

      if (error) throw error;
      toast.success(`${selectedItems.size} verifications ${bulkAction === 'approve' ? 'approved' : 'rejected'}`);
      setShowBulkDialog(false);
      setSelectedItems(new Set());
      setRejectionReason('');
      fetchVerifications();
    } catch (error) {
      logger.error('Error with bulk action:', error);
      toast.error('Failed to process bulk action');
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredVerifications.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredVerifications.map(v => v.id)));
    }
  };

  const counties = [...new Set(verifications.map(v => v.county))];

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Verification Queue</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {filteredVerifications.length} verification{filteredVerifications.length !== 1 ? 's' : ''}
            {selectedItems.size > 0 && ` (${selectedItems.size} selected)`}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {selectedItems.size > 0 && (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  setBulkAction('approve');
                  setShowBulkDialog(true);
                }}
                className="w-full sm:w-auto"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Bulk</span> Approve ({selectedItems.size})
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setBulkAction('reject');
                  setShowBulkDialog(true);
                }}
                className="w-full sm:w-auto"
              >
                <XCircle className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Bulk</span> Reject ({selectedItems.size})
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="p-3 md:p-4">
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={countyFilter} onValueChange={setCountyFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Counties</SelectItem>
              {counties.map(county => (
                <SelectItem key={county} value={county}>{county}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" className="hidden md:flex">
            <Map className="h-4 w-4 mr-2" />
            Map View
          </Button>
        </div>
      </Card>

      {/* Table - Hidden on mobile, show cards instead */}
      <Card className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedItems.size === filteredVerifications.length && filteredVerifications.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Tree</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVerifications.map((verification) => (
              <TableRow key={verification.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedItems.has(verification.id)}
                    onCheckedChange={() => toggleSelection(verification.id)}
                  />
                </TableCell>
                <TableCell>
                  <img
                    src={verification.image_url}
                    alt="Planting"
                    className="w-16 h-16 object-cover rounded"
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{verification.tree_name}</p>
                    {verification.mpesa_transaction_id && (
                      <p className="text-xs text-muted-foreground font-mono">
                        {verification.mpesa_transaction_id}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{verification.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {verification.submission_phone || verification.user_phone}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">{verification.county}</p>
                    <p className="text-xs text-muted-foreground">{verification.constituency}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {new Date(verification.planting_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge variant={
                    verification.status === 'verified' ? 'default' :
                    verification.status === 'rejected' ? 'destructive' :
                    'secondary'
                  }>
                    {verification.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {verification.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApprove(verification.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedVerification(verification);
                          setShowRejectDialog(true);
                        }}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile Card View */}
      <div className="grid gap-3 md:hidden">
        {filteredVerifications.map((verification) => (
          <Card key={verification.id} className="p-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedItems.has(verification.id)}
                  onCheckedChange={() => toggleSelection(verification.id)}
                  className="mt-1"
                />
                <img
                  src={verification.image_url}
                  alt="Planting"
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{verification.tree_name}</p>
                  <p className="text-xs text-muted-foreground">{verification.full_name}</p>
                  <Badge variant={
                    verification.status === 'verified' ? 'default' :
                    verification.status === 'rejected' ? 'destructive' :
                    'secondary'
                  } className="mt-1">
                    {verification.status}
                  </Badge>
                </div>
              </div>
              
              <div className="text-xs space-y-1 text-muted-foreground">
                <p className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {verification.county}, {verification.constituency}
                </p>
                <p className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(verification.planting_date).toLocaleDateString()}
                </p>
                <p className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {verification.submission_phone || verification.user_phone}
                </p>
              </div>

              {verification.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleApprove(verification.id)}
                    className="flex-1"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setSelectedVerification(verification);
                      setShowRejectDialog(true);
                    }}
                    className="flex-1"
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this verification.
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
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Bulk {bulkAction === 'approve' ? 'Approve' : 'Reject'}
            </DialogTitle>
            <DialogDescription>
              You are about to {bulkAction} {selectedItems.size} verification{selectedItems.size !== 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>
          {bulkAction === 'reject' && (
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
              Cancel
            </Button>
            <Button
              variant={bulkAction === 'approve' ? 'default' : 'destructive'}
              onClick={handleBulkAction}
            >
              {bulkAction === 'approve' ? 'Approve' : 'Reject'} All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
