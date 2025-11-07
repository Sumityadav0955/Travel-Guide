// Map component with marker clustering for dense areas
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Location } from '../../types';

// Simple clustering implementation
interface ClusterGroup {
  center: [number, number];
  locations: Location[];
  bounds: L.LatLngBounds;
}

interface MapWithClusteringProps {
  center?: [number, number];
  zoom?: number;
  locations?: Location[];
  selectedLocation?: Location | null;
  onLocationSelect?: (location: Location) => void;
  onMapClick?: (coordinates: { latitude: number; longitude: number }) => void;
  height?: string;
  className?: string;
  clusterDistance?: number; // Distance in pixels to cluster markers
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

// Simple clustering logic
const createClusters = (locations: Location[], map: L.Map, clusterDistance: number): (ClusterGroup | Location)[] => {
  if (!map || locations.length === 0) return locations;

  const clusters: ClusterGroup[] = [];
  const processed = new Set<string>();

  locations.forEach(location => {
    if (processed.has(location.id)) return;

    const locationPoint = map.latLngToContainerPoint([location.coordinates.latitude, location.coordinates.longitude]);
    const nearbyLocations = [location];
    processed.add(location.id);

    // Find nearby locations within cluster distance
    locations.forEach(otherLocation => {
      if (processed.has(otherLocation.id)) return;

      const otherPoint = map.latLngToContainerPoint([otherLocation.coordinates.latitude, otherLocation.coordinates.longitude]);
      const distance = locationPoint.distanceTo(otherPoint);

      if (distance <= clusterDistance) {
        nearbyLocations.push(otherLocation);
        processed.add(otherLocation.id);
      }
    });

    if (nearbyLocations.length > 1) {
      // Create cluster
      const bounds = new L.LatLngBounds(nearbyLocations.map(loc => [loc.coordinates.latitude, loc.coordinates.longitude]));
      const center = bounds.getCenter();
      clusters.push({
        center: [center.lat, center.lng],
        locations: nearbyLocations,
        bounds
      });
    }
  });

  // Return mix of clusters and individual locations
  const result: (ClusterGroup | Location)[] = [...clusters];
  locations.forEach(location => {
    if (!processed.has(location.id)) {
      result.push(location);
    }
  });

  return result;
};

const ClusterMarker: React.FC<{ cluster: ClusterGroup; onLocationSelect?: (location: Location) => void }> = ({ cluster, onLocationSelect }) => {
  const clusterIcon = new L.DivIcon({
    html: `<div class="cluster-marker"><span>${cluster.locations.length}</span></div>`,
    className: 'cluster-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });

  return (
    <Marker position={cluster.center} icon={clusterIcon}>
      <Popup maxWidth={300}>
        <div className="cluster-popup">
          <h4>{cluster.locations.length} Locations</h4>
          <div className="cluster-locations">
            {cluster.locations.map(location => (
              <div 
                key={location.id} 
                className="cluster-location-item"
                onClick={() => onLocationSelect?.(location)}
              >
                <strong>{location.name}</strong>
                <span className="category">{location.category}</span>
                <span className="rating">★ {location.averageRating.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

const MapWithClustering: React.FC<MapWithClusteringProps> = ({
  center = [20.5937, 78.9629], // Default to India center
  zoom = 5,
  locations = [],
  selectedLocation,
  onLocationSelect,
  onMapClick,
  height = '400px',
  className = '',
  clusterDistance = 50
}) => {
  const mapRef = useRef<L.Map>(null);
  const [clusters, setClusters] = React.useState<(ClusterGroup | Location)[]>([]);

  // Update clusters when map or locations change
  useEffect(() => {
    if (mapRef.current && locations.length > 0) {
      const newClusters = createClusters(locations, mapRef.current, clusterDistance);
      setClusters(newClusters);
    } else {
      setClusters(locations);
    }
  }, [locations, clusterDistance]);

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
        whenReady={() => {
          if (mapRef.current && locations.length > 0) {
            const newClusters = createClusters(locations, mapRef.current, clusterDistance);
            setClusters(newClusters);
          }
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler onMapClick={onMapClick} />
        
        {clusters.map((item, index) => {
          if ('locations' in item) {
            // This is a cluster
            return (
              <ClusterMarker
                key={`cluster-${index}`}
                cluster={item}
                onLocationSelect={onLocationSelect}
              />
            );
          } else {
            // This is an individual location
            return (
              <Marker
                key={item.id}
                position={[item.coordinates.latitude, item.coordinates.longitude]}
                icon={selectedLocation?.id === item.id ? selectedIcon : undefined}
                eventHandlers={{
                  click: () => onLocationSelect?.(item)
                }}
              >
                <Popup>
                  <div className="map-popup">
                    <h4>{item.name}</h4>
                    <p>{item.description}</p>
                    <div className="popup-meta">
                      <span className="category">{item.category}</span>
                      <span className="rating">★ {item.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          }
        })}
      </MapContainer>
    </div>
  );
};

export default MapWithClustering;