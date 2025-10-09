import { Card } from "@/components/ui/card";

interface TreeCardProps {
  name: string;
  scientificName: string;
  image: string;
  benefits: string[];
  climate: string;
  growthRate: string;
  onSwipe?: (direction: 'left' | 'right') => void;
}

export const TreeCard = ({
  name,
  scientificName,
  image,
  benefits,
  climate,
  growthRate,
}: TreeCardProps) => {
  return (
    <Card className="w-full max-w-sm overflow-hidden shadow-card hover:shadow-hover transition-all duration-300">
      <div className="relative h-96 overflow-hidden">
        <img
          src={image}
          alt={`${name} tree`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h2 className="text-3xl font-bold mb-1">{name}</h2>
          <p className="text-sm opacity-90 italic">{scientificName}</p>
        </div>
      </div>
      
      <div className="p-6 space-y-4 bg-gradient-card">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Benefits</h3>
          <div className="flex flex-wrap gap-2">
            {benefits.map((benefit, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium"
              >
                {benefit}
              </span>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-1">Climate</h3>
            <p className="text-sm">{climate}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-1">Growth Rate</h3>
            <p className="text-sm">{growthRate}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
