'use client'; // Mark this component as a Client Component

import React, { useRef, useEffect, useState, useCallback } from 'react'; // Added useCallback
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css'; // Import Mapbox CSS
import * as turf from '@turf/turf'; // Import TurfJS
import SitingButton from './SitingButton';
import SitingAnalysis from './SitingAnalysis';
import SitingInventory from './SitingInventory'; // Import the new component

// --- Configuration ---
// IMPORTANT: Replace with your actual Mapbox access token if using the placeholder.
// It's best practice to store this in an environment variable (e.g., .env.local)
// and access it via process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'YOUR_MAPBOX_ACCESS_TOKEN'; // Use provided placeholder

if (!MAPBOX_ACCESS_TOKEN || MAPBOX_ACCESS_TOKEN === 'YOUR_MAPBOX_ACCESS_TOKEN') {
  console.warn(
    'Mapbox Access Token is not set or using placeholder. Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your environment variables (.env.local) for the map to function correctly.'
  );
  // Consider adding a user-facing message here if the token is missing in production
}

// Set Mapbox access token globally (only if it's not the placeholder)
// Mapbox GL JS will automatically use the token from mapboxgl.accessToken if set.
// If it's the placeholder, the map initialization might fail silently or show errors in the console.
if (MAPBOX_ACCESS_TOKEN && MAPBOX_ACCESS_TOKEN !== 'YOUR_MAPBOX_ACCESS_TOKEN') {
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
}


