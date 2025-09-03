export const FEEDSTOCK_TILESET_ID: string = 'tylerhuntington222.cropland_landiq_2023';

// Crop residue factor mappings by crop type
// Each entry contains: { wetTonsPerAcre, moistureContent, dryTonsPerAcre }
// Values from the agricultural waste calculation methodology

// Orchard and Vineyard Residues (Prunings)
export const ORCHARD_VINEYARD_RESIDUES = {
  "Apples": { wetTonsPerAcre: 1.9, moistureContent: 0.4, dryTonsPerAcre: 1.2 },
  "Apricots": { wetTonsPerAcre: 2.5, moistureContent: 0.4, dryTonsPerAcre: 1.5 },
  "Avocados": { wetTonsPerAcre: 1.5, moistureContent: 0.4, dryTonsPerAcre: 0.9 },
  "Cherries": { wetTonsPerAcre: 2.1, moistureContent: 0.4, dryTonsPerAcre: 1.2 },
  "Dates": { wetTonsPerAcre: 0.6, moistureContent: 0.43, dryTonsPerAcre: 0.3 },
  "Figs": { wetTonsPerAcre: 2.2, moistureContent: 0.43, dryTonsPerAcre: 1.3 },
  "Grapes": { wetTonsPerAcre: 2.0, moistureContent: 0.45, dryTonsPerAcre: 1.1 },
  "Kiwifruit": { wetTonsPerAcre: 2.0, moistureContent: 0.45, dryTonsPerAcre: 1.1 },
  "Nectarines": { wetTonsPerAcre: 1.6, moistureContent: 0.43, dryTonsPerAcre: 0.9 },
  "Olives": { wetTonsPerAcre: 1.1, moistureContent: 0.43, dryTonsPerAcre: 0.7 },
  "Peaches": { wetTonsPerAcre: 2.3, moistureContent: 0.43, dryTonsPerAcre: 1.3 },
  "Pears": { wetTonsPerAcre: 2.3, moistureContent: 0.4, dryTonsPerAcre: 1.4 },
  "Persimmons": { wetTonsPerAcre: 1.6, moistureContent: 0.43, dryTonsPerAcre: 0.9 },
  "Plums & Prunes": { wetTonsPerAcre: 1.5, moistureContent: 0.43, dryTonsPerAcre: 0.9 },
  "Pomegranates": { wetTonsPerAcre: 1.6, moistureContent: 0.43, dryTonsPerAcre: 0.9 },
  "All Citrus": { wetTonsPerAcre: 2.5, moistureContent: 0.4, dryTonsPerAcre: 1.5 },
  "Almonds": { wetTonsPerAcre: 2.5, moistureContent: 0.4, dryTonsPerAcre: 1.5 },
  "Pecans": { wetTonsPerAcre: 1.6, moistureContent: 0.4, dryTonsPerAcre: 1.0 },
  "Pistachios": { wetTonsPerAcre: 1.0, moistureContent: 0.43, dryTonsPerAcre: 0.6 },
  "Walnuts": { wetTonsPerAcre: 1.0, moistureContent: 0.43, dryTonsPerAcre: 0.6 },
  "Fruits & Nuts unsp.": { wetTonsPerAcre: 1.6, moistureContent: 0.5, dryTonsPerAcre: 0.8 }
};

