'use client';

import React, { useState } from 'react';

const MapLegend = ({ colorMapping }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  if (!colorMapping || Object.keys(colorMapping).length === 0) {
    return null; // Don't render if no mapping provided
  }

  // Sort crop names alphabetically for consistent legend order
  const sortedCropNames = Object.keys(colorMapping).sort();

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      right: '10px',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      padding: '10px',
      borderRadius: '5px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      maxHeight: isCollapsed ? '40px' : '300px', // Control height for collapse/expand
      overflowY: 'auto',
      transition: 'max-height 0.3s ease-in-out',
      zIndex: 10 // Ensure legend is above map layers
    }}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          background: 'none',
          border: 'none',
          padding: '0',
          margin: '0 0 5px 0',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'block',
          width: '100%',
          textAlign: 'left'
        }}
      >
        Crop Legend {isCollapsed ? '▼' : '▲'}
      </button>
      {!isCollapsed && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {sortedCropNames.map((cropName) => (
            <li key={cropName} style={{ marginBottom: '4px', display: 'flex', alignItems: 'center' }}>
              <span style={{
                display: 'inline-block',
                width: '15px',
                height: '15px',
                backgroundColor: colorMapping[cropName],
                marginRight: '8px',
                border: '1px solid #ccc' // Add border for very light colors
              }}></span>
              <span style={{ fontSize: '0.8em' }}>{cropName}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MapLegend;