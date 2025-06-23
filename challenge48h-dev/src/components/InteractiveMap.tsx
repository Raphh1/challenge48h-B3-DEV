import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import { Association } from '../types/association';
import AssociationPopup from './AssociationPopup';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon with Bordeaux colors
const customIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.596 19.404 0 12.5 0z" fill="#7A1F2B"/>
      <circle cx="12.5" cy="12.5" r="8" fill="white"/>
      <circle cx="12.5" cy="12.5" r="5" fill="#7A1F2B"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface InteractiveMapProps {
  associations: Association[];
}

// Component to fit map bounds to markers
const FitBounds: React.FC<{ associations: Association[] }> = ({ associations }) => {
  const map = useMap();

  useEffect(() => {
    if (associations.length > 0) {
      const validAssociations = associations.filter(
        (assoc) => assoc.coordinates && assoc.coordinates.length === 2
      );

      if (validAssociations.length > 0) {
        const bounds = new LatLngBounds([]);
        validAssociations.forEach((assoc) => {
          if (assoc.coordinates) {
            bounds.extend([assoc.coordinates[0], assoc.coordinates[1]]);
          }
        });
        
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [20, 20] });
        }
      }
    }
  }, [associations, map]);

  return null;
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({ associations }) => {
  const [mapKey, setMapKey] = useState(0);

  // Bordeaux center coordinates
  const bordeauxCenter: [number, number] = [44.8378, -0.5792];

  // Filter associations with valid coordinates
  const validAssociations = associations.filter(
    (assoc) => assoc.coordinates && assoc.coordinates.length === 2
  );

  // Force map re-render when associations change
  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [associations]);

  return (
    <div className="h-full w-full rounded-lg overflow-hidden shadow-lg relative">
      <MapContainer
        key={mapKey}
        center={bordeauxCenter}
        zoom={12}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBounds associations={associations} />
        
        {validAssociations.map((association) => {
          if (!association.coordinates) return null;
          
          const [lat, lng] = association.coordinates;
          
          return (
            <Marker
              key={association.rna}
              position={[lat, lng]}
              icon={customIcon}
            >
              <Popup maxWidth={350} className="custom-popup">
                <AssociationPopup association={association} />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Info panel */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg text-sm z-[1000]">
        <div className="font-semibold text-bordeaux mb-1">
          {validAssociations.length} associations géolocalisées
        </div>
        <div className="text-gray-600">
          sur {associations.length} au total
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;