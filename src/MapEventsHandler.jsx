import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet'; // Import Leaflet

const MapEventsHandler = ({ onMapInstanceReady, onMapClick }) => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      onMapInstanceReady(map);

      // Add custom attribution control
      const customAttribution = L.control.attribution({ position: 'bottomright', prefix: false });
      customAttribution.addAttribution('&copy; MIS-SOLEDAD contributors');
      customAttribution.addTo(map);

      // Add click listener to close info sidebar when clicking on map
      const handleMapClick = (e) => {
        L.DomEvent.stop(e); // Explicitly stop event propagation
        if (onMapClick) {
          onMapClick();
        }
      };
      map.on('click', handleMapClick);

      return () => {
        map.removeControl(customAttribution);
        map.off('click', handleMapClick);
      };
    }
  }, [map, onMapInstanceReady, onMapClick]);

  return null;
};

export default MapEventsHandler;
