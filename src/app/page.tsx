'use client'; // Needed because LayerControls uses useState

import { useState, useMemo, useCallback } from 'react'; // Added useCallback
// Removed useSWRInfinite import
import Map from "@/components/Map"; // Import the Map component using alias
import LayerControls from '@/components/LayerControls'; // Import the new LayerControls component
import Header from '@/components/Header'; // Import the Header component

// Removed fetcher function
export default function Home() {
  // State for layer visibility
  const [layerVisibility, setLayerVisibility] = useState<{ [key: string]: boolean }>({ feedstock: true, transportation: false, railLines: false, anaerobicDigester: false, biodieselPlants: false, freightTerminals: false, freightRoutes: false }); // Added freightRoutes layer

  // Computed values for parent checkbox states based on child layer visibility
  const computedInfrastructureMaster = useMemo(() => {
    return layerVisibility.anaerobicDigester || layerVisibility.biodieselPlants || false;
  }, [layerVisibility.anaerobicDigester, layerVisibility.biodieselPlants]);

  const computedTransportationMaster = useMemo(() => {
    return layerVisibility.railLines || layerVisibility.freightTerminals || layerVisibility.freightRoutes || false;
  }, [layerVisibility.railLines, layerVisibility.freightTerminals, layerVisibility.freightRoutes]);

  // State for cropland layer opacity
  const [croplandOpacity, setCroplandOpacity] = useState<number>(0.6); // Default opacity

  // Define the full list of crop names (consistent with LayerControls)
  const allCropNames = useMemo(() => [
      "Alfalfa & Alfalfa Mixtures", "Almonds", "Apples", "Apricots", "Avocados",
      "Beans (Dry)", "Bush Berries", "Carrots", "Cherries", "Citrus and Subtropical",
      "Cole Crops", "Corn, Sorghum and Sudan", "Cotton", "Dates", "Eucalyptus",
      "Flowers, Nursery and Christmas Tree Farms", "Grapes", "Greenhouse",
      "Idle – Long Term", "Idle – Short Term", "Induced high water table native pasture",
      "Kiwis", "Lettuce/Leafy Greens", "Melons, Squash and Cucumbers",
      "Miscellaneous Deciduous", "Miscellaneous Field Crops", "Miscellaneous Grain and Hay",
      "Miscellaneous Grasses", "Miscellaneous Subtropical Fruits", "Miscellaneous Truck Crops",
      "Mixed Pasture", "Native Pasture", "Olives", "Onions and Garlic",
      "Peaches/Nectarines", "Pears", "Pecans", "Peppers", "Pistachios", "Plums",
      "Pomegranates", "Potatoes", "Prunes", "Rice", "Safflower", "Strawberries",
      "Sugar beets", "Sunflowers", "Sweet Potatoes", "Tomatoes", "Turf Farms",
      "Unclassified Fallow", "Walnuts", "Wheat", "Wild Rice", "Young Perennials"
  ].sort(), []);

  // State for the list of currently visible crops
  const [visibleCrops, setVisibleCrops] = useState<string[]>(allCropNames); // Start with all crops visible

  // --- Removed feedstock data fetching logic (useSWRInfinite, getKey, combinedFeedstockData, etc.) ---

  // Handler to toggle layer visibility
  const handleLayerToggle = (layerId: string, isVisible: boolean) => {
    setLayerVisibility(prev => ({ ...prev, [layerId]: isVisible }));
    
    // Update parent checkbox states based on child layer changes
    if (layerId === 'anaerobicDigester' || layerId === 'biodieselPlants') {
      // setInfrastructureMaster(isVisible); // Removed
    } else if (layerId === 'railLines' || layerId === 'freightTerminals' || layerId === 'freightRoutes') {
      // setTransportationMaster(isVisible); // Removed
    }
    
    console.log(`Toggled layer ${layerId} to ${isVisible}`);
  };

  // Handler for infrastructure master toggle
  const handleInfrastructureToggle = (isVisible: boolean) => {
    // setInfrastructureMaster(isVisible); // Removed
    setLayerVisibility(prev => ({
      ...prev,
      anaerobicDigester: isVisible, // Toggle anaerobic digester layer with infrastructure
      biodieselPlants: isVisible, // Toggle biodiesel plants layer with infrastructure
      // railLines: isVisible, // Moved to transportation section
      // Add future infrastructure sublayers here (e.g., facility points)
    }));
    console.log(`Toggled infrastructure master to ${isVisible}, infrastructure layers set to ${isVisible}`);
  };

  // Handler for transportation master toggle
  const handleTransportationToggle = (isVisible: boolean) => {
    // setTransportationMaster(isVisible); // Removed
    setLayerVisibility(prev => ({
      ...prev,
      transportation: isVisible, // Set transportation layer visibility
      railLines: isVisible, // Automatically toggle rail lines with transportation
      freightTerminals: isVisible, // Automatically toggle freight terminals with transportation
      freightRoutes: isVisible, // Automatically toggle freight routes with transportation
      // Add more transportation sublayers here as needed
    }));
    console.log(`Toggled transportation master to ${isVisible}, all transportation sublayers set to ${isVisible}`);
  };

  // Handler to update the list of visible crops from LayerControls (memoized)
  const handleCropFilterChange = useCallback((newVisibleCrops: string[]) => {
    setVisibleCrops(newVisibleCrops);
    console.log("Visible crops updated:", newVisibleCrops.length); // Log changes
  }, []); // Empty dependency array: function doesn't depend on component state/props

  // Removed feedstockError check UI
  return (
    <div className="h-screen flex flex-col">
      {/* Header with Logo */}
      <Header />
      
      {/* Main Content */}
      <main className="flex flex-1">
        {/* Container for Layer Controls */}
        {/* Increase sidebar width, e.g., w-80 or w-1/4 */}
        <div className="w-80 p-4 bg-gray-100 overflow-y-auto"> {/* Increased width */}
          <LayerControls
            initialVisibility={layerVisibility}
            onLayerToggle={handleLayerToggle}
            onCropFilterChange={handleCropFilterChange} // Pass the handler
            croplandOpacity={croplandOpacity} // Pass opacity state
            setCroplandOpacity={setCroplandOpacity} // Pass opacity setter
            onInfrastructureToggle={handleInfrastructureToggle} // Pass the new handler
            infrastructureMaster={computedInfrastructureMaster} // Pass the computed infrastructure master state
            onTransportationToggle={handleTransportationToggle} // Pass the new handler
            transportationMaster={computedTransportationMaster} // Pass the computed transportation master state
          />
          {/* Removed feedstockLoading display */}
        </div>
        {/* Container for the Map, taking remaining space and full height */}
        <div className="flex-grow h-full">
          {/* Pass fetched data and visibility state to the Map component */}
          <Map
            // Removed feedstockData prop
            layerVisibility={layerVisibility}
            visibleCrops={visibleCrops} // Pass the visible crops state
            croplandOpacity={croplandOpacity} // Pass opacity state
          />
        </div>
      </main>
    </div>
  );
}
