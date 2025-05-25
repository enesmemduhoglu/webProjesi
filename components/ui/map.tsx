"use client";

import { GoogleMap, LoadScript, Marker, InfoWindow, Libraries } from '@react-google-maps/api';
import { useState, useCallback, useMemo } from 'react';

interface Location {
  name: string;
  lat: number;
  lng: number;
}

interface MapProps {
  markers: Location[];
}

const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '1rem',
};

const libraries: Libraries = ["places"];

const Map = ({ markers }: MapProps) => {
  const [selectedMarker, setSelectedMarker] = useState<Location | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const onLoad = useCallback((map: google.maps.Map) => {
    setIsLoaded(true);
    if (markers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      markers.forEach(marker => {
        bounds.extend({ lat: marker.lat, lng: marker.lng });
      });
      map.fitBounds(bounds);
    }
  }, [markers]);

  const onError = useCallback(() => {
    console.error('Error loading Google Maps');
    setMapError('Harita yüklenirken bir hata oluştu');
  }, []);

  const onScriptLoad = useCallback(() => {
    setIsScriptLoaded(true);
  }, []);

  const mapOptions = useMemo(() => ({
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }],
      },
    ],
    disableDefaultUI: true,
    zoomControl: true,
  }), []);

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
        Google Maps API anahtarı bulunamadı
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
        {mapError}
      </div>
    );
  }

  return (
    <LoadScript 
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      onError={onError}
      onLoad={onScriptLoad}
      libraries={libraries}
      loadingElement={<div>Loading...</div>}
      id="google-map-script"
    >
      {isScriptLoaded && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={markers.length > 0 ? { lat: markers[0].lat, lng: markers[0].lng } : { lat: 38.6810, lng: 39.2264 }}
          zoom={12}
          onLoad={onLoad}
          options={mapOptions}
        >
          {isLoaded && markers.map((marker, index) => (
            <Marker
              key={index}
              position={{ lat: marker.lat, lng: marker.lng }}
              onClick={() => setSelectedMarker(marker)}
              animation={google.maps.Animation.DROP}
            />
          ))}

          {isLoaded && selectedMarker && (
            <InfoWindow
              position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="p-2">
                <h3 className="font-semibold text-primary-700">{selectedMarker.name}</h3>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      )}
    </LoadScript>
  );
};

export default Map;