import treeOak from "@/assets/tree-oak.jpg";
import treeMaple from "@/assets/tree-maple.jpg";
import treePine from "@/assets/tree-pine.jpg";
import treeBirch from "@/assets/tree-birch.jpg";
import treeWillow from "@/assets/tree-willow.jpg";

export type SoilType = "clay" | "sandy" | "loamy" | "silty" | "peaty" | "chalky";
export type ClimateZone = "tropical" | "subtropical" | "temperate" | "cold" | "arid" | "mediterranean";
export type ConservationGoal = "carbon_sequestration" | "biodiversity" | "erosion_control" | "water_management" | "wildlife_habitat" | "food_production" | "aesthetic_beauty";

export interface TreeRequirements {
  preferredSoils: SoilType[];
  suitableClimates: ClimateZone[];
  conservationBenefits: ConservationGoal[];
  minLandSize: number; // in hectares
}

export interface Tree {
  id: number;
  name: string;
  scientificName: string;
  image: string;
  benefits: string[];
  climate: string;
  growthRate: string;
  requirements: TreeRequirements;
  description: string;
}

export const trees: Tree[] = [
  {
    id: 1,
    name: "Oak Tree",
    scientificName: "Quercus robur",
    image: treeOak,
    benefits: ["Carbon Storage", "Wildlife Habitat", "Longevity"],
    climate: "Temperate",
    growthRate: "Moderate",
    description: "Majestic hardwood that supports diverse ecosystems and stores significant carbon over centuries.",
    requirements: {
      preferredSoils: ["loamy", "clay", "silty"],
      suitableClimates: ["temperate", "cold"],
      conservationBenefits: ["carbon_sequestration", "wildlife_habitat", "biodiversity"],
      minLandSize: 0.5,
    },
  },
  {
    id: 2,
    name: "Maple Tree",
    scientificName: "Acer saccharum",
    image: treeMaple,
    benefits: ["Syrup Production", "Shade", "Fall Colors"],
    climate: "Cold-Temperate",
    growthRate: "Moderate",
    description: "Beautiful deciduous tree known for stunning fall foliage and sweet sap production.",
    requirements: {
      preferredSoils: ["loamy", "silty"],
      suitableClimates: ["temperate", "cold"],
      conservationBenefits: ["carbon_sequestration", "aesthetic_beauty", "food_production"],
      minLandSize: 0.3,
    },
  },
  {
    id: 3,
    name: "Pine Tree",
    scientificName: "Pinus sylvestris",
    image: treePine,
    benefits: ["Evergreen", "Soil Stabilization", "Wood Production"],
    climate: "Cold-Temperate",
    growthRate: "Fast",
    description: "Hardy evergreen conifer excellent for erosion control and timber production.",
    requirements: {
      preferredSoils: ["sandy", "loamy"],
      suitableClimates: ["temperate", "cold"],
      conservationBenefits: ["erosion_control", "carbon_sequestration"],
      minLandSize: 0.4,
    },
  },
  {
    id: 4,
    name: "Birch Tree",
    scientificName: "Betula pendula",
    image: treeBirch,
    benefits: ["Beautiful Bark", "Nitrogen Fixer", "Medicinal"],
    climate: "Cold",
    growthRate: "Fast",
    description: "Graceful tree with distinctive white bark that improves soil fertility.",
    requirements: {
      preferredSoils: ["loamy", "sandy", "silty"],
      suitableClimates: ["cold", "temperate"],
      conservationBenefits: ["biodiversity", "aesthetic_beauty"],
      minLandSize: 0.2,
    },
  },
  {
    id: 5,
    name: "Willow Tree",
    scientificName: "Salix babylonica",
    image: treeWillow,
    benefits: ["Water Management", "Erosion Control", "Fast Growth"],
    climate: "Temperate-Wet",
    growthRate: "Very Fast",
    description: "Fast-growing tree perfect for waterside planting and erosion prevention.",
    requirements: {
      preferredSoils: ["clay", "loamy", "silty"],
      suitableClimates: ["temperate", "subtropical"],
      conservationBenefits: ["water_management", "erosion_control"],
      minLandSize: 0.3,
    },
  },
];
