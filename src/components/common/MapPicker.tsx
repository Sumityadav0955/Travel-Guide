// Map picker component for selecting coordinates
import React, { useState, useCallback } from 'react';
import Map from './Map';
import '../../styles/map.css';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface MapPickerProps {
  coordinates?: Coordinates;
  onCoordinatesChange: (coordinates: Coordinates) => void;
  label?: string;
  error?: string;
}

const MapPicker: React.FC<MapPickerProps> = ({
  coordinates,
  onCoordinatesChange,
  label,
  error
}) => {
  const [manualInput, setManualInput] = useState(false);
  const [tempLat, setTempLat] = useState(coordinates?.latitude?.toString() || '28.6139'); // Default Delhi
  const [tempLng, setTempLng] = useState(coordinates?.longitude?.toString() || '77.2090');

  const handleManualSubmit = useCallback(() => {
    const lat = parseFloat(tempLat);
    const lng = parseFloat(tempLng);
    
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      onCoordinatesChange({ latitude: lat, longitude: lng });
      setManualInput(false);
    }
  }, [tempLat, tempLng, onCoordinatesChange]);

  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onCoordinatesChange({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your current location. Please enter coordinates manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }, [onCoordinatesChange]);

  return (
    <div className="map-picker">
      {label && (
        <label className="input-label">
          {label}
          <span className="required">*</span>
        </label>
      )}
      
      <div className="map-container">
        <Map
          center={coordinates ? [coordinates.latitude, coordinates.longitude] : [28.6139, 77.2090]} // Default to Delhi
          zoom={coordinates ? 15 : 5}
          onMapClick={onCoordinatesChange}
          height="300px"
        />
        {coordinates && (
          <p style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
            Selected: {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
          </p>
        )}
      </div>

      <div className="map-controls">
        <button
          type="button"
          onClick={getCurrentLocation}
          className="btn btn-secondary"
        >
          Use Current Location
        </button>
        
        <button
          type="button"
          onClick={() => setManualInput(!manualInput)}
          className="btn btn-secondary"
        >
          {manualInput ? 'Cancel' : 'Enter Manually'}
        </button>
      </div>

      {manualInput && (
        <div className="manual-coordinates">
          <div className="coordinate-inputs">
            <div className="input-group">
              <label>Latitude</label>
              <input
                type="number"
                value={tempLat}
                onChange={(e) => setTempLat(e.target.value)}
                placeholder="e.g., 40.7128"
                step="any"
                min="-90"
                max="90"
                className="form-input"
              />
            </div>
            <div className="input-group">
              <label>Longitude</label>
              <input
                type="number"
                value={tempLng}
                onChange={(e) => setTempLng(e.target.value)}
                placeholder="e.g., -74.0060"
                step="any"
                min="-180"
                max="180"
                className="form-input"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleManualSubmit}
            className="btn btn-primary"
          >
            Set Coordinates
          </button>
        </div>
      )}

      {error && <span className="input-error">{error}</span>}
    </div>
  );
};

export default MapPicker;