// Row Crop Residues
export const ROW_CROP_RESIDUES = {
  "Artichokes": { residueType: "Top Silage", wetTonsPerAcre: 1.7, moistureContent: 0.73, dryTonsPerAcre: 0.5 },
  "Asparagus": { residueType: "", wetTonsPerAcre: 2.2, moistureContent: 0.8, dryTonsPerAcre: 0.4 },
  "Green Lima Beans": { residueType: "Vines and Leaves", wetTonsPerAcre: 1.0, moistureContent: 0.8, dryTonsPerAcre: 0.2 },
  "Berries": { residueType: "Prunings and Leaves", wetTonsPerAcre: 1.3, moistureContent: 0.4, dryTonsPerAcre: 0.8 },
  "Snap Beans": { residueType: "Vines and Leaves", wetTonsPerAcre: 1.0, moistureContent: 0.8, dryTonsPerAcre: 0.2 },
  "Broccoli": { residueType: "", wetTonsPerAcre: 1.0, moistureContent: 0.8, dryTonsPerAcre: 0.2 },
  "Cabbage": { residueType: "", wetTonsPerAcre: 1.0, moistureContent: 0.8, dryTonsPerAcre: 0.2 },
  "Cantaloupe Melons": { residueType: "Vines and Leaves", wetTonsPerAcre: 1.2, moistureContent: 0.8, dryTonsPerAcre: 0.2 },
  "Carrots": { residueType: "Top Silage", wetTonsPerAcre: 1.0, moistureContent: 0.84, dryTonsPerAcre: 0.2 },
  "Cauliflower": { residueType: "", wetTonsPerAcre: 1.0, moistureContent: 0.8, dryTonsPerAcre: 0.2 },
  "Celery": { residueType: "", wetTonsPerAcre: 1.0, moistureContent: 0.8, dryTonsPerAcre: 0.2 },
  "Cucumbers": { residueType: "Vines and Leaves", wetTonsPerAcre: 1.7, moistureContent: 0.8, dryTonsPerAcre: 0.3 },
  "Garlic": { residueType: "", wetTonsPerAcre: 1.0, moistureContent: 0.73, dryTonsPerAcre: 0.3 },
  "Combined Melons": { residueType: "Vines and Leaves", wetTonsPerAcre: 1.2, moistureContent: 0.8, dryTonsPerAcre: 0.2 },
  "Lettuce and Romaine": { residueType: "", wetTonsPerAcre: 1.0, moistureContent: 0.8, dryTonsPerAcre: 0.2 },
  "Dry Onions": { residueType: "", wetTonsPerAcre: 1.0, moistureContent: 0.73, dryTonsPerAcre: 0.3 },
  "Green Onions": { residueType: "", wetTonsPerAcre: 1.0, moistureContent: 0.73, dryTonsPerAcre: 0.3 },
  "Hot Peppers": { residueType: "Stems & Leaf Meal", wetTonsPerAcre: 1.0, moistureContent: 0.8, dryTonsPerAcre: 0.2 },
  "Sweet Peppers": { residueType: "Stems & Leaf Meal", wetTonsPerAcre: 1.0, moistureContent: 0.8, dryTonsPerAcre: 0.2 },
  "Spices & herbs": { residueType: "", wetTonsPerAcre: 1.1, moistureContent: 0.8, dryTonsPerAcre: 0.2 },
  "Spinach": { residueType: "", wetTonsPerAcre: 1.0, moistureContent: 0.8, dryTonsPerAcre: 0.2 },
  "Squash": { residueType: "Vines and Leaves", wetTonsPerAcre: 1.2, moistureContent: 0.8, dryTonsPerAcre: 0.2 },
  "Sweet Corn": { residueType: "Stover", wetTonsPerAcre: 4.7, moistureContent: 0.2, dryTonsPerAcre: 3.8 },
  "Tomatoes": { residueType: "Vines and Leaves", wetTonsPerAcre: 1.3, moistureContent: 0.8, dryTonsPerAcre: 0.3 },
  "Unsp. vegetables": { residueType: "", wetTonsPerAcre: 1.4, moistureContent: 0.8, dryTonsPerAcre: 0.3 },
  "Potatoes": { residueType: "Vines and Leaves", wetTonsPerAcre: 1.2, moistureContent: 0.8, dryTonsPerAcre: 0.2 },
  "Sweet Potatos": { residueType: "Vines and Leaves", wetTonsPerAcre: 1.2, moistureContent: 0.8, dryTonsPerAcre: 0.2 },
  "Sugar Beets": { residueType: "Top Silage", wetTonsPerAcre: 2.4, moistureContent: 0.75, dryTonsPerAcre: 0.6 }
};

// Field Crop Residues
export const FIELD_CROP_RESIDUES = {
  "Corn": { residueType: "Stover", wetTonsPerAcre: 2.9, moistureContent: 0.2, dryTonsPerAcre: 2.3 },
  "Sorghum": { residueType: "Stover", wetTonsPerAcre: 2.2, moistureContent: 0.2, dryTonsPerAcre: 1.8 },
  "Wheat": { residueType: "Straw & Stubble", wetTonsPerAcre: 1.2, moistureContent: 0.14, dryTonsPerAcre: 1.0 },
  "Barley": { residueType: "Straw & Stubble", wetTonsPerAcre: 0.9, moistureContent: 0.15, dryTonsPerAcre: 0.7 },
  "Oats": { residueType: "Straw & Stubble", wetTonsPerAcre: 0.5, moistureContent: 0.15, dryTonsPerAcre: 0.4 },
  "Rice": { residueType: "Straw", wetTonsPerAcre: 1.8, moistureContent: 0.14, dryTonsPerAcre: 1.6 },
  "Safflower": { residueType: "Straw & Stubble", wetTonsPerAcre: 0.9, moistureContent: 0.14, dryTonsPerAcre: 0.8 },
  "Sunflower": { residueType: "Straw & Stubble", wetTonsPerAcre: 0.9, moistureContent: 0.14, dryTonsPerAcre: 0.8 },
  "Cotton": { residueType: "Straw & Stubble", wetTonsPerAcre: 1.5, moistureContent: 0.14, dryTonsPerAcre: 1.3 },
  "Beans": { residueType: "vines and leaves", wetTonsPerAcre: 1.0, moistureContent: 0.8, dryTonsPerAcre: 0.2 },
  "Lima Beans": { residueType: "Vines and Leaves", wetTonsPerAcre: 1.0, moistureContent: 0.8, dryTonsPerAcre: 0.2 },
  "Cowpeas & South. Peas": { residueType: "Vines and Leaves", wetTonsPerAcre: 1.0, moistureContent: 0.8, dryTonsPerAcre: 0.2 },
  "Soybeans": { residueType: "Stover", wetTonsPerAcre: 1.0, moistureContent: 0.2, dryTonsPerAcre: 0.8 },
  "Rye": { residueType: "Straw & Stubble", wetTonsPerAcre: 0.5, moistureContent: 0.14, dryTonsPerAcre: 0.4 },
  "Triticale": { residueType: "Straw & Stubble", wetTonsPerAcre: 1.2, moistureContent: 0.14, dryTonsPerAcre: 1.0 },
  "Alfalfa": { residueType: "Stems & Leaf Meal", wetTonsPerAcre: 1.0, moistureContent: 0.11, dryTonsPerAcre: 0.9 },
  "Bermuda Grass Seed": { residueType: "Grass", wetTonsPerAcre: 1.0, moistureContent: 0.6, dryTonsPerAcre: 0.4 },
  "Unsp. Field & Seed": { residueType: "Stubble", wetTonsPerAcre: 1.0, moistureContent: 0.14, dryTonsPerAcre: 0.86 }
};

