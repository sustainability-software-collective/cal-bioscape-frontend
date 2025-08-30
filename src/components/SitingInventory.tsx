'use client';

import React from 'react';
import { Card } from "@/components/ui/card";
import { ChevronDown, Leaf } from 'lucide-react';

interface CropInventory {
  name: string;
  acres: number;
  color: string;
}

interface SitingInventoryProps {
  isVisible: boolean;
  inventory: CropInventory[];
  totalAcres: number;
  bufferRadius: number;
  bufferUnit: string;
}

const SitingInventory: React.FC<SitingInventoryProps> = ({
  isVisible,
  inventory,
  totalAcres,
  bufferRadius,
  bufferUnit
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  
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
        <div className="space-y-4">
          <div className="text-xs text-gray-600 border-b pb-3">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">Resources within {bufferRadius} {bufferUnit} buffer zone</p>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                {inventory.length} crop types
              </span>
            </div>
            <p className="font-semibold text-sm">Total Area: {totalAcres.toFixed(2)} acres</p>
          </div>

          {inventory.length > 0 ? (
            <div className="max-h-[350px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-4 text-left font-medium text-gray-500 w-[65%]">Crop Type</th>
                    <th className="py-2 px-3 text-right font-medium text-gray-500 w-[18%]">Acres</th>
                    <th className="py-2 px-3 text-right font-medium text-gray-500 w-[17%]">% of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {inventory
                    .sort((a, b) => b.acres - a.acres) // Sort by acres descending
                    .map((crop, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-2 px-4 whitespace-normal">
                          <div className="flex items-center">
                            <span 
                              className="inline-block h-3 w-3 mr-2 rounded-sm flex-shrink-0" 
                              style={{ backgroundColor: crop.color }}
                            />
                            <span className="line-clamp-1" title={crop.name}>{crop.name}</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right">{crop.acres.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right">
                          {((crop.acres / totalAcres) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-sm text-gray-500 py-4">
              No crop resources found within the buffer zone.
            </div>
          )}
          
          <div className="text-xs text-gray-500 border-t pt-3 mt-1">
            <p className="mb-1">This inventory shows crop residues available within the selected buffer zone.</p>
            <div className="flex items-center justify-between">
              <p>Click on different map locations to compare resources.</p>
              <button 
                onClick={() => {}} 
                className="text-gray-600 hover:text-gray-800 underline text-xs"
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