// Accept props for data and visibility
const Map = ({ layerVisibility, visibleCrops, croplandOpacity }) => { // Added visibleCrops & croplandOpacity props
  const mapContainer = useRef(null); // Reference to the map container div
  const map = useRef(null); // Reference to the map instance
  const [mapLoaded, setMapLoaded] = useState(false); // State to track map load status
  const currentPopup = useRef(null); // Reference to track the current popup
  
  // Siting analysis state
  const [sitingMode, setSitingMode] = useState(false);
  const [showSitingPanel, setShowSitingPanel] = useState(false);
  const [hasPlacedMarker, setHasPlacedMarker] = useState(false);
  const [radius, setRadius] = useState(10); // Initial radius in miles
  const [unit, setUnit] = useState('miles');
  const currentMarker = useRef(null);
  const currentBuffer = useRef(null);
  
  // Resource inventory state
  const [showInventoryPanel, setShowInventoryPanel] = useState(false);
  const [inventoryData, setInventoryData] = useState([]);
  const [totalAcres, setTotalAcres] = useState(0);

  // Define crop color mapping
  const cropColorMapping = {
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
      "Pears": "#ADFF2F", "Pecans": "#D2691E", "Peppers": "#B22222", "Pistachios": "#93C572",
      "Plums": "#DDA0DD", "Pomegranates": "#E34234", "Potatoes": "#CD853F", "Prunes": "#702963",
      "Rice": "#FFFFE0", "Safflower": "#FFEC8B", "Strawberries": "#FF1493", "Sugar beets": "#D8BFD8",
      "Sunflowers": "#FFDB58", "Sweet Potatoes": "#D2B48C", "Tomatoes": "#FF6347",
      "Turf Farms": "#00FF7F", "Unclassified Fallow": "#696969", "Walnuts": "#A52A2A",
      "Wheat": "#F4A460", "Wild Rice": "#EEE8AA", "Young Perennials": "#C19A6B",
  };

  // Function to convert radius to meters based on the selected unit
  const convertToMeters = useCallback((value, unit) => {
    return unit === 'miles' ? value * 1609.34 : value * 1000;
  }, []);

  // Function to analyze resources within the buffer
  const analyzeResourcesInBuffer = useCallback((buffer) => {
    if (!map.current || !mapLoaded) {
      console.log("Map not ready for analysis");
      return;
    }

    // Check if the feedstock layer exists and is ready
    if (!map.current.getLayer('feedstock-vector-layer')) {
      console.log("Feedstock layer not available for analysis - layer not found");
      return;
    }

    // Check if the feedstock source exists and is ready
    const feedstockSource = map.current.getSource('feedstock-vector-source');
    if (!feedstockSource) {
      console.log("Feedstock source not available for analysis - source not found");
      return;
    }

    // Check if the source is loaded
    if (feedstockSource.loaded && !feedstockSource.loaded()) {
      console.log("Feedstock source not fully loaded yet");
      return;
    }

    console.log("Analyzing resources within buffer...");

    try {
      // Validate buffer geometry first
      if (!buffer || !buffer.geometry || !buffer.geometry.coordinates) {
        console.error("Invalid buffer geometry for analysis");
        return;
      }

      // Get all source features from the feedstock layer
      const features = map.current.queryRenderedFeatures(undefined, {
        layers: ['feedstock-vector-layer']
      });
      
      console.log(`Found ${features.length} total features to analyze`);
      
      // Process features to find those within the buffer
      const cropInventory = {};
      let bufferTotalAcres = 0;
      let featuresAnalyzed = 0;
      let featuresWithErrors = 0;

      // Use bounding box for initial filtering
      let bufferBbox;
      try {
        bufferBbox = turf.bbox(buffer);
      } catch (bboxError) {
        console.error("Error calculating buffer bounding box:", bboxError);
        return;
      }
      
      features.forEach(feature => {
        try {
          // Skip features without geometry
          if (!feature.geometry || !feature.geometry.coordinates || 
              feature.geometry.coordinates.length === 0) {
            return;
          }
          
          featuresAnalyzed++;
          
          // Get properties
          const props = feature.properties;
          const cropName = props.main_crop_name || 'Unknown';
          const acres = parseFloat(props.acres) || 0;
          
          // Create a polygon from the feature
          let featureGeom;
          try {
            // Handle different geometry types
            if (feature.geometry.type === 'MultiPolygon') {
              // For MultiPolygon, get the first polygon
              if (feature.geometry.coordinates[0] && feature.geometry.coordinates[0].length > 0) {
                featureGeom = turf.polygon(feature.geometry.coordinates[0]);
              } else {
                console.log(`Skipping invalid MultiPolygon feature`);
                return;
              }
            } else if (feature.geometry.type === 'Polygon') {
              if (feature.geometry.coordinates.length > 0) {
                featureGeom = turf.polygon(feature.geometry.coordinates);
              } else {
                console.log(`Skipping invalid Polygon feature`);
                return;
              }
            } else {
              console.log(`Skipping feature with geometry type: ${feature.geometry.type}`);
              return;
            }

            // Validate the created geometry
            if (!featureGeom || !featureGeom.geometry || !featureGeom.geometry.coordinates) {
              console.log(`Skipping feature with invalid geometry after creation`);
              return;
            }
          } catch (geomError) {
            console.error("Error creating feature geometry:", geomError);
            featuresWithErrors++;
            return;
          }
          
          // Check if the feature intersects with the buffer
          try {
            // First use a quick bounding box check
            let featureBbox;
            try {
              featureBbox = turf.bbox(featureGeom);
            } catch (bboxError) {
              console.log(`Skipping feature with invalid bounding box`);
              return;
            }
            
            // Check if bboxes overlap
            if (bufferBbox[0] > featureBbox[2] || bufferBbox[2] < featureBbox[0] || 
                bufferBbox[1] > featureBbox[3] || bufferBbox[3] < featureBbox[1]) {
              return; // Bounding boxes don't overlap
            }
            
            // For features that pass the bbox test, check if they're within or intersect the buffer
            let isOverlapping = false;
            let isWithin = false;
            
            try {
              isOverlapping = turf.booleanOverlap(featureGeom, buffer);
              isWithin = turf.booleanWithin(featureGeom, buffer);
            } catch (booleanError) {
              console.log(`Boolean operation failed for feature, skipping:`, booleanError);
              return;
            }
            
            if (isOverlapping || isWithin) {
              
              let intersectionArea = acres;
              
              // If it's not fully within, calculate the intersection area
              if (!isWithin) {
                try {
                  const intersection = turf.intersect(featureGeom, buffer);
                  if (intersection && intersection.geometry && intersection.geometry.coordinates) {
                    // Validate intersection geometry before calculating area
                    try {
                      // Get area in acres (convert from m² to acres)
                      const areaInSquareMeters = turf.area(intersection);
                      if (isFinite(areaInSquareMeters) && areaInSquareMeters > 0) {
                        intersectionArea = areaInSquareMeters * 0.000247105;
                      } else {
                        console.log(`Invalid intersection area calculated, using feature area`);
                        intersectionArea = acres;
                      }
                    } catch (areaError) {
                      console.log(`Error calculating intersection area, using feature area:`, areaError);
                      intersectionArea = acres;
                    }
                  } else {
                    console.log(`No valid intersection geometry, using feature area`);
                    intersectionArea = acres;
                  }
                } catch (intersectError) {
                  console.log(`Error calculating intersection, using feature area:`, intersectError);
                  intersectionArea = acres;
                }
              }
              
              // Validate the calculated area
              if (!isFinite(intersectionArea) || intersectionArea < 0) {
                console.log(`Invalid intersection area calculated, skipping feature`);
                return;
              }
              
              // Add to the inventory
              if (!cropInventory[cropName]) {
                cropInventory[cropName] = 0;
              }
              cropInventory[cropName] += intersectionArea;
              bufferTotalAcres += intersectionArea;
              
              console.log(`Added ${intersectionArea.toFixed(2)} acres of ${cropName}`);
            }
          } catch (error) {
            console.error("Error analyzing feature intersection:", error);
            featuresWithErrors++;
          }
        } catch (error) {
          console.error("Error processing feature:", error);
          featuresWithErrors++;
        }
      });
      
      console.log(`Successfully analyzed ${featuresAnalyzed} features, ${featuresWithErrors} had errors`);
      
      // Convert the inventory object to an array for the component
      const inventoryArray = Object.keys(cropInventory).map(cropName => ({
        name: cropName,
        acres: cropInventory[cropName],
        color: cropColorMapping[cropName] || '#808080' // Use default gray if no color found
      }));
      
      console.log("Resource inventory:", inventoryArray);
      console.log("Total acres in buffer:", bufferTotalAcres);
      
      // Update the state to show the inventory
      setInventoryData(inventoryArray);
      setTotalAcres(bufferTotalAcres);
      setShowInventoryPanel(true);
      
    } catch (error) {
      console.error("Error in resource analysis:", error);
      // Set empty inventory on error
      setInventoryData([]);
      setTotalAcres(0);
      setShowInventoryPanel(false);
    }
  }, [cropColorMapping, setInventoryData, setTotalAcres, setShowInventoryPanel, mapLoaded]);

  // Function to create a buffer around a point
  const createBuffer = useCallback((lngLat, radius, unit) => {
    if (!map.current || !mapLoaded) {
      console.error("Cannot create buffer - map not ready");
      return;
    }

    // Don't create buffer if no marker is placed
    if (!currentMarker.current) {
      console.warn('Cannot create buffer - no marker placed');
      return;
    }

    const source = map.current.getSource('siting-buffer-source');
    if (!source) {
      console.warn('siting-buffer-source not ready yet');
      return;
    }

    // Check if the source is properly initialized
    if (typeof source.setData !== 'function') {
      console.warn('siting-buffer-source setData method not available');
      return;
    }

    try {
      const radiusInMeters = convertToMeters(radius, unit);
      
      // Validate radius
      if (!isFinite(radiusInMeters) || radiusInMeters <= 0) {
        console.error("Invalid radius for buffer creation:", radiusInMeters);
        return;
      }
      
      // Validate coordinates
      if (!lngLat || !isFinite(lngLat.lng) || !isFinite(lngLat.lat)) {
        console.error("Invalid coordinates for buffer creation:", lngLat);
        return;
      }
      
      const point = turf.point([lngLat.lng, lngLat.lat]);
      
      // Validate point geometry
      if (!point || !point.geometry || !point.geometry.coordinates) {
        console.error("Failed to create valid point geometry");
        return;
      }
      
      const buffered = turf.buffer(point, radiusInMeters, { units: 'meters' });
      
      // Validate buffer geometry
      if (!buffered || !buffered.geometry || !buffered.geometry.coordinates) {
        console.error("Failed to create valid buffer geometry");
        return;
      }
      
      // Check if buffer has valid coordinates
      if (!Array.isArray(buffered.geometry.coordinates) || buffered.geometry.coordinates.length === 0) {
        console.error("Buffer geometry has no valid coordinates");
        return;
      }
      
      currentBuffer.current = buffered;

      // Wrap in FeatureCollection for consistency
      const featureCollection = {
        type: 'FeatureCollection',
        features: [buffered]
      };

      // Update source data
      source.setData(featureCollection);

      // Ensure layers are visible only if we have a marker
      if (currentMarker.current) {
        map.current.setLayoutProperty('siting-buffer-fill', 'visibility', 'visible');
        map.current.setLayoutProperty('siting-buffer-outline', 'visibility', 'visible');
      } else {
        // If no marker, hide the buffer layers
        map.current.setLayoutProperty('siting-buffer-fill', 'visibility', 'none');
        map.current.setLayoutProperty('siting-buffer-outline', 'visibility', 'none');
      }

      // Run analysis only if we have a marker and valid buffer
      if (currentMarker.current) {
        console.log("Buffer created successfully, running resource analysis...");
        // Add a small delay to ensure the map is fully ready before analysis
        setTimeout(() => {
          analyzeResourcesInBuffer(buffered);
        }, 100);
      }
      
    } catch (error) {
      console.error("Error creating buffer:", error);
      // Hide buffer layers on error
      if (map.current) {
        try {
          map.current.setLayoutProperty('siting-buffer-fill', 'visibility', 'none');
          map.current.setLayoutProperty('siting-buffer-outline', 'visibility', 'none');
        } catch (layoutError) {
          console.warn("Failed to hide buffer layers:", layoutError);
        }
      }
    }
  }, [mapLoaded, convertToMeters, analyzeResourcesInBuffer]);
  
  // Effect to handle cursor and hover marker for siting mode
  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    
    if (sitingMode && !hasPlacedMarker) {
      // Active placement substate: show crosshair and hover marker
      map.current.getCanvas().style.cursor = 'crosshair';
      
      // Create a temporary hover marker element
      const hoverMarkerEl = document.createElement('div');
      hoverMarkerEl.className = 'hover-marker';
      hoverMarkerEl.style.width = '24px';
      hoverMarkerEl.style.height = '36px';
      hoverMarkerEl.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 36\' width=\'24\' height=\'36\'%3E%3Cpath d=\'M12 0C5.37 0 0 5.37 0 12c0 6.63 12 24 12 24s12-17.37 12-24C24 5.37 18.63 0 12 0zm0 16.5c-2.48 0-4.5-2.02-4.5-4.5s2.02-4.5 4.5-4.5 4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5z\' fill=\'%23ff3b30\'/%3E%3Ccircle cx=\'12\' cy=\'12\' r=\'4.5\' fill=\'white\'/%3E%3C/svg%3E")';
      hoverMarkerEl.style.backgroundSize = '24px 36px';
      hoverMarkerEl.style.backgroundRepeat = 'no-repeat';
      hoverMarkerEl.style.backgroundPosition = 'center';
      hoverMarkerEl.style.transform = 'translate(-50%, -100%)';
      hoverMarkerEl.style.pointerEvents = 'none'; // Make sure it doesn't interfere with map events
      hoverMarkerEl.style.filter = 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))';

      const hoverMarker = new mapboxgl.Marker({
        element: hoverMarkerEl,
        anchor: 'bottom',
        draggable: false,
      }).setLngLat([0, 0]).addTo(map.current);
      
      // Update hover marker position as mouse moves
      const onMouseMove = (e) => {
        hoverMarker.setLngLat(e.lngLat);
      };
      
      // Add mousemove listener to update marker position
      map.current.on('mousemove', onMouseMove);
      
      // Shadow effect to enhance visibility
      const shadowStyle = document.createElement('style');
      shadowStyle.textContent = `
        .hover-marker {
          filter: drop-shadow(0 5px 3px rgba(0, 0, 0, 0.4));
          opacity: 0.85;
          transition: transform 0.1s ease-out;
        }
        .hover-marker:hover {
          transform: translate(-50%, -105%) scale(1.1);
        }
      `;
      document.head.appendChild(shadowStyle);
      
      return () => {
        // Only clean up the hover marker and cursor, don't touch the placed marker or buffer
        if (map.current) {
          map.current.off('mousemove', onMouseMove);
          map.current.getCanvas().style.cursor = '';
        }
        hoverMarker.remove();
        if (document.head.contains(shadowStyle)) {
          document.head.removeChild(shadowStyle);
        }
      };
    } else if (sitingMode && hasPlacedMarker) {
      // Review substate: hide crosshair/hover marker, keep siting panel open
      map.current.getCanvas().style.cursor = '';
      return () => {};
    } else {
      // Not in siting mode
      map.current.getCanvas().style.cursor = '';
      return () => {};
    }
  }, [mapLoaded, sitingMode, hasPlacedMarker]);

  // Handle map click for siting analysis
  const handleMapClick = useCallback((e) => {
    if (!sitingMode || hasPlacedMarker) return;

    const { lngLat } = e;
    
    // Validate coordinates
    if (!lngLat || !isFinite(lngLat.lng) || !isFinite(lngLat.lat)) {
      console.error("Invalid coordinates received from map click:", lngLat);
      return;
    }
    
    // Validate coordinate ranges (rough sanity check)
    if (lngLat.lng < -180 || lngLat.lng > 180 || lngLat.lat < -90 || lngLat.lat > 90) {
      console.error("Coordinates out of valid range:", lngLat);
      return;
    }

    // Remove existing marker if any
    if (currentMarker.current) {
      currentMarker.current.remove();
      currentMarker.current = null;
    }

    // Create a new marker (no animation)
    const markerElement = document.createElement('div');
    markerElement.className = 'custom-marker';
    markerElement.style.width = '24px';
    markerElement.style.height = '36px';
    markerElement.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 36\' width=\'24\' height=\'36\'%3E%3Cpath d=\'M12 0C5.37 0 0 5.37 0 12c0 6.63 12 24 12 24s12-17.37 12-24C24 5.37 18.63 0 12 0zm0 16.5c-2.48 0-4.5-2.02-4.5-4.5s2.02-4.5 4.5-4.5 4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5z\' fill=\'%23ff3b30\'/%3E%3Ccircle cx=\'12\' cy=\'12\' r=\'4.5\' fill=\'white\'/%3E%3C/svg%3E")';
    markerElement.style.backgroundSize = '24px 36px';
    markerElement.style.backgroundRepeat = 'no-repeat';
    markerElement.style.backgroundPosition = 'center';
    markerElement.style.filter = 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))';

    try {
      // Add the marker to the map immediately
      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: 'bottom'
      })
        .setLngLat(lngLat)
        .addTo(map.current);

      currentMarker.current = marker;

      // Create/update buffer around the marker
      createBuffer(lngLat, radius, unit);

      // Enter review sub-state: marker placed, keep sitingMode true but stop hover/crosshair via hasPlacedMarker
      setHasPlacedMarker(true);
      
      console.log("Marker placed successfully at:", lngLat);
      
    } catch (error) {
      console.error("Error placing marker:", error);
      // Clean up on error
      if (currentMarker.current) {
        currentMarker.current.remove();
        currentMarker.current = null;
      }
    }
  }, [sitingMode, hasPlacedMarker, radius, unit, createBuffer]);

  // Effect to add and manage map click handler
  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    
    // Clean up previous click handler if any
    if (map.current._sitingClickHandler) {
      map.current.off('click', map.current._sitingClickHandler);
    }
    
    // Define the click handler function
    const clickHandler = (e) => {
      if (sitingMode && !hasPlacedMarker) {
        // Stop event propagation to prevent other handlers from firing
        e.originalEvent.stopPropagation();
        handleMapClick(e);
      }
    };
    
    // Store reference to the handler for cleanup
    map.current._sitingClickHandler = clickHandler;
    
    // Add the click handler
    map.current.on('click', clickHandler);
    
    console.log(`Siting mode is now ${sitingMode ? 'enabled' : 'disabled'}`);
    
    return () => {
      // Remove the click handler on cleanup
      if (map.current && map.current._sitingClickHandler) {
        map.current.off('click', map.current._sitingClickHandler);
      }
    };
  }, [mapLoaded, sitingMode, hasPlacedMarker, handleMapClick]);

  // Function to close siting mode and clean up everything
  const closeSitingMode = useCallback(() => {
    console.log('closeSitingMode function called - starting cleanup...');
    
    // First, reset the UI state
    setSitingMode(false);
    setShowSitingPanel(false);
    setShowInventoryPanel(false);
    
    // Clear the data
    setInventoryData([]);
    setTotalAcres(0);
    
    // Then clean up the map elements
    setTimeout(() => {
      console.log('Executing cleanupSitingElements...');
      cleanupSitingElements();
    }, 50);
    
    console.log('Siting mode closed successfully');
  }, []);

  // Toggle siting analysis mode
  const toggleSitingMode = () => {
    if (sitingMode) {
      // Exit siting completely - clean up marker and buffer
      console.log('Exiting siting mode - cleaning up elements...');
      
      // First, ensure we reset the state
      setSitingMode(false);
      setShowSitingPanel(false);
      
      // Use helper function to clean up all siting elements
      cleanupSitingElements();
      
      console.log('Siting mode exited successfully');
    } else {
      // Enter siting placement substate
      console.log('Entering siting mode...');
      setSitingMode(true);
      setHasPlacedMarker(false);
      setShowSitingPanel(true);
      console.log('Siting mode entered successfully');
    }
  };
  
  // Function to remove current site and reactivate siting mode
  const removeSiteAndReactivate = () => {
    console.log('Removing current site and reactivating siting mode...');
    
    // Use helper function to clean up all siting elements
    cleanupSitingElements();
    
    // Enable siting mode (placement substate)
    setSitingMode(true);
  };
  
  // Helper function to clean up all siting-related elements
  const cleanupSitingElements = () => {
    console.log('cleanupSitingElements function called...');
    
    try {
      // Clean up existing marker
      if (currentMarker.current) {
        console.log('Removing current marker...');
        try {
          currentMarker.current.remove();
        } catch (markerError) {
          console.warn('Error removing marker:', markerError);
        }
        currentMarker.current = null;
      } else {
        console.log('No marker to clean up');
      }
      
      // Clean up buffer layers and source
      if (map.current) {
        try {
          const source = map.current.getSource('siting-buffer-source');
          if (source && source.setData) {
            try {
              console.log('Clearing siting-buffer-source data...');
              source.setData({ type: 'FeatureCollection', features: [] });
            } catch (e) {
              console.warn('Failed to clear siting-buffer-source data', e);
            }
          } else {
            console.log('No siting-buffer-source to clean up');
          }
          
          // Hide buffer layers
          if (map.current.getLayer('siting-buffer-fill')) {
            console.log('Hiding siting-buffer-fill layer...');
            try {
              map.current.setLayoutProperty('siting-buffer-fill', 'visibility', 'none');
            } catch (e) {
              console.warn('Failed to hide siting-buffer-fill layer:', e);
            }
          } else {
            console.log('No siting-buffer-fill layer to hide');
          }
          if (map.current.getLayer('siting-buffer-outline')) {
            console.log('Hiding siting-buffer-outline layer...');
            try {
              map.current.setLayoutProperty('siting-buffer-outline', 'visibility', 'none');
            } catch (e) {
              console.warn('Failed to hide siting-buffer-outline layer:', e);
            }
          } else {
            console.log('No siting-buffer-outline layer to hide');
          }

          // Also remove any legacy buffer layers/sources if they exist
          if (map.current.getLayer('buffer-fill')) {
            console.log('Removing legacy buffer-fill layer...');
            try {
              map.current.removeLayer('buffer-fill');
            } catch (e) {
              console.warn('Failed to remove legacy buffer-fill layer:', e);
            }
          }
          if (map.current.getLayer('buffer-outline')) {
            console.log('Removing legacy buffer-outline layer...');
            try {
              map.current.removeLayer('buffer-outline');
            } catch (e) {
              console.warn('Failed to remove legacy buffer-outline layer:', e);
            }
          }
          if (map.current.getSource('buffer')) {
            try { 
              console.log('Removing legacy buffer source...');
              map.current.removeSource('buffer'); 
            } catch (e) {
              console.warn('Failed to remove legacy buffer source:', e);
            }
          }
          
          // Additional cleanup: ensure all buffer-related layers are hidden
          const allLayers = map.current.getStyle().layers || [];
          let bufferLayersFound = 0;
          allLayers.forEach(layer => {
            if (layer.id && (layer.id.includes('buffer') || layer.id.includes('siting'))) {
              if (map.current.getLayer(layer.id)) {
                try {
                  console.log(`Hiding buffer-related layer: ${layer.id}`);
                  map.current.setLayoutProperty(layer.id, 'visibility', 'none');
                  bufferLayersFound++;
                } catch (e) {
                  console.warn(`Failed to hide layer ${layer.id}:`, e);
                }
              }
            }
          });
          console.log(`Found and hid ${bufferLayersFound} buffer-related layers`);
        } catch (mapError) {
          console.warn('Error during map cleanup:', mapError);
        }
      } else {
        console.log('Map not available for cleanup');
      }
      
      // Clear buffer reference
      if (currentBuffer.current) {
        console.log('Clearing buffer reference');
        currentBuffer.current = null;
      } else {
        console.log('No buffer reference to clear');
      }
      
      // Reset all siting-related state
      setHasPlacedMarker(false);
      setShowInventoryPanel(false);
      setInventoryData([]);
      setTotalAcres(0);
      
      console.log('Siting elements cleanup completed');
      
      // Validate buffer state after cleanup
      setTimeout(() => {
        validateBufferState();
      }, 100);
      
    } catch (error) {
      console.error('Error during cleanupSitingElements:', error);
      // Force reset state even if cleanup fails
      setHasPlacedMarker(false);
      setShowInventoryPanel(false);
      setInventoryData([]);
      setTotalAcres(0);
    }
  };

  // Helper function to validate buffer state consistency
  const validateBufferState = () => {
    if (!map.current) return;
    
    const hasMarker = !!currentMarker.current;
    const hasBufferData = currentBuffer.current && currentBuffer.current.features && currentBuffer.current.features.length > 0;
    
    // If we have no marker but have buffer data, clean up the buffer
    if (!hasMarker && hasBufferData) {
      console.log('Buffer state inconsistency detected - cleaning up buffer without marker');
      cleanupSitingElements();
    }
    
    // If we have a marker but no buffer data, and we're in siting mode, recreate the buffer
    if (hasMarker && !hasBufferData && sitingMode && hasPlacedMarker) {
      console.log('Buffer state inconsistency detected - recreating buffer for existing marker');
      const lngLat = currentMarker.current.getLngLat();
      createBuffer(lngLat, radius, unit);
    }
  };



  // Effect for initializing the map
  useEffect(() => {
    // Prevent map re-initialization if already initialized or token is missing/placeholder
    if (map.current || !MAPBOX_ACCESS_TOKEN || MAPBOX_ACCESS_TOKEN === 'YOUR_MAPBOX_ACCESS_TOKEN') return;

    console.log("Initializing map...");
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current, // Container element ID or HTML element
        style: 'mapbox://styles/mapbox/streets-v11', // Map style URL
        center: [-121.0, 37.5], // Initial center coordinates [lng, lat]
        zoom: 7, // Initial zoom level
        accessToken: MAPBOX_ACCESS_TOKEN === 'YOUR_MAPBOX_ACCESS_TOKEN' ? undefined : MAPBOX_ACCESS_TOKEN // Pass token only if valid
      });

      map.current.on('load', () => {
        console.log("Map loaded successfully");
        setMapLoaded(true); // Set map loaded state to true

        // Add new vector source for Feedstock data
        map.current.addSource('feedstock-vector-source', {
          type: 'vector',
          url: `mapbox://${process.env.NEXT_PUBLIC_MAPBOX_FEEDSTOCK_TILESET_ID}`
        });
        console.log("Added feedstock vector source");

        // Add new vector layer for Feedstock data
        map.current.addLayer({
          id: 'feedstock-vector-layer', // New unique layer ID
          type: 'fill', // Using 'fill' as per instructions, adjust if needed
          source: 'feedstock-vector-source', // Reference the new vector source
          'source-layer': 'cropland_land_iq_2023', // Corrected layer name within the tileset
          // Initial filter: Only exclude 'U' code. Crop filtering is handled by useEffect.
          filter: ['!=', ['get', 'main_crop_code'], 'U'],
          paint: {
            'fill-color': [
                'match',
                ['get', 'main_crop_name'], // Style by main_crop_name
                // --- All Unique Crop Names from DB ---
                "Alfalfa & Alfalfa Mixtures", "#90EE90", // LightGreen
                "Almonds", "#8B4513", // SaddleBrown
                "Apples", "#FF0000", // Red
                "Apricots", "#FFA500", // Orange
                "Avocados", "#556B2F", // DarkOliveGreen
                "Beans (Dry)", "#F5DEB3", // Wheat (color)
                "Bush Berries", "#BA55D3", // MediumOrchid
                "Carrots", "#FF8C00", // DarkOrange
                "Cherries", "#DC143C", // Crimson
                "Citrus and Subtropical", "#FFD700", // Gold (Updated Key)
                "Cole Crops", "#2E8B57", // SeaGreen
                "Corn, Sorghum and Sudan", "#DAA520", // GoldenRod (Updated Key)
                "Cotton", "#FFFAF0", // FloralWhite
                "Dates", "#A0522D", // Sienna
                "Eucalyptus", "#778899", // LightSlateGray
                "Flowers, Nursery and Christmas Tree Farms", "#FF69B4", // HotPink
                "Grapes", "#800080", // Purple
                "Greenhouse", "#AFEEEE", // PaleTurquoise
                "Idle – Long Term", "#D3D3D3", // LightGray
                "Idle – Short Term", "#A9A9A9", // DarkGray
                "Induced high water table native pasture", "#ADD8E6", // LightBlue
                "Kiwis", "#9ACD32", // YellowGreen (Updated Key)
                "Lettuce/Leafy Greens", "#32CD32", // LimeGreen
                "Melons, Squash and Cucumbers", "#FFDAB9", // PeachPuff
                "Miscellaneous Deciduous", "#BDB76B", // DarkKhaki
                "Miscellaneous Field Crops", "#DEB887", // BurlyWood
                "Miscellaneous Grain and Hay", "#F5F5DC", // Beige
                "Miscellaneous Grasses", "#98FB98", // PaleGreen
                "Miscellaneous Subtropical Fruits", "#FF7F50", // Coral
                "Miscellaneous Truck Crops", "#66CDAA", // MediumAquaMarine
                "Mixed Pasture", "#006400", // DarkGreen
                "Native Pasture", "#228B22", // ForestGreen
                "Olives", "#808000", // Olive
                "Onions and Garlic", "#FFF8DC", // Cornsilk
                "Peaches/Nectarines", "#FFC0CB", // Pink
                "Pears", "#ADFF2F", // GreenYellow (Changed from LightGreen for distinctness)
                "Pecans", "#D2691E", // Chocolate
                "Peppers", "#B22222", // Firebrick
                "Pistachios", "#93C572", // Pistachio
                "Plums", "#DDA0DD", // Plum
                "Pomegranates", "#E34234", // Vermilion
                "Potatoes", "#CD853F", // Peru
                "Prunes", "#702963", // Byzantium
                "Rice", "#FFFFE0", // LightYellow
                "Safflower", "#FFEC8B", // LightGoldenrod
                "Strawberries", "#FF1493", // DeepPink
                "Sugar beets", "#D8BFD8", // Thistle
                "Sunflowers", "#FFDB58", // Mustard Yellow
                "Sweet Potatoes", "#D2B48C", // Tan
                "Tomatoes", "#FF6347", // Tomato
                "Turf Farms", "#00FF7F", // SpringGreen
                "Unclassified Fallow", "#696969", // DimGray
                "Walnuts", "#A52A2A", // Brown
                "Wheat", "#F4A460", // SandyBrown
                "Wild Rice", "#EEE8AA", // PaleGoldenrod
                "Young Perennials", "#C19A6B", // Fallow
                // --- Default ---
                "#808080" // Default Gray for unmatched crops (including None)
            ],
            'fill-opacity': 0.6
          }
        });

        // Persistent siting buffer source and layers
        if (!map.current.getSource('siting-buffer-source')) {
          map.current.addSource('siting-buffer-source', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] }
          });

          map.current.addLayer({
            id: 'siting-buffer-fill',
            type: 'fill',
            source: 'siting-buffer-source',
            paint: {
              'fill-color': '#FFFF00',
              'fill-opacity': 0.2
            },
            layout: { visibility: 'none' }
          });

          map.current.addLayer({
            id: 'siting-buffer-outline',
            type: 'line',
            source: 'siting-buffer-source',
            paint: {
              'line-color': '#FFFF00',
              'line-width': 2,
              'line-opacity': 0.8
            },
            layout: { visibility: 'none' }
          });
        }

        // Add rail lines infrastructure layer
        const railLinesTilesetUrl = 'mapbox://tylerhuntington222.b0rylacz';
        console.log("Adding rail lines tileset with URL:", railLinesTilesetUrl);
        
        map.current.addSource('rail-lines-source', {
          type: 'vector',
          url: railLinesTilesetUrl
        });
        console.log("Added rail lines vector source");

        // Add rail lines layer with correct source layer
        try {
          map.current.addLayer({
            id: 'rail-lines-layer',
            type: 'line',
            source: 'rail-lines-source',
            'source-layer': 'us_rail_lines_ftot-80b406',
            paint: {
              'line-color': '#FF4500', // Orange-red color for rail lines
              'line-width': 2,
              'line-opacity': 0.8
            },
            layout: {
              'visibility': layerVisibility?.railLines ? 'visible' : 'none'
            }
          });
          console.log("Added rail lines layer with correct source layer 'us_rail_lines_ftot-80b406'");
        } catch (error) {
          console.error("Failed to add rail lines layer:", error);
        }

        // Add freight terminals transportation layer
        const freightTerminalsTilesetUrl = 'mapbox://tylerhuntington222.6m4h969q';
        console.log("Adding freight terminals tileset with URL:", freightTerminalsTilesetUrl);
        
        map.current.addSource('freight-terminals-source', {
          type: 'vector',
          url: freightTerminalsTilesetUrl
        });
        console.log("Added freight terminals vector source");

        // Add freight terminals layer with correct source layer
        try {
          map.current.addLayer({
            id: 'freight-terminals-layer',
            type: 'circle',
            source: 'freight-terminals-source',
            'source-layer': 'us_freight_terminals-d7i106',
            paint: {
              'circle-color': '#4169E1', // Royal blue color for freight terminals
              'circle-radius': 6,
              'circle-opacity': 0.8,
              'circle-stroke-color': '#FFFFFF',
              'circle-stroke-width': 1
            },
            layout: {
              'visibility': layerVisibility?.freightTerminals ? 'visible' : 'none'
            }
          });
          console.log("Added freight terminals layer with correct source layer 'us_freight_terminals-d7i106'");
        } catch (error) {
          console.error("Failed to add freight terminals layer:", error);
        }

        // Add freight routes transportation layer
        const freightRoutesTilesetUrl = 'mapbox://tylerhuntington222.5fm8q5sj';
        console.log("Adding freight routes tileset with URL:", freightRoutesTilesetUrl);
        
        map.current.addSource('freight-routes-source', {
          type: 'vector',
          url: freightRoutesTilesetUrl
        });
        console.log("Added freight routes vector source");

        // Add freight routes layer with correct source layer
        try {
          map.current.addLayer({
            id: 'freight-routes-layer',
            type: 'line',
            source: 'freight-routes-source',
            'source-layer': 'us_freight_routes',
            paint: {
              'line-color': '#9932CC', // Dark orchid color for freight routes
              'line-width': 2,
              'line-opacity': 0.8
            },
            layout: {
              'visibility': layerVisibility?.freightRoutes ? 'visible' : 'none'
            }
          });
          console.log("Added freight routes layer with correct source layer 'us_freight_routes'");
        } catch (error) {
          console.error("Failed to add freight routes layer:", error);
        }

        // Add anaerobic digester infrastructure layer
        const anaerobicDigesterTilesetUrl = 'mapbox://tylerhuntington222.8lsxssgz';
        console.log("Adding anaerobic digester tileset with URL:", anaerobicDigesterTilesetUrl);
        
        map.current.addSource('anaerobic-digester-source', {
          type: 'vector',
          url: anaerobicDigesterTilesetUrl
        });
        console.log("Added anaerobic digester vector source");

        // Add anaerobic digester layer with correct source layer
        try {
          map.current.addLayer({
            id: 'anaerobic-digester-layer',
            type: 'circle',
            source: 'anaerobic-digester-source',
            'source-layer': 'agstar_ad_pts-12cpd6',
            paint: {
              'circle-color': '#8B4513', // Saddle brown color for anaerobic digesters
              'circle-radius': 6,
              'circle-opacity': 0.8,
              'circle-stroke-color': '#FFFFFF',
              'circle-stroke-width': 1
            },
            layout: {
              'visibility': layerVisibility?.anaerobicDigester ? 'visible' : 'none'
            }
          });
          console.log("Added anaerobic digester layer with correct source layer 'agstar_ad_pts-12cpd6'");
        } catch (error) {
          console.error("Failed to add anaerobic digester layer:", error);
        }

        // Add biodiesel plants infrastructure layer
        const biodieselPlantsTilesetUrl = 'mapbox://tylerhuntington222.3eyv4hdj';
        console.log("Adding biodiesel plants tileset with URL:", biodieselPlantsTilesetUrl);
        
        map.current.addSource('biodiesel-plants-source', {
          type: 'vector',
          url: biodieselPlantsTilesetUrl
        });
        console.log("Added biodiesel plants vector source");

        // Add biodiesel plants layer with correct source layer
        try {
          map.current.addLayer({
            id: 'biodiesel-plants-layer',
            type: 'circle',
            source: 'biodiesel-plants-source',
            'source-layer': 'biodiesel_plants-69v9v0',
            paint: {
              'circle-color': '#228B22', // Forest green color for biodiesel plants
              'circle-radius': 6,
              'circle-opacity': 0.8,
              'circle-stroke-color': '#FFFFFF',
              'circle-stroke-width': 1
            },
            layout: {
              'visibility': layerVisibility?.biodieselPlants ? 'visible' : 'none'
            }
          });
          console.log("Added biodiesel plants layer with correct source layer 'biodiesel_plants-69v9v0'");
        } catch (error) {
          console.error("Failed to add biodiesel plants layer:", error);
        }

        // --- Add Click Listener for Feedstock Layer (Display Properties) ---
        map.current.on('click', 'feedstock-vector-layer', (e) => {
          // Don't show popup when in siting mode
          if (sitingMode) return;
          
          // Ensure features exist and prevent popups for clicks not directly on a feature
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            const coordinates = e.lngLat;
            const properties = feature.properties;

            // --- Format Properties for Display ---

            // Helper function to convert snake_case to Title Case
            const toTitleCase = (str) => {
              return str.replace(/_/g, ' ').replace(
                /\w\S*/g,
                (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
              );
            };

            // Define keys to *include* in the popup and their display order
            const includedKeys = ['main_crop_name', 'acres', 'county', 'region', 'hydro_region']; // Reordered

            let contentLines = '';
            // Iterate through the *included* keys to ensure order and presence
            for (const key of includedKeys) {
              if (properties.hasOwnProperty(key) && properties[key] !== null && properties[key] !== undefined && properties[key] !== '****') {
                // Rename label specifically for main_crop_name
                const label = (key === 'main_crop_name') ? 'Crop' : toTitleCase(key);
                let value = properties[key];

                // Format specific values
                if (key === 'acres' && typeof value === 'number') {
                  value = value.toFixed(2); // Round acres to 2 decimal places
                }
                // Add more formatting rules here if needed

                // Format as "Label: Value" on a single line, left-justified
                contentLines += `<div style="margin-bottom: 3px; text-align: left;"><strong style="font-weight: bold;">${label}:</strong> ${value}</div>`;
              }
            }

            // Increase right padding for close button spacing, remove table
            const popupHTML = `
              <div style="max-height: 250px; overflow-y: auto; padding: 5px 15px 5px 5px; font-size: 0.9em;">
                <h4 style="font-size: 1.1em; font-weight: bold; margin: 0 0 8px 0; padding: 0; text-align: left;">Crop Residues Details</h4>
                ${contentLines}
              </div>
            `;

            // --- Create and Show Popup ---
            // Close any existing popup first
            if (currentPopup.current) {
              currentPopup.current.remove();
            }
            
            // Create new popup and store reference
            currentPopup.current = new mapboxgl.Popup({ closeButton: true, closeOnClick: true, maxWidth: '300px' }) // Added maxWidth
              .setLngLat(coordinates)
              .setHTML(popupHTML)
              .addTo(map.current);

            // Add event listener to clear popup reference when it's closed
            currentPopup.current.on('close', () => {
              currentPopup.current = null;
              console.log('Popup closed manually');
            });

            console.log('Displayed formatted popup for feature:', properties);
          }
        });

      }); // Closing bracket for map.current.on('load', ...)

      // Handle errors during map initialization
      map.current.on('error', (error) => {
        console.error('Mapbox error:', error);
      });
      
    } catch (error) {
      console.error("Error initializing map:", error);
    }

    // Clean up on component unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null; // Ensure map instance is cleared
        setMapLoaded(false); // Reset map loaded state
      }
      // Clean up popup reference
      if (currentPopup.current) {
        currentPopup.current.remove();
        currentPopup.current = null;
      }
      // Clean up marker and buffer
      if (currentMarker.current) {
        currentMarker.current.remove();
        currentMarker.current = null;
      }
      // Clean up buffer reference
      currentBuffer.current = null;
    };
  }, [layerVisibility, sitingMode]); // Add layerVisibility and sitingMode as dependencies

  // Effect to update the buffer when radius or unit changes
  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    
    // Only update if we have a placed marker and it exists
    if (hasPlacedMarker && currentMarker.current && currentMarker.current.getLngLat) {
      console.log(`Radius changed to ${radius} ${unit}, updating buffer...`);
      const lngLat = currentMarker.current.getLngLat();
      
      // Add a small delay to ensure the UI updates first
      setTimeout(() => {
        createBuffer(lngLat, radius, unit);
      }, 50);
    }
  }, [radius, unit, hasPlacedMarker, mapLoaded, createBuffer]);

  // Effect for controlling feedstock layer visibility
  useEffect(() => {
    if (!mapLoaded || !map.current || !map.current.getLayer('feedstock-vector-layer')) { // Use new layer ID
      // console.log("Visibility effect: Map not ready or layer doesn't exist yet.");
      return; // Ensure map is loaded and layer exists
    }

    const isFeedstockVisible = layerVisibility?.feedstock || false;
    const visibility = isFeedstockVisible ? 'visible' : 'none';
    console.log(`Setting feedstock layer visibility to: ${visibility}`);
    map.current.setLayoutProperty('feedstock-vector-layer', 'visibility', visibility); // Use new layer ID

    // Close popup when feedstock layer is hidden
    if (!isFeedstockVisible && currentPopup.current) {
      currentPopup.current.remove();
      currentPopup.current = null;
      console.log('Closed popup because feedstock layer was hidden');
    }

  }, [mapLoaded, layerVisibility?.feedstock]); // Depend on mapLoaded and the specific layerVisibility property

  // Effect for updating the crop filter based on visibleCrops prop
  useEffect(() => {
    if (!mapLoaded || !map.current || !map.current.getLayer('feedstock-vector-layer')) {
      // console.log("Crop filter effect: Map not ready or layer doesn't exist yet.");
      return; // Ensure map is loaded and layer exists
    }

    // Construct the filter based on visibleCrops
    // Always include the filter for main_crop_code != 'U'
    const cropFilter = (visibleCrops && visibleCrops.length > 0)
      // Corrected: Use the literal property name 'main_crop_name' for the 'in' operator
      ? ['in', 'main_crop_name', ...visibleCrops]
      // Corrected: Use the literal property name for the '==' operator fallback
      : ['==', 'main_crop_name', '']; // Effectively hide all if no crops selected

    const combinedFilter = [
        'all',
        // Corrected: Use the literal property name 'main_crop_code' for the '!=' operator
        ['!=', 'main_crop_code', 'U'],
        cropFilter
    ];

    console.log("Setting crop filter:", JSON.stringify(combinedFilter));
    map.current.setFilter('feedstock-vector-layer', combinedFilter);

    // Close popup when no crops are visible (all crops filtered out)
    if (!visibleCrops || visibleCrops.length === 0) {
      if (currentPopup.current) {
        currentPopup.current.remove();
        currentPopup.current = null;
        console.log('Closed popup because no crops are visible');
      }
    }

}, [mapLoaded, visibleCrops]); // Depend on mapLoaded and visibleCrops

