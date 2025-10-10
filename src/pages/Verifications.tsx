import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VerificationUpload } from "@/components/VerificationUpload";
import { ArrowLeft, CheckCircle, Clock, XCircle, Leaf, Upload } from "lucide-react";
import { toast } from "sonner";

interface Verification {
  id: string;
  tree_name: string;
  image_url: string;
  latitude: number | null;
  longitude: number | null;
  planting_date: string;
  status: 'pending' | 'verified' | 'rejected';
  notes: string | null;
  rejection_reason: string | null;
  created_at: string;
}

const Verifications = () => {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const matchId = searchParams.get('matchId');
  const treeName = searchParams.get('treeName');

  useEffect(() => {
    if (matchId && treeName) {
      setShowUpload(true);
    }
    fetchVerifications();
  }, [user]);

  const fetchVerifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("planting_verifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVerifications(data || []);
    } catch (error: any) {
      toast.error("Failed to load verifications");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-600">Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending Review</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (showUpload && treeName) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
            <Button variant="ghost" onClick={() => setShowUpload(false)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Verifications
            </Button>
          </div>
        </nav>

        <div className="pt-20 px-4 pb-12">
          <div className="max-w-2xl mx-auto">
            <VerificationUpload
              matchId={matchId || undefined}
              treeName={treeName}
              onSuccess={() => {
                fetchVerifications();
                setShowUpload(false);
              }}
              onCancel={() => setShowUpload(false)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">Your Verifications</span>
          </div>
        </div>
      </nav>

      <div className="pt-20 px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Planting Verifications</h1>
              <p className="text-muted-foreground">
                Track your verified plantings and environmental impact
              </p>
            </div>
            <Button variant="hero" onClick={() => setShowUpload(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Add Verification
            </Button>
          </div>

          {verifications.length === 0 ? (
            <Card className="p-12 text-center">
              <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">No verifications yet</h2>
              <p className="text-muted-foreground mb-6">
                Start verifying your plantings to track your impact!
              </p>
              <Button variant="hero" onClick={() => setShowUpload(true)}>
                Upload First Verification
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {verifications.map((verification) => (
                <Card key={verification.id} className="overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      <img
                        src={verification.image_url}
                        alt={verification.tree_name}
                        className="w-full h-64 md:h-full object-cover"
                      />
                    </div>
                    <div className="p-6 md:w-2/3 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-bold mb-1">{verification.tree_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Planted on {new Date(verification.planting_date).toLocaleDateString()}
                          </p>
                        </div>
                        {getStatusBadge(verification.status)}
                      </div>

                      {verification.latitude && verification.longitude && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Location:</span>
                          <span>
                            {verification.latitude.toFixed(4)}, {verification.longitude.toFixed(4)}
                          </span>
                        </div>
                      )}

                      {verification.notes && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Notes:</p>
                          <p className="text-sm">{verification.notes}</p>
                        </div>
                      )}

                      {verification.status === 'rejected' && verification.rejection_reason && (
                        <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg">
                          <p className="text-sm text-red-600 dark:text-red-400">
                            <strong>Rejection Reason:</strong> {verification.rejection_reason}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {getStatusIcon(verification.status)}
                        <span>
                          Submitted {new Date(verification.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Verifications;
