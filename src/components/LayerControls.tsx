'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Info, Layers, Filter, ChevronDown } from 'lucide-react';
import {
 Tooltip,
 TooltipContent,
 TooltipProvider,
 TooltipTrigger,
} from "@/components/ui/tooltip";

// Define the props interface
interface LayerControlsProps {
  initialVisibility: { [key: string]: boolean };
  onLayerToggle: (layerId: string, isVisible: boolean) => void;
  onCropFilterChange: (visibleCrops: string[]) => void;
  croplandOpacity: number;
  setCroplandOpacity: (opacity: number) => void;
  onInfrastructureToggle: (isVisible: boolean) => void;
  infrastructureMaster: boolean;
  onTransportationToggle: (isVisible: boolean) => void;
  transportationMaster: boolean;
}

const LayerControls: React.FC<LayerControlsProps> = ({
  initialVisibility,
  onLayerToggle,
  onCropFilterChange,
  croplandOpacity,
  setCroplandOpacity,
  onInfrastructureToggle,
  infrastructureMaster,
  onTransportationToggle,
  transportationMaster,
}) => {

  // Define type for the color mapping
  type CropColorMap = { [key: string]: string };

  // --- Static Crop Color Mapping ---
  const cropColorMapping: CropColorMap = useMemo(() => ({
      "Alfalfa & Alfalfa Mixtures": "#90EE90", "Almonds": "#8B4513", "Apples": "#FF0000",
      "Apricots": "#FFA500", "Avocados": "#556B2F", "Beans (Dry)": "#F5DEB3",
      "Bush Berries": "#BA55D3", "Carrots": "#FF8C00", "Cherries": "#DC143C",
      "Citrus and Subtropical": "#FFD700", "Cole Crops": "#2E8B57", "Corn, Sorghum and Sudan": "#DAA520",
      "Cotton": "#FFFAF0", "Dates": "#A0522D", "Eucalyptus": "#778899",
      "Flowers, Nursery and Christmas Tree Farms": "#FF69B4", "Grapes": "#800080", "Greenhouse": "#AFEEEE",
      "Idle – Long Term": "#D3D3D3", "Idle – Short Term": "#A9A9A9",
      "Induced high water table native pasture": "#ADD8E6", "Kiwis": "#9ACD32", "Lettuce/Leafy Greens": "#32CD32",
      "Melons, Squash and Cucumbers": "#FFDAB9", "Miscellaneous Deciduous": "#BDB76B",
      "Miscellaneous Field Crops": "#DEB887", "Miscellaneous Grain and Hay": "#F5F5DC",
      "Miscellaneous Grasses": "#98FB98", "Miscellaneous Subtropical Fruits": "#FF7F50",
      "Miscellaneous Truck Crops": "#66CDAA", "Mixed Pasture": "#006400", "Native Pasture": "#228B22",
      "Olives": "#808000", "Onions and Garlic": "#FFF8DC", "Peaches/Nectarines": "#FFC0CB",
      "Pears": "#90EE90", "Pecans": "#D2691E", "Peppers": "#B22222", "Pistachios": "#93C572",
      "Plums": "#DDA0DD", "Pomegranates": "#E34234", "Potatoes": "#CD853F", "Prunes": "#702963",
      "Rice": "#FFFFE0", "Safflower": "#FFEC8B", "Strawberries": "#FF1493", "Sugar beets": "#D8BFD8",
      "Sunflowers": "#FFDB58", "Sweet Potatoes": "#D2B48C", "Tomatoes": "#FF6347",
      "Turf Farms": "#00FF7F", "Unclassified Fallow": "#696969", "Walnuts": "#A52A2A",
      "Wheat": "#F4A460", "Wild Rice": "#EEE8AA", "Young Perennials": "#C19A6B",
  }), []);

  const allCropNames = useMemo(() => Object.keys(cropColorMapping).sort(), [cropColorMapping]);

  // --- State for Crop Filtering ---
  const [cropVisibility, setCropVisibility] = useState<{ [key: string]: boolean }>(() =>
    allCropNames.reduce((acc, name) => {
      acc[name] = true; // Initially all visible
      return acc;
    }, {} as { [key: string]: boolean })
  );
  const [filterText, setFilterText] = useState('');
  const [isCropLegendCollapsed, setIsCropLegendCollapsed] = useState(true);
  
  // State for collapsible sections
  const [isCropResiduesCollapsed, setIsCropResiduesCollapsed] = useState(false);
  const [isInfrastructureCollapsed, setIsInfrastructureCollapsed] = useState(false);
  const [isTransportationCollapsed, setIsTransportationCollapsed] = useState(false);
  
  // Month range slider state
  const [monthRange, setMonthRange] = useState<[number, number]>([0, 11]); // January to December by default
  
  // Month names for the range slider
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Helper function to get month name from index
  const getMonthName = (index: number) => monthNames[index];
  
  // Helper function to handle month range change
  const handleMonthRangeChange = (value: [number, number]) => {
    setMonthRange(value);
  };

  // --- Crop filtering logic ---
  const filteredCropNames = useMemo(() => 
    allCropNames.filter(name => 
      name.toLowerCase().includes(filterText.toLowerCase())
    ), [allCropNames, filterText]
  );

  const handleCropToggle = (cropName: string, isVisible: boolean) => {
    setCropVisibility(prev => {
      const newState = { ...prev, [cropName]: isVisible };
      const visibleCrops = Object.keys(newState).filter(name => newState[name]);
      onCropFilterChange(visibleCrops);
      return newState;
    });
  };

  // Notify parent of initial crop visibility
  useEffect(() => {
    const visibleCrops = allCropNames.filter(name => cropVisibility[name]);
    onCropFilterChange(visibleCrops);
  }, [allCropNames, cropVisibility, onCropFilterChange]); // Added missing dependencies

  const handleSelectAllCrops = () => {
    setCropVisibility(prev => {
      const newState = { ...prev };
      allCropNames.forEach(name => newState[name] = true);
      return newState;
    });
  };

  const handleDeselectAllCrops = () => {
     setCropVisibility(prev => {
        const newState = { ...prev };
        allCropNames.forEach(name => newState[name] = false);
        return newState;
     });
  };

  const isCroplandVisible = initialVisibility?.feedstock ?? false;

  return (
    <Card className="w-full py-1">
      <Accordion type="multiple" defaultValue={['layers', 'filters']} className="w-full px-4 py-0">
        {/* Layer Toggles Section */}
        <AccordionItem value="layers">
          <AccordionTrigger className="[&[data-state=open]>svg]:rotate-0 [&[data-state=closed]>svg]:-rotate-90">
            <div className="flex items-center text-sm">
              <Layers className="h-5 w-5 mr-2" />
              Layers
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pl-4">
              
              {/* Crop Residues Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="feedstockLayer"
                      checked={initialVisibility?.feedstock ?? false}
                      onCheckedChange={(checked: boolean | 'indeterminate') => onLayerToggle('feedstock', !!checked)}
                    />
                    <Label htmlFor="feedstockLayer" className="flex items-center font-medium">
                      Crop Residues
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Info className="h-4 w-4 ml-1 inline-block text-gray-500 cursor-help transition-colors hover:text-gray-700" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>Source: LandIQ 2023 Crop Mapping Dataset</p>
                            <a href="https://www.landiq.com/data/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              LandIQ Data Page
                            </a>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                  </div>
                  <button
                    onClick={() => setIsCropResiduesCollapsed(!isCropResiduesCollapsed)}
                    className="flex items-center p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronDown className={`text-muted-foreground size-4 shrink-0 translate-y-0.5 transition-transform duration-200 ${isCropResiduesCollapsed ? '-rotate-90' : 'rotate-0'}`} />
                  </button>
                </div>
                
                {/* Crop Residues Content - Only show when not collapsed */}
                {!isCropResiduesCollapsed && (
                  <>
                    {/* Opacity Slider for Cropland - Only show when layer is visible */}
                    {isCroplandVisible && (
                      <div className="pl-6 mt-2 space-y-1">
                        <Label htmlFor="croplandOpacitySlider" className="text-sm">Layer Opacity:</Label>
                        <Slider
                          id="croplandOpacitySlider"
                          min={0}
                          max={1}
                          step={0.01}
                          value={[croplandOpacity]}
                          className="w-[80%]"
                          onValueChange={(value) => setCroplandOpacity(value[0])}
                        />
                      </div>
                    )}

                    {/* --- Collapsible Crop Legend/Filter (only if Cropland is visible) --- */}
                    {isCroplandVisible && (
                      <div className="pl-6 mt-2 border-l-2 border-gray-200">
                        <button
                          onClick={() => setIsCropLegendCollapsed(!isCropLegendCollapsed)}
                          className="text-sm font-medium text-left w-full py-1 hover:bg-gray-100 rounded"
                        >
                          Filter Crop Types {isCropLegendCollapsed ? '▼' : '▲'}
                        </button>
                        {!isCropLegendCollapsed && (
                          <div className="mt-2 space-y-3 pr-2 max-h-60 overflow-y-auto">
                            <Input
                              type="text"
                              placeholder="Filter crops..."
                              value={filterText}
                              onChange={(e) => setFilterText(e.target.value)}
                              className="text-xs h-8"
                            />
                             <div className="flex justify-between text-xs">
                               <button onClick={handleSelectAllCrops} className="text-blue-600 hover:underline">Select All</button>
                               <button onClick={handleDeselectAllCrops} className="text-blue-600 hover:underline">Deselect All</button>
                             </div>
                            {filteredCropNames.map((cropName) => (
                              <div key={cropName} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`crop-${cropName}`}
                                  checked={cropVisibility[cropName] ?? false}
                                  onCheckedChange={(checked) => handleCropToggle(cropName, !!checked)}
                                />
                                <span
                                  style={{
                                    display: 'inline-block',
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: cropColorMapping[cropName],
                                    border: '1px solid #ccc',
                                    flexShrink: 0,
                                  }}
                                ></span>
                                <Label htmlFor={`crop-${cropName}`} className="text-xs font-normal flex-grow truncate" title={cropName}>
                                  {cropName}
                                </Label>
                              </div>
                            ))}
                            {filteredCropNames.length === 0 && (
                                <p className="text-xs text-gray-500 italic">No matching crops found.</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Infrastructure Layer Toggle */}
              <div className="space-y-2 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="infrastructureLayer"
                      checked={infrastructureMaster}
                      onCheckedChange={(checked: boolean | 'indeterminate') => onInfrastructureToggle(!!checked)}
                    />
                    <Label htmlFor="infrastructureLayer" className="font-medium">Infrastructure</Label>
                  </div>
                  <button
                    onClick={() => setIsInfrastructureCollapsed(!isInfrastructureCollapsed)}
                    className="flex items-center p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronDown className={`text-muted-foreground size-4 shrink-0 translate-y-0.5 transition-transform duration-200 ${isInfrastructureCollapsed ? '-rotate-90' : 'rotate-0'}`} />
                  </button>
                </div>

                {/* Infrastructure Content - Only show when not collapsed */}
                {!isInfrastructureCollapsed && (
                  <>
                    {/* Anaerobic Digester Layer Toggle - Under Infrastructure */}
                    <div className="flex items-center space-x-2 pl-6">
                       <Checkbox
                        id="anaerobicDigesterLayer"
                        checked={initialVisibility?.anaerobicDigester ?? false}
                        onCheckedChange={(checked: boolean | 'indeterminate') => onLayerToggle('anaerobicDigester', !!checked)}
                      />
                      <Label htmlFor="anaerobicDigesterLayer" className="flex items-center">
                        <span
                          style={{
                            display: 'inline-block',
                            width: '12px',
                            height: '12px',
                            backgroundColor: '#8B4513',
                            borderRadius: '50%',
                            marginRight: '4px',
                            flexShrink: 0,
                          }}
                        ></span>
                        Anaerobic Digesters
                      </Label>
                    </div>
                    
                    {/* Biodiesel Plants Layer Toggle - Under Infrastructure */}
                    <div className="flex items-center space-x-2 pl-6 mt-2">
                       <Checkbox
                        id="biodieselPlantsLayer"
                        checked={initialVisibility?.biodieselPlants ?? false}
                        onCheckedChange={(checked: boolean | 'indeterminate') => onLayerToggle('biodieselPlants', !!checked)}
                      />
                      <Label htmlFor="biodieselPlantsLayer" className="flex items-center">
                        <span
                          style={{
                            display: 'inline-block',
                            width: '12px',
                            height: '12px',
                            backgroundColor: '#228B22',
                            borderRadius: '50%',
                            marginRight: '4px',
                            flexShrink: 0,
                          }}
                        ></span>
                        Biodiesel Plants
                      </Label>
                    </div>
                  </>
                )}
              </div>

              {/* Transportation Layer Toggle */}
              <div className="space-y-2 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="transportationLayer"
                      checked={transportationMaster}
                      onCheckedChange={(checked: boolean | 'indeterminate') => onTransportationToggle(!!checked)}
                    />
                    <Label htmlFor="transportationLayer" className="font-medium">Transportation</Label>
                  </div>
                  <button
                    onClick={() => setIsTransportationCollapsed(!isTransportationCollapsed)}
                    className="flex items-center p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronDown className={`text-muted-foreground size-4 shrink-0 translate-y-0.5 transition-transform duration-200 ${isTransportationCollapsed ? '-rotate-90' : 'rotate-0'}`} />
                  </button>
                </div>

                {/* Transportation Content - Only show when not collapsed */}
                {!isTransportationCollapsed && (
                  <>
                    {/* Rail Lines Layer Toggle - Under Transportation */}
                    <div className="flex items-center space-x-2 pl-6">
                       <Checkbox
                        id="railLinesLayer"
                        checked={initialVisibility?.railLines ?? false}
                        onCheckedChange={(checked: boolean | 'indeterminate') => onLayerToggle('railLines', !!checked)}
                      />
                      <Label htmlFor="railLinesLayer" className="flex items-center">
                        <span
                          style={{
                            display: 'inline-block',
                            width: '16px',
                            height: '3px',
                            backgroundColor: '#FF4500',
                            marginRight: '4px',
                            flexShrink: 0,
                          }}
                        ></span>
                        Rail Lines
                      </Label>
                    </div>

                    {/* Freight Terminals Layer Toggle - Under Transportation */}
                    <div className="flex items-center space-x-2 pl-6 mt-2">
                       <Checkbox
                        id="freightTerminalsLayer"
                        checked={initialVisibility?.freightTerminals ?? false}
                        onCheckedChange={(checked: boolean | 'indeterminate') => onLayerToggle('freightTerminals', !!checked)}
                      />
                      <Label htmlFor="freightTerminalsLayer" className="flex items-center">
                        <span
                          style={{
                            display: 'inline-block',
                            width: '12px',
                            height: '12px',
                            backgroundColor: '#4169E1',
                            borderRadius: '50%',
                            marginRight: '4px',
                            flexShrink: 0,
                          }}
                        ></span>
                        Freight Terminals
                      </Label>
                    </div>

                    {/* Freight Routes Layer Toggle - Under Transportation */}
                    <div className="flex items-center space-x-2 pl-6 mt-2">
                       <Checkbox
                        id="freightRoutesLayer"
                        checked={initialVisibility?.freightRoutes ?? false}
                        onCheckedChange={(checked: boolean | 'indeterminate') => onLayerToggle('freightRoutes', !!checked)}
                      />
                      <Label htmlFor="freightRoutesLayer" className="flex items-center">
                        <span
                          style={{
                            display: 'inline-block',
                            width: '16px',
                            height: '3px',
                            backgroundColor: '#9932CC',
                            marginRight: '4px',
                            flexShrink: 0,
                          }}
                        ></span>
                        Freight Routes
                      </Label>
                    </div>
                  </>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Filtering Section */}
        <AccordionItem value="filters">
          <AccordionTrigger className="[&[data-state=open]>svg]:rotate-0 [&[data-state=closed]>svg]:-rotate-90">
            <div className="flex items-center text-sm">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              {/* Month Range Slider for Feedstock Availability */}
              <div className="space-y-3">
                <div className="px-2">
                  <Label className="text-sm font-medium">Feedstock Availability</Label>
                </div>
                <div className="px-2">
                  <Slider
                    min={0}
                    max={11}
                    step={1}
                    value={monthRange}
                    onValueChange={handleMonthRangeChange}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-2">
                    {monthRange[0] === monthRange[1] 
                      ? getMonthName(monthRange[0])
                      : `${getMonthName(monthRange[0])} - ${getMonthName(monthRange[1])} (inclusive)`
                    }
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};

export default LayerControls;