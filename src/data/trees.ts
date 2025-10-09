import treeOak from "@/assets/tree-oak.jpg";
import treeMaple from "@/assets/tree-maple.jpg";
import treePine from "@/assets/tree-pine.jpg";
import treeBirch from "@/assets/tree-birch.jpg";
import treeWillow from "@/assets/tree-willow.jpg";

export const trees = [
  {
    id: 1,
    name: "Oak Tree",
    scientificName: "Quercus robur",
    image: treeOak,
    benefits: ["Carbon Storage", "Wildlife Habitat", "Longevity"],
    climate: "Temperate",
    growthRate: "Moderate",
  },
  {
    id: 2,
    name: "Maple Tree",
    scientificName: "Acer saccharum",
    image: treeMaple,
    benefits: ["Syrup Production", "Shade", "Fall Colors"],
    climate: "Cold-Temperate",
    growthRate: "Moderate",
  },
  {
    id: 3,
    name: "Pine Tree",
    scientificName: "Pinus sylvestris",
    image: treePine,
    benefits: ["Evergreen", "Soil Stabilization", "Wood Production"],
    climate: "Cold-Temperate",
    growthRate: "Fast",
  },
  {
    id: 4,
    name: "Birch Tree",
    scientificName: "Betula pendula",
    image: treeBirch,
    benefits: ["Beautiful Bark", "Nitrogen Fixer", "Medicinal"],
    climate: "Cold",
    growthRate: "Fast",
  },
  {
    id: 5,
    name: "Willow Tree",
    scientificName: "Salix babylonica",
    image: treeWillow,
    benefits: ["Water Management", "Erosion Control", "Fast Growth"],
    climate: "Temperate-Wet",
    growthRate: "Very Fast",
  },
];
