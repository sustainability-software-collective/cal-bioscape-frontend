'use client';

import React from 'react';
import { Card } from "@/components/ui/card";
import { ChevronDown, Leaf } from 'lucide-react';
import { getCropResidueFactors } from '@/lib/constants';
import { formatNumberWithCommas, downloadCSV } from '@/lib/utils';

interface CropInventory {
  name: string;
  acres: number;
  color: string;
}

interface CropInventoryWithResidue extends CropInventory {
  dryResidueYield: number | null;
  wetResidueYield: number | null;
  residueType: string | null;
}

interface SitingInventoryProps {
  isVisible: boolean;
  inventory: CropInventory[];
  totalAcres: number;
  bufferRadius: number;
  bufferUnit: string;
  location?: { lng: number; lat: number } | null;
}

const SitingInventory: React.FC<SitingInventoryProps> = ({
  isVisible,
  inventory,
  totalAcres,
  bufferRadius,
  bufferUnit,
  location
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  
  // Calculate residue yields for each crop in the inventory
  const inventoryWithResidues: CropInventoryWithResidue[] = React.useMemo(() => {
    return inventory.map(crop => {
      const residueFactors = getCropResidueFactors(crop.name);
      
      if (residueFactors) {
        // Calculate total residue amounts based on the harvested area (acres)
        const dryResidueYield = Math.round(crop.acres * residueFactors.dryTonsPerAcre);
        const wetResidueYield = Math.round(crop.acres * residueFactors.wetTonsPerAcre);
        
        return {
          ...crop,
          dryResidueYield,
          wetResidueYield,
          residueType: residueFactors.residueType || 'Residue'
        };
      }
      
      return {
        ...crop,
        dryResidueYield: null,
        wetResidueYield: null,
        residueType: null
      };
    });
  }, [inventory]);
  
  // Filter out rows with NA values (null residue yields)
  const filteredInventory = React.useMemo(() => {
    return inventoryWithResidues.filter((crop): crop is CropInventoryWithResidue & { dryResidueYield: number; wetResidueYield: number } => 
      crop.dryResidueYield !== null && crop.wetResidueYield !== null
    );
  }, [inventoryWithResidues]);
  
  // Calculate total residue yields from filtered inventory
  const totalDryResidue = React.useMemo(() => {
    return filteredInventory.reduce((sum, crop) => 
      sum + (crop.dryResidueYield || 0), 0);
  }, [filteredInventory]);
  
  const totalWetResidue = React.useMemo(() => {
    return filteredInventory.reduce((sum, crop) => 
      sum + (crop.wetResidueYield || 0), 0);
  }, [filteredInventory]);
  
  // Handler for exporting the inventory data as CSV
  const handleExportCSV = () => {
    if (filteredInventory.length === 0) return;
    
    // Format data for CSV
    const csvData = filteredInventory.map(crop => ({
      'Crop Type': crop.name,
      'Acres': Math.round(crop.acres),
      'Percentage': Math.round((crop.acres / totalAcres) * 100) + '%',
      'Dry Residue (tons)': crop.dryResidueYield,
      'Wet Residue (tons)': crop.wetResidueYield
    }));
    
    // Add a total row
    csvData.push({
      'Crop Type': 'Total',
      'Acres': Math.round(totalAcres),
      'Percentage': '100%',
      'Dry Residue (tons)': Math.round(totalDryResidue),
      'Wet Residue (tons)': Math.round(totalWetResidue)
    });
    
    // Create metadata for the CSV
    const metadata = [];

    // Add title with proper spacing for the header row
    metadata.push('BioCircular Valley Siting Tool - Resource Inventory');

    // Add location data if available - split lat/long to separate rows to avoid comma issues
    if (location) {
      metadata.push(`Location: ${location.lat.toFixed(6)}° N`);
      metadata.push(`${location.lng.toFixed(6)}° W`);
    }

    // Add buffer information
    metadata.push(`Buffer Zone: ${bufferRadius} ${bufferUnit}`);

    // Add date - format without commas
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'America/Los_Angeles'
    }).replace(/,/g, ''); // Remove commas from date

    // Split the date to avoid commas in CSV
    const dateParts = formattedDate.split(' ');
    if (dateParts.length >= 3) {
      metadata.push(`Generated: ${dateParts[0]} ${dateParts[1]}`);
      metadata.push(dateParts[2]); // Year on its own row
    }
    
    // Generate filename with date and location if available
    let filename = 'biocirv-resource-inventory';
    if (location) {
      filename += `-lat${location.lat.toFixed(4)}-lng${location.lng.toFixed(4)}`;
    }
    filename += `-${new Date().toISOString().split('T')[0]}.csv`;
    
    downloadCSV(csvData, filename, metadata);
  };