// Effect for updating the cropland layer opacity
useEffect(() => {
  if (!mapLoaded || !map.current || !map.current.getLayer('feedstock-vector-layer')) {
    // console.log("Opacity effect: Map not ready or layer doesn't exist yet.");
    return; // Ensure map is loaded and layer exists
  }

  // Check if croplandOpacity is a valid number before setting
  if (typeof croplandOpacity === 'number' && croplandOpacity >= 0 && croplandOpacity <= 1) {
    console.log(`Setting feedstock layer opacity to: ${croplandOpacity}`);
    map.current.setPaintProperty('feedstock-vector-layer', 'fill-opacity', croplandOpacity);
  } else {
    console.warn(`Invalid croplandOpacity value received: ${croplandOpacity}. Opacity not set.`);
    // Optionally set a default opacity here if the value is invalid
    // map.current.setPaintProperty('feedstock-vector-layer', 'fill-opacity', 0.6);
  }

}, [mapLoaded, croplandOpacity]); // Depend on mapLoaded and croplandOpacity

// Effect for controlling rail lines layer visibility
useEffect(() => {
  if (!mapLoaded || !map.current || !map.current.getLayer('rail-lines-layer')) {
    return; // Ensure map is loaded and layer exists
  }

  const isRailLinesVisible = layerVisibility?.railLines || false;
  const visibility = isRailLinesVisible ? 'visible' : 'none';
  console.log(`Setting rail lines layer visibility to: ${visibility}`);
  map.current.setLayoutProperty('rail-lines-layer', 'visibility', visibility);

}, [mapLoaded, layerVisibility?.railLines]); // Depend on mapLoaded and the specific layerVisibility property