// Mapping table for crop name standardization
// This maps the crop names in the database to the names in our residue factor tables
export const CROP_NAME_MAPPING = {
  // Orchard and Vineyard crops
  "Apples": "Apples",
  "Apricots": "Apricots",
  "Avocados": "Avocados",
  "Cherries": "Cherries",
  "Dates": "Dates",
  "Figs": "Figs",
  "Grapes": "Grapes",
  "Kiwis": "Kiwifruit",
  "Nectarines": "Nectarines",
  "Olives": "Olives",
  "Peaches/Nectarines": "Peaches",
  "Pears": "Pears",
  "Persimmons": "Persimmons",
  "Plums": "Plums & Prunes",
  "Prunes": "Plums & Prunes",
  "Pomegranates": "Pomegranates",
  "Citrus and Subtropical": "All Citrus",
  "Miscellaneous Subtropical Fruits": "All Citrus",
  "Almonds": "Almonds",
  "Pecans": "Pecans",
  "Pistachios": "Pistachios",
  "Walnuts": "Walnuts",
  "Miscellaneous Deciduous": "Fruits & Nuts unsp.",
  
  // Row crops
  "Artichokes": "Artichokes",
  "Asparagus": "Asparagus",
  "Bush Berries": "Berries",
  "Beans (Dry)": "Beans",
  "Lima Beans": "Lima Beans",
  "Green Lima Beans": "Green Lima Beans",
  "Broccoli": "Broccoli",
  "Cabbage": "Cabbage",
  "Cole Crops": "Cabbage",
  "Melons, Squash and Cucumbers": "Combined Melons",
  "Carrots": "Carrots",
  "Cauliflower": "Cauliflower",
  "Celery": "Celery",
  "Cucumbers": "Cucumbers",
  "Garlic": "Garlic",
  "Lettuce/Leafy Greens": "Lettuce and Romaine",
  "Onions and Garlic": "Dry Onions",
  "Peppers": "Hot Peppers",
  "Sweet Peppers": "Sweet Peppers",
  "Spinach": "Spinach",
  "Squash": "Squash",
  "Sweet Corn": "Sweet Corn",
  "Tomatoes": "Tomatoes",
  "Potatoes": "Potatoes",
  "Sweet Potatoes": "Sweet Potatos",
  "Sugar beets": "Sugar Beets",
  "Miscellaneous Truck Crops": "Unsp. vegetables",
  
  // Field crops
  "Corn, Sorghum and Sudan": "Corn",
  "Sorghum": "Sorghum",
  "Wheat": "Wheat",
  "Barley": "Barley",
  "Oats": "Oats",
  "Rice": "Rice",
  "Wild Rice": "Rice",
  "Safflower": "Safflower",
  "Sunflowers": "Sunflower",
  "Cotton": "Cotton",
  "Alfalfa & Alfalfa Mixtures": "Alfalfa",
  "Miscellaneous Field Crops": "Unsp. Field & Seed",
  "Miscellaneous Grain and Hay": "Unsp. Field & Seed",
  "Miscellaneous Grasses": "Bermuda Grass Seed"
};

// Helper functions for crop residue calculations
export const getCropResidueFactors = (cropName: string) => {
  // Get the standardized crop name from mapping
  const standardizedName = CROP_NAME_MAPPING[cropName as keyof typeof CROP_NAME_MAPPING] || null;
  
  if (!standardizedName) {
    return null;
  }
  
  // Check each residue category
  if (standardizedName in ORCHARD_VINEYARD_RESIDUES) {
    return {
      ...ORCHARD_VINEYARD_RESIDUES[standardizedName as keyof typeof ORCHARD_VINEYARD_RESIDUES],
      category: 'Orchard and Vineyard',
      residueType: 'Prunings'
    };
  }
  
  if (standardizedName in ROW_CROP_RESIDUES) {
    return {
      ...ROW_CROP_RESIDUES[standardizedName as keyof typeof ROW_CROP_RESIDUES],
      category: 'Row Crop'
    };
  }
  
  if (standardizedName in FIELD_CROP_RESIDUES) {
    return {
      ...FIELD_CROP_RESIDUES[standardizedName as keyof typeof FIELD_CROP_RESIDUES],
      category: 'Field Crop'
    };
  }
  
  return null;
};
