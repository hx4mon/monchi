import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, Marker, Popup, useMap } from 'react-leaflet';
import { useLocation } from 'react-router-dom'; // Import useLocation
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import MyCustomMarkerContent from './MyCustomMarkerContent';
import MapEventsHandler from './MapEventsHandler';
import Fuse from 'fuse.js'; // Import Fuse.js
import ReactLayersControl from './ReactLayersControl';
import neDistrictData from '../ne_district.json'; // Import the district data

// District color mapping
const districtColors = {
    "District1": "crimson",
    "District2": "green",
    "District3": "gold",
    "District4": "navy"
};

// Helper function to find district for a town (case-insensitive)
const getDistrictForTown = (town) => {
    if (!town) return null;
    const upperCaseTown = town.toUpperCase();
    for (const district in neDistrictData.NuevaEcijaDistricts) {
        if (neDistrictData.NuevaEcijaDistricts[district].includes(upperCaseTown)) {
            return district;
        }
    }
    return null; // Or a default district
};


// Function to create a custom divIcon from a React component
const createCustomDivIcon = (churchData) => {
  const iconHtml = ReactDOMServer.renderToString(
    <MyCustomMarkerContent
      churchName={churchData.church_name}
      churchStatus={churchData.church_status}
      isSelected={churchData.isSelected}
      districtColor={churchData.districtColor} // Pass color
    />
  );

  return L.divIcon({
    className: 'custom-div-icon', // Add a class for custom CSS if needed
    html: iconHtml,
    iconSize: [24, 29], // Size of the div (width, height) to encompass the visual marker
    iconAnchor: [12, 29], // Point of the icon which will correspond to marker's location (bottom center)
    popupAnchor: [0, -29] // Point from which the popup should open relative to the iconAnchor
  });
};

