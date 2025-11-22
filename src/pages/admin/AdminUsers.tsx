import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Search, Shield, UserCog, Mail, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { countySchema, sanitizeString } from '@/utils/validation';

interface UserProfile {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  county: string;
  constituency: string;
  created_at: string;
  onboarding_completed: boolean;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'moderator' | 'user'>('user');
  const [selectedCounty, setSelectedCounty] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('onboarding_completed', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      logger.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        u.full_name?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.county?.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleAssignRole = async () => {
    if (!selectedUser) return;

    // Validate county if assigning moderator role
    if (selectedRole === 'moderator' && selectedCounty) {
      const validation = countySchema.safeParse(selectedCounty);
      if (!validation.success) {
        toast.error('Please enter a valid county');
        return;
      }
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: selectedUser.user_id,
          role: selectedRole,
          county: selectedRole === 'moderator' ? (selectedCounty ? sanitizeString(selectedCounty) : null) : null
        });

      if (error) throw error;
      toast.success('Role assigned successfully');
      setShowRoleDialog(false);
      setSelectedUser(null);
    } catch (error) {
      logger.error('Error assigning role:', error);
      toast.error('Failed to assign role');
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            {filteredUsers.length} total users
          </p>
        </div>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or county..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.user_id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    {user.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {user.phone}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3 w-3" />
                    {user.county && user.constituency
                      ? `${user.county}, ${user.constituency}`
                      : user.county || 'N/A'
                    }
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedUser(user);
                      setShowRoleDialog(true);
                    }}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Manage Role
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Role Assignment Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
            <DialogDescription>
              Manage roles and permissions for {selectedUser?.full_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Role</label>
              <Select value={selectedRole} onValueChange={(value: 'admin' | 'moderator' | 'user') => setSelectedRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedRole === 'moderator' && (
              <div>
                <label className="text-sm font-medium">County</label>
                <Input
                  placeholder="Enter county..."
                  value={selectedCounty}
                  onChange={(e) => setSelectedCounty(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Moderators can only manage verifications in their assigned county
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignRole}>
              Assign Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