// Effect for controlling freight terminals layer visibility
useEffect(() => {
  if (!mapLoaded || !map.current || !map.current.getLayer('freight-terminals-layer')) {
    return; // Ensure map is loaded and layer exists
  }

  const isFreightTerminalsVisible = layerVisibility?.freightTerminals || false;
  const visibility = isFreightTerminalsVisible ? 'visible' : 'none';
  console.log(`Setting freight terminals layer visibility to: ${visibility}`);
  map.current.setLayoutProperty('freight-terminals-layer', 'visibility', visibility);

}, [mapLoaded, layerVisibility?.freightTerminals]); // Depend on mapLoaded and the specific layerVisibility property

// Effect for controlling freight routes layer visibility
useEffect(() => {
  if (!mapLoaded || !map.current || !map.current.getLayer('freight-routes-layer')) {
    return; // Ensure map is loaded and layer exists
  }

  const isFreightRoutesVisible = layerVisibility?.freightRoutes || false;
  const visibility = isFreightRoutesVisible ? 'visible' : 'none';
  console.log(`Setting freight routes layer visibility to: ${visibility}`);
  map.current.setLayoutProperty('freight-routes-layer', 'visibility', visibility);

}, [mapLoaded, layerVisibility?.freightRoutes]); // Depend on mapLoaded and the specific layerVisibility property

