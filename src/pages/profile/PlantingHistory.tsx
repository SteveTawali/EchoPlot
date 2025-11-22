import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Calendar } from 'lucide-react';

interface Planting {
  id: string;
  status: 'verified' | 'pending' | 'rejected';
  created_at: string;
  planting_date?: string;
  tree_name: string;
  county?: string;
  constituency?: string;
  reward_amount?: number;
  notes?: string;
  rejection_reason?: string;
}

const PlantingHistory = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [plantings, setPlantings] = useState<Planting[]>([]);
  const [filteredPlantings, setFilteredPlantings] = useState<Planting[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadPlantings = async () => {
      const { data } = await supabase
        .from('planting_verifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setPlantings(data);
        setFilteredPlantings(data);
      }
      setLoading(false);
    };

    loadPlantings();
  }, [user]);

  useEffect(() => {
    let filtered = [...plantings];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.tree_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.county?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPlantings(filtered);
  }, [plantings, statusFilter, searchTerm]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      verified: { variant: 'default', label: language === 'en' ? 'Verified' : 'Imethibitishwa' },
      pending: { variant: 'secondary', label: language === 'en' ? 'Pending' : 'Inasubiri' },
      rejected: { variant: 'destructive', label: language === 'en' ? 'Rejected' : 'Imekataliwa' },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return <div className="text-center py-8">{language === 'en' ? 'Loading...' : 'Inapakia...'}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {language === 'en' ? 'Planting History' : 'Historia ya Kupanda'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'en' ? 'View and manage your tree plantings' : 'Angalia na simamia miche yako'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={language === 'en' ? 'Search by tree or location...' : 'Tafuta kwa mti au mahali...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === 'en' ? 'All Status' : 'Hali Zote'}</SelectItem>
            <SelectItem value="verified">{language === 'en' ? 'Verified' : 'Imethibitishwa'}</SelectItem>
            <SelectItem value="pending">{language === 'en' ? 'Pending' : 'Inasubiri'}</SelectItem>
            <SelectItem value="rejected">{language === 'en' ? 'Rejected' : 'Imekataliwa'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        {language === 'en' ? 'Showing' : 'Inaonyesha'} {filteredPlantings.length}{' '}
        {language === 'en' ? 'of' : 'ya'} {plantings.length}{' '}
        {language === 'en' ? 'plantings' : 'miche'}
      </p>

      {/* Plantings List */}
      <div className="space-y-4">
        {filteredPlantings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              {language === 'en' ? 'No plantings found' : 'Hakuna miche iliyopatikana'}
            </CardContent>
          </Card>
        ) : (
          filteredPlantings.map((planting) => (
            <Card key={planting.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{planting.tree_name}</CardTitle>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(planting.planting_date || planting.created_at).toLocaleDateString()}
                      </span>
                      {planting.county && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {planting.county}
                        </span>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(planting.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {planting.status === 'verified' && planting.reward_amount && (
                    <div>
                      <p className="text-muted-foreground">{language === 'en' ? 'Reward' : 'Zawadi'}</p>
                      <p className="font-medium text-green-600">KSh {planting.reward_amount}</p>
                    </div>
                  )}
                  {planting.constituency && (
                    <div>
                      <p className="text-muted-foreground">{language === 'en' ? 'Constituency' : 'Jimbo'}</p>
                      <p className="font-medium">{planting.constituency}</p>
                    </div>
                  )}
                  {planting.notes && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">{language === 'en' ? 'Notes' : 'Maelezo'}</p>
                      <p className="font-medium text-sm">{planting.notes}</p>
                    </div>
                  )}
                  {planting.rejection_reason && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">{language === 'en' ? 'Rejection Reason' : 'Sababu ya Kukataa'}</p>
                      <p className="font-medium text-sm text-destructive">{planting.rejection_reason}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PlantingHistory;
