import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getMapData, createLog } from '../../services/api';
import '../styles/panels.css';

// Fix for default marker icons in Leaflet with React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconRetinaUrl: iconRetina,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Internal component to handle map events and debounced logging
const MapWatcher = () => {
    const moveTimeoutRef = React.useRef(null);
    
    useMapEvents({
      moveend: () => {
        // Clear existing debounce timer
        if (moveTimeoutRef.current) {
          clearTimeout(moveTimeoutRef.current);
        }
        
        // Use a 1000ms debounce to prevent log spam
        moveTimeoutRef.current = setTimeout(() => {
          createLog('INFO', 'map_dragged', 'User moved the map viewport');
          console.log('🗺️ Map drag logged (debounced)');
        }, 1000);
      },
    });
    
    return null;
  };

const MapPanel = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setLoading(true);
        const data = await getMapData();
        setLocations(data.locations || []);
        setError(null);
      } catch (err) {
        setError('Failed to load map data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
  }, []);

  if (loading) return <div className="panel-content"><p>Loading map...</p></div>;
  if (error) return <div className="panel-content error"><p>{error}</p></div>;

  // Default center if no locations
  const center = locations.length > 0 
    ? [locations[0].lat, locations[0].lng] 
    : [51.505, -0.09];

  return (
    <div className="panel-content" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer center={center} zoom={4} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <MapWatcher />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {locations.map((loc, idx) => (
            <Marker key={idx} position={[loc.lat, loc.lng]}>
              <Popup>{loc.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapPanel;