if (!isVisible) return null;

return (
    <Card className={`absolute top-4 right-4 z-10 ${isCollapsed ? 'py-2 px-4' : 'p-4'} w-[540px] max-w-[60%] shadow-lg bg-white`}>
      <div className={`flex justify-between items-center ${isCollapsed ? 'mb-0' : 'mb-0'}`}>
        <h3 className="font-medium text-sm flex items-center">
          <Leaf className="h-4 w-4 mr-2" />
          Resource Inventory
        </h3>
        <div className="flex items-center">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ChevronDown className={`h-4 w-4 transform ${isCollapsed ? '-rotate-90' : ''}`} />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="space-y-2">
          {/* Sighting Location */}
          {location && (
            <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded-md border">
              <span className="font-medium text-xs mb-0 mr-2">Site Location (Latitude, Longitude):</span>
              <span className="font-mono text-sm">
                {location.lat.toFixed(6)},{location.lng.toFixed(6)}
              </span>
            </div>
          )}
          
          <div className="text-xs text-gray-600 border-b pb-3">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-sm">Resources within {bufferRadius} {bufferUnit} buffer zone:</p>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                {filteredInventory.length} crop types
              </span>
            </div>
            <div className="mt-1 grid grid-cols-2 justify-between">
              <p className="font-normal text-sm">Total Dry Residue: {formatNumberWithCommas(Math.round(totalDryResidue))} tons</p>
              <p className="font-normal text-sm text-right">Total Wet Residue: {formatNumberWithCommas(Math.round(totalWetResidue))} tons</p>
            </div>
          </div>

          {filteredInventory.length > 0 ? (
            <div className="max-h-[350px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-3 text-left font-medium text-gray-500 w-[30%]">Crop Type</th>
                    <th className="py-2 px-2 text-right font-medium text-gray-500 w-[15%]">Acres</th>
                    <th className="py-2 px-2 text-right font-medium text-gray-500 w-[13%]">% of Area</th>
                    <th className="py-2 px-2 text-right font-medium text-gray-500 w-[21%]">Dry Residue (tons)</th>
                    <th className="py-2 px-2 text-right font-medium text-gray-500 w-[21%]">Wet Residue (tons)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInventory
                    .sort((a, b) => b.acres - a.acres) // Sort by acres descending
                    .map((crop, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-2 px-3 whitespace-normal">
                          <div className="flex items-center">
                            <span 
                              className="inline-block h-3 w-3 mr-2 rounded-sm flex-shrink-0" 
                              style={{ backgroundColor: crop.color }}
                            />
                            <span className="line-clamp-1" title={crop.name}>{crop.name}</span>
                          </div>
                        </td>
                        <td className="py-2 px-2 text-right">{formatNumberWithCommas(Math.round(crop.acres))}</td>
                        <td className="py-2 px-2 text-right">
                          {Math.round((crop.acres / totalAcres) * 100)}%
                        </td>
                        <td className="py-2 px-2 text-right">
                          {formatNumberWithCommas(crop.dryResidueYield)}
                        </td>
                        <td className="py-2 px-2 text-right">
                          {formatNumberWithCommas(crop.wetResidueYield)}
                        </td>
                      </tr>
                    ))}
                </tbody>
                <tfoot className="bg-gray-50 font-medium">
                  <tr>
                    <td className="py-2 px-3 text-left">Total</td>
                    <td className="py-2 px-2 text-right">{formatNumberWithCommas(Math.round(totalAcres))}</td>
                    <td className="py-2 px-2 text-right">100%</td>
                    <td className="py-2 px-2 text-right">{formatNumberWithCommas(Math.round(totalDryResidue))}</td>
                    <td className="py-2 px-2 text-right">{formatNumberWithCommas(Math.round(totalWetResidue))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center text-sm text-gray-500 py-4">
              No crop resources with residue data found within the buffer zone.
            </div>
          )}
          
          <div className="text-xs text-gray-500 border-t pt-3 mt-1">
            <p className="mb-1">This inventory shows crop residues available within the selected buffer zone, calculated based on <a href="https://www.sciencedirect.com/science/article/abs/pii/S0921344918303148" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">established crop residue yield factors</a>.</p>
            <div className="flex justify-between items-center">
              <p>Click on different map locations to compare resources.</p>
              <button 
                onClick={handleExportCSV} 
                className="text-gray-600 hover:text-gray-800 underline text-xs ml-auto"
                disabled={filteredInventory.length === 0}
              >
                Export Data
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default SitingInventory;
