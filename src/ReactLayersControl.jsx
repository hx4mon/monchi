import React, { useState, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import './ReactLayersControl.css';
import layersIcon from './img/map-icon.png';

const ReactLayersControl = ({ baseLayers, position }) => {
  const map = useMap();
  const [isOpen, setIsOpen] = useState(false);
  const [activeLayer, setActiveLayer] = useState(Object.keys(baseLayers)[0]);

  useEffect(() => {
    // Set the default layer on the map
    const defaultLayer = baseLayers[activeLayer];
    if (defaultLayer && !map.hasLayer(defaultLayer)) {
      map.addLayer(defaultLayer);
    }
  }, [map, baseLayers, activeLayer]);

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleLayerChange = (layerName) => {
    const currentLayer = baseLayers[activeLayer];
    if (map.hasLayer(currentLayer)) {
      map.removeLayer(currentLayer);
    }

    const newLayer = baseLayers[layerName];
    map.addLayer(newLayer);
    setActiveLayer(layerName);
    setIsOpen(false); // Close the control after selection
  };

  const getPositionClass = () => {
    switch (position) {
      case 'topright':
        return 'leaflet-top leaflet-right';
      case 'topleft':
        return 'leaflet-top leaflet-left';
      case 'bottomright':
        return 'leaflet-bottom leaflet-right';
      case 'bottomleft':
        return 'leaflet-bottom leaflet-left';
      default:
        return 'leaflet-top leaflet-right';
    }
  };

  return (
    <div className={getPositionClass()}>
      <div className="leaflet-control leaflet-bar">
        <div className="react-layers-control-container">
          <button onClick={handleToggle} className="react-layers-control-toggle">
            <img src={layersIcon} alt="Layers" />
          </button>
          {isOpen && (
            <div className="react-layers-control-menu">
              {Object.keys(baseLayers).map(layerName => (
                <div key={layerName} className="react-layers-control-layer">
                  <input
                    type="radio"
                    name="react-leaflet-layers"
                    id={layerName}
                    checked={activeLayer === layerName}
                    onChange={() => handleLayerChange(layerName)}
                  />
                  <label htmlFor={layerName}>{layerName}</label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReactLayersControl;
