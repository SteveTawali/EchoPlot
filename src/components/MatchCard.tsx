import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Trash2 } from "lucide-react";
import { useTreeImage } from "@/hooks/useTreeImages";

interface MatchCardProps {
    match: {
        id: string;
        tree_id: number;
        tree_name: string;
        compatibility_score: number;
        matched_at: string;
        favorited: boolean;
    };
    onToggleFavorite: (matchId: string, currentStatus: boolean) => void;
    onDelete: (matchId: string) => void;
    onViewDetails: (matchId: string) => void;
}

export function MatchCard({ match, onToggleFavorite, onDelete, onViewDetails }: MatchCardProps) {
    const { imageUrl, loading: imageLoading } = useTreeImage(match.tree_name);

    const getCompatibilityColor = (score: number) => {
        if (score >= 80) return "bg-green-500";
        if (score >= 60) return "bg-yellow-500";
        return "bg-orange-500";
    };

    return (
        <Card className="overflow-hidden">
            <div className="relative h-48">
                {imageLoading ? (
                    <Skeleton className="w-full h-full" />
                ) : (
                    <img
                        src={imageUrl || undefined}
                        alt={match.tree_name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-4 right-4">
                    <div className={`${getCompatibilityColor(match.compatibility_score)} px-3 py-1 rounded-full`}>
                        <span className="text-white font-bold">{match.compatibility_score}%</span>
                    </div>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold">{match.tree_name}</h3>
                </div>
            </div>

            <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Matched {new Date(match.matched_at).toLocaleDateString()}</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                        variant={match.favorited ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => onToggleFavorite(match.id, match.favorited)}
                    >
                        <Star className={`w-4 h-4 mr-2 ${match.favorited ? "fill-current" : ""}`} />
                        {match.favorited ? "Favorited" : "Favorite"}
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() => onViewDetails(match.id)}
                    >
                        View Details
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(match.id)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}