const Map = ({ onChurchSelect, onMapClick, freeTextSearchQuery, selectedTown, selectedBarangay, selectedChurch, selectedMarkerId, navSelectedMarkerId, isLoggedIn }) => {
  const location = useLocation(); // Get location object
  const { churchLocation } = location.state || {}; // Destructure state
  const mapRef = useRef(null); // Ref to store the Leaflet map instance
  const [markers, setMarkers] = useState([]);
  const [showMarkers, setShowMarkers] = useState(false); // New state to control marker visibility
  const [filteredMarkers, setFilteredMarkers] = useState([]);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(freeTextSearchQuery); // New state for debounced search query
  const [selectedDistrict, setSelectedDistrict] = useState(null); // State for district filter

  // Fuse.js options for fuzzy searching
  const fuseOptions = {
    keys: [
      'church_name',
      'church_street_purok',
      'church_barangay',
      'church_town',
    ],
    threshold: 0.1, // Adjust this value (0.0 = exact match, 1.0 = any match)
    includeScore: true, // Include score in results
  };

  const fuse = useRef(new Fuse([], fuseOptions)); // Initialize Fuse with empty data

  useEffect(() => {
    if (churchLocation && mapRef.current && markers.length > 0) {
      mapRef.current.setView([churchLocation.lat, churchLocation.lng], 13); // Center map and zoom
      // Find the church in the markers state and select it
      const churchToSelect = markers.find(marker => marker.id === navSelectedMarkerId);
      if (churchToSelect) {
        onChurchSelect(churchToSelect);
      }
    }
  }, [churchLocation, navSelectedMarkerId, markers, onChurchSelect, mapRef]);

  useEffect(() => {
    // Fetch all churches from your Flask API on component mount
    const fetchChurches = async () => {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Include the token
      };
      try {
        const response = await fetch('/api/churches', { headers }); // Assuming Express runs on port 5000
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Ensure churches have an ID and parse lat/lon
        const churchesWithParsedCoords = data.map((church) => ({
          ...church,
          id: church.id,
          latitude: parseFloat(church.latitude).toFixed(6), // Round to 6 decimal places
          longitude: parseFloat(church.longitude).toFixed(6), // Round to 6 decimal places
        })).filter(church => !isNaN(church.latitude) && !isNaN(church.longitude)); // Filter out invalid coordinates
        setMarkers(churchesWithParsedCoords);
        fuse.current.setCollection(churchesWithParsedCoords); // Update Fuse collection
      } catch (error) {
        // console.error("Error fetching churches:", error);
      }
    };

    if (isLoggedIn) { // Only fetch if logged in
      fetchChurches(); // Fetch churches on initial load
    }

    // Cleanup function for the map click listener
    return () => {
      // No manual cleanup needed here as MapEventsHandler handles its own events
    };
  }, [onChurchSelect, isLoggedIn]);



  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(freeTextSearchQuery);
    }, 500); // 500ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [freeTextSearchQuery]);

  useEffect(() => {
    const NE_BOUNDS = {
      minLat: 15.154021,
      minLng: 120.612606,
      maxLat: 16.13085,
      maxLng: 121.370978,
    };

    let resultsToFilter = markers;

    // Filter by Nueva Ecija bounds first
    resultsToFilter = resultsToFilter.filter(marker =>
      marker.latitude >= NE_BOUNDS.minLat &&
      marker.latitude <= NE_BOUNDS.maxLat &&
      marker.longitude >= NE_BOUNDS.minLng &&
      marker.longitude <= NE_BOUNDS.maxLng
    );

    if (navSelectedMarkerId) {
      resultsToFilter = resultsToFilter.filter(marker => marker.id === navSelectedMarkerId);
    } else {
      // 1. Apply fuzzy search if freeTextSearchQuery is present
      if (debouncedSearchQuery !== '') {
        const fuseInstance = new Fuse(markers, fuseOptions); // Always search on all markers
        const fuzzyResults = fuseInstance.search(debouncedSearchQuery);
        resultsToFilter = resultsToFilter.filter(marker => fuzzyResults.some(item => item.item.id === marker.id));
      }

      // 2. Filter by selected town from the current results
      if (selectedTown) {
        resultsToFilter = resultsToFilter.filter(marker =>
          marker.church_town === selectedTown
        );
      }

      // 3. Filter by selected barangay from the current results
      if (selectedBarangay) {
        resultsToFilter = resultsToFilter.filter(marker =>
          marker.church_barangay === selectedBarangay
        );
      }

      // 4. Filter by selected district
      if (selectedDistrict) {
        resultsToFilter = resultsToFilter.filter(marker => {
          const district = getDistrictForTown(marker.church_town);
          return district === selectedDistrict;
        });
      }
    }

    setFilteredMarkers(resultsToFilter);
    setShowMarkers(!!selectedTown || !!selectedBarangay || (debouncedSearchQuery !== '' && resultsToFilter.length > 0) || !!navSelectedMarkerId || !!selectedDistrict);

  }, [debouncedSearchQuery, markers, selectedTown, selectedBarangay, navSelectedMarkerId, selectedDistrict]);

  const handleMarkerClick = async (church) => {
    onChurchSelect(church);

    const currentMapZoom = mapRef.current.getZoom();
    if (currentMapZoom < 13) {
      mapRef.current.setView([church.latitude, church.longitude], 13, { animate: false });
    }
  };

  const handleShowAll = () => {
    setFilteredMarkers(markers); // Set filtered markers to all markers
    setSelectedDistrict(null); // Reset district filter
    setShowMarkers(true); // Show them
  };

  const handleHideAll = () => {
    setShowMarkers(false); // Hide all markers
  };

  const handleDistrictClick = (district) => {
    setSelectedDistrict(district);
  };

  const baseLayers = {
    "CartoDB Positron": L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
    ),
    "Google Maps": L.tileLayer(
      "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
    ),
    "Google View": L.tileLayer(
      "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
    ),
  };

  return (
    <MapContainer
      key={navSelectedMarkerId} // Add key to force re-render when navSelectedMarkerId changes
      center={[15.58, 121]} // Initial map center for Nueva Ecija
      zoom={10} // Initial map zoom for Nueva Ecija
      maxBounds={[[5.5810, 117.1742], [18.5052, 126.5374]]} // Restrict map to Philippines bounds
      style={{ height: '100vh', width: '100%' }}
      zoomAnimation={true}
      zoomAnimationDuration={2}
      scrollWheelZoom={true} // Control scroll wheel zoom
      doubleClickZoom={true} // Control double click zoom
      dragging={true} // Control dragging
      touchZoom={true} // Control touch zoom
      zoomControl={false} // Disable the default zoom control
      attributionControl={false} // Disable default Leaflet attribution control
    >
      
      <MapEventsHandler onMapInstanceReady={(mapInstance) => { mapRef.current = mapInstance; }} onMapClick={onMapClick} />

      <ReactLayersControl
        position="topright"
        baseLayers={baseLayers}
      />

      

      <div className="map-control-buttons">
        <button className="map-control-button" onClick={handleShowAll}>Show All Markers</button>
        <button className="map-control-button" onClick={handleHideAll}>Hide All Markers</button>
        <button className="map-control-button" onClick={() => handleDistrictClick('District1')}>First District</button>
        <button className="map-control-button" onClick={() => handleDistrictClick('District2')}>Second District</button>
        <button className="map-control-button" onClick={() => handleDistrictClick('District3')}>Third District</button>
        <button className="map-control-button" onClick={() => handleDistrictClick('District4')}>Fourth District</button>
      </div>

      {showMarkers && filteredMarkers.map((marker) => {
        const district = getDistrictForTown(marker.church_town);
        const districtColor = district ? districtColors[district] : null;
        return (
        <Marker
          key={marker.id}
          position={[marker.latitude, marker.longitude]}
          icon={createCustomDivIcon({ 
              churchName: marker.church_name, 
              churchStatus: marker.church_status, 
              isSelected: marker.id === navSelectedMarkerId,
              districtColor: districtColor 
            })} // Use the function to create the divIcon
          eventHandlers={{
            click: () => handleMarkerClick(marker),
          }}
        >
        </Marker>
      )})}
    </MapContainer>
  );
};

export default Map;