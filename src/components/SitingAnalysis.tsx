'use client';

import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, X, ChevronDown, Trash2, XCircle } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SitingAnalysisProps {
  onClose: () => void;
  onRadiusChange: (radius: number) => void;
  onUnitChange: (unit: 'miles' | 'kilometers') => void;
  onRemoveSite?: () => void;
  radius: number;
  unit: 'miles' | 'kilometers';
  isActive: boolean;
  hasPlacedMarker: boolean;
}

const SitingAnalysis: React.FC<SitingAnalysisProps> = ({
  onClose,
  onRadiusChange,
  onUnitChange,
  onRemoveSite,
  radius,
  unit,
  isActive,
  hasPlacedMarker
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  return (
    <Card className={`absolute top-4 left-4 z-10 ${isCollapsed ? 'py-2 px-4' : 'p-4'} w-72 shadow-lg bg-white`}>
      <div className={`flex justify-between items-center ${isCollapsed ? 'mb-0' : 'mb-0'}`}>
        <h3 className="font-medium text-sm flex items-center">
          <MapPin className="h-4 w-4 mr-2" />
          Siting Analysis
        </h3>
        <div className="flex items-center">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsCollapsed(!isCollapsed);
            }}
            className="text-gray-500 hover:text-gray-700 transition-colors mr-1"
          >
            <ChevronDown className={`h-4 w-4 transform ${isCollapsed ? '-rotate-90' : ''}`} />
          </button>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="space-y-4">
          <p className="text-xs text-gray-600">
            {hasPlacedMarker
              ? "Marker placed. Adjust the buffer radius to update the analysis."
              : isActive
                ? "Click on the map to place a marker and analyze resources within the buffer zone."
                : "Click the 'New Site' button to begin analysis."}
          </p>

          <div className="space-y-2">
            <Label htmlFor="bufferRadius" className="text-xs">Buffer Radius</Label>
            <div className="flex space-x-2">
              <Input
                id="bufferRadius"
                type="number"
                min={0}
                step={1}
                value={Math.round(radius)}
                onChange={(e) => onRadiusChange(parseInt(e.target.value) || 0)}
                className="w-[42%] text-xs h-8"
              />
              <Select
                value={unit}
                onValueChange={(value) => onUnitChange(value as 'miles' | 'kilometers')}
              >
                <SelectTrigger className="w-[58%] h-8 text-xs">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="miles">Miles</SelectItem>
                  <SelectItem value="kilometers">Kilometers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="radiusSlider" className="text-xs">Adjust Radius</Label>
            <Slider
              id="radiusSlider"
              min={0}
              max={unit === 'miles' ? 50 : 80} // ~80km = ~50mi
              step={1}
              value={[Math.round(radius)]}
              onValueChange={(value) => onRadiusChange(Math.round(value[0]))}
            />
          </div>

          {/* Cancel Button - Only show when in active sighting mode (crosshair visible) */}
          {isActive && !hasPlacedMarker && (
            <div className="pt-1">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                className="w-full py-1.5 px-2 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-medium border border-red-200 flex items-center justify-center"
              >
                <XCircle className="h-3 w-3 mr-1" />
                Cancel
              </button>
            </div>
          )}

          {hasPlacedMarker && onRemoveSite && (
            <div className="pt-2">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemoveSite();
                }}
                className="w-full py-1.5 px-2 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-medium border border-red-200 flex items-center justify-center"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Remove Current Site
              </button>
            </div>
          )}

          {!hasPlacedMarker && !isActive && (
            <div className="text-xs text-gray-600">
              <span>Analysis mode inactive. Remove the current site to place a new one.</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default SitingAnalysis;