// Effect for controlling anaerobic digester layer visibility
useEffect(() => {
  if (!mapLoaded || !map.current || !map.current.getLayer('anaerobic-digester-layer')) {
    return; // Ensure map is loaded and layer exists
  }

  const isAnaerobicDigesterVisible = layerVisibility?.anaerobicDigester || false;
  const visibility = isAnaerobicDigesterVisible ? 'visible' : 'none';
  console.log(`Setting anaerobic digester layer visibility to: ${visibility}`);
  map.current.setLayoutProperty('anaerobic-digester-layer', 'visibility', visibility);

}, [mapLoaded, layerVisibility?.anaerobicDigester, layerVisibility]); // Added layerVisibility to dependencies

  // Effect for controlling biodiesel plants layer visibility
  useEffect(() => {
    if (!mapLoaded || !map.current || !map.current.getLayer('biodiesel-plants-layer')) {
      return; // Ensure map is loaded and layer exists
    }

    const isBiodieselPlantsVisible = layerVisibility?.biodieselPlants || false;
    const visibility = isBiodieselPlantsVisible ? 'visible' : 'none';
    console.log(`Setting biodiesel plants layer visibility to: ${visibility}`);
    map.current.setLayoutProperty('biodiesel-plants-layer', 'visibility', visibility);

  }, [mapLoaded, layerVisibility?.biodieselPlants]); // Depend on mapLoaded and the specific layerVisibility property

  // Effect for periodic buffer state validation
  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    
    // Validate buffer state every 2 seconds to catch inconsistencies
    const validationInterval = setInterval(() => {
      validateBufferState();
    }, 2000);
    
    return () => {
      clearInterval(validationInterval);
    };
  }, [mapLoaded, sitingMode, hasPlacedMarker, radius, unit]);

  // Effect to clean up buffers when siting mode is disabled
  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    
    // If siting mode is disabled, ensure all buffers are cleaned up
    if (!sitingMode) {
      console.log('Siting mode disabled - ensuring buffers are cleaned up...');
      cleanupSitingElements();
    }
  }, [mapLoaded, sitingMode]);

// Color mapping definition removed - will be handled in LayerControls


  return (
    // Ensure the container has dimensions and relative positioning for the legend
    <div
      ref={mapContainer}
      className="map-container"
      style={{ width: '100%', height: '100%', position: 'relative' }} // Added position: relative
    >
      {/* Show either the button or the panel */}
      {!showSitingPanel ? (
        <SitingButton 
          onClick={toggleSitingMode} 
          isActive={sitingMode} 
        />
      ) : (
        <SitingAnalysis
          onClose={closeSitingMode}
          onRadiusChange={setRadius}
          onUnitChange={setUnit}
          onRemoveSite={removeSiteAndReactivate}
          radius={radius}
          unit={unit}
          isActive={sitingMode}
          hasPlacedMarker={hasPlacedMarker}
        />
      )}
      
      {/* Resource Inventory Panel */}
      <SitingInventory 
        isVisible={showInventoryPanel}
        inventory={inventoryData}
        totalAcres={totalAcres}
        bufferRadius={radius}
        bufferUnit={unit}
      />
    </div>
  );
};

export default Map;