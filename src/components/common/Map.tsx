// Interactive map component using Leaflet
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Location } from '../../types';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  center?: [number, number];
  zoom?: number;
  locations?: Location[];
  selectedLocation?: Location | null;
  onLocationSelect?: (location: Location) => void;
  onMapClick?: (coordinates: { latitude: number; longitude: number }) => void;
  height?: string;
  className?: string;
}

// Component to handle map click events
const MapClickHandler: React.FC<{ onMapClick?: (coordinates: { latitude: number; longitude: number }) => void }> = ({ onMapClick }) => {
  const map = useMap();

  useEffect(() => {
    if (!onMapClick) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      onMapClick({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng
      });
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);

  return null;
};

const Map: React.FC<MapProps> = ({
  center = [20.5937, 78.9629], // Default to India center
  zoom = 5,
  locations = [],
  selectedLocation,
  onLocationSelect,
  onMapClick,
  height = '400px',
  className = ''
}) => {
  const mapRef = useRef<L.Map>(null);

  // Create custom icon for selected location
  const selectedIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: 'selected-marker'
  });

  return (
    <div className={`map-wrapper ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        
        <MapClickHandler onMapClick={onMapClick} />
        
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.coordinates.latitude, location.coordinates.longitude]}
            icon={selectedLocation?.id === location.id ? selectedIcon : undefined}
            eventHandlers={{
              click: () => onLocationSelect?.(location)
            }}
          >
            <Popup>
              <div className="map-popup">
                <h4>{location.name}</h4>
                <p>{location.description}</p>
                <div className="popup-meta">
                  <span className="category">{location.category}</span>
                  <span className="rating">★ {location.averageRating.toFixed(1)}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;