import { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Leaf, MapPin, TrendingUp, Calendar, TreeDeciduous } from "lucide-react";

const PlantingMapLazy = lazy(() =>
  import("@/components/PlantingMap").then((module) => ({
    default: module.PlantingMap
  }))
);

interface DashboardStats {
  totalMatches: number;
  totalVerifications: number;
  verifiedPlantings: number;
  pendingVerifications: number;
  totalCarbonEstimate: number;
}

interface PlantingLocation {
  id: string;
  tree_name: string;
  latitude: number;
  longitude: number;
  planting_date: string;
  status: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalMatches: 0,
    totalVerifications: 0,
    verifiedPlantings: 0,
    pendingVerifications: 0,
    totalCarbonEstimate: 0,
  });
  const [locations, setLocations] = useState<PlantingLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        // Fetch matches
        const { data: matches } = await supabase
          .from("tree_matches")
          .select("*")
          .eq("user_id", user.id);

        // Fetch verifications
        const { data: verifications } = await supabase
          .from("planting_verifications")
          .select("*")
          .eq("user_id", user.id);

        const verified = verifications?.filter((v) => v.status === "verified") || [];
        const pending = verifications?.filter((v) => v.status === "pending") || [];

        // Get locations with coordinates
        const locationsWithCoords =
          verifications?.filter(
            (v) => v.latitude !== null && v.longitude !== null && v.status === "verified"
          ) || [];

        // Estimate carbon sequestration (rough estimate: 20kg CO2/tree/year)
        const carbonEstimate = verified.length * 20;

        setStats({
          totalMatches: matches?.length || 0,
          totalVerifications: verifications?.length || 0,
          verifiedPlantings: verified.length,
          pendingVerifications: pending.length,
          totalCarbonEstimate: carbonEstimate,
        });

        setLocations(locationsWithCoords as PlantingLocation[]);
      } catch (error) {
        logger.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">Impact Dashboard</span>
          </div>
        </div>
      </nav>

      <div className="pt-20 px-4 pb-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">Your Environmental Impact</h1>
            <p className="text-muted-foreground">
              Track your tree plantings and their contribution to a greener planet
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <TreeDeciduous className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalMatches}</p>
                  <p className="text-sm text-muted-foreground">Tree Matches</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.verifiedPlantings}</p>
                  <p className="text-sm text-muted-foreground">Verified Plantings</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingVerifications}</p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalCarbonEstimate}</p>
                  <p className="text-sm text-muted-foreground">kg CO₂/year</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Map */}
          {locations.length > 0 ? (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Your Planting Locations</h2>
              <div className="h-96 rounded-lg overflow-hidden">
                <Suspense fallback={
                  <div className="h-full flex items-center justify-center bg-muted">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                  </div>
                }>
                  <PlantingMapLazy locations={locations} />
                </Suspense>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">No Verified Plantings Yet</h2>
              <p className="text-muted-foreground mb-6">
                Start verifying your plantings to see them on the map!
              </p>
              <Button variant="hero" onClick={() => navigate("/verifications")}>
                Add Verification
              </Button>
            </Card>
          )}

          {/* Timeline */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Planting Timeline</h2>
            {stats.totalVerifications > 0 ? (
              <div className="space-y-4">
                {locations
                  .sort(
                    (a, b) =>
                      new Date(b.planting_date).getTime() -
                      new Date(a.planting_date).getTime()
                  )
                  .slice(0, 5)
                  .map((location) => (
                    <div key={location.id} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Leaf className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{location.tree_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(location.planting_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                      </div>
                    </div>
                  ))}
                {locations.length > 5 && (
                  <Button
                    variant="outline"
                    onClick={() => navigate("/verifications")}
                    className="w-full"
                  >
                    View All Plantings
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No plantings to display yet</p>
              </div>
            )}
          </Card>

          {/* Impact Summary */}
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10">
            <h2 className="text-2xl font-bold mb-4">Your Environmental Contribution</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Trees Planted:</span>
                <span className="text-2xl font-bold">{stats.verifiedPlantings}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Estimated Annual CO₂ Absorption:</span>
                <span className="text-2xl font-bold text-green-600">
                  {stats.totalCarbonEstimate} kg
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Equivalent to:</span>
                <span className="text-lg font-semibold">
                  {Math.round(stats.totalCarbonEstimate / 411)} trees/year
                </span>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  🌍 You're making a real difference! Each tree absorbs approximately 20kg of CO₂ per
                  year, helping combat climate change and support biodiversity.
                </p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <Button onClick={() => navigate("/matches")} variant="outline">
              Find More Matches
            </Button>
            <Button onClick={() => navigate("/verifications")}>
              Upload Verification
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
