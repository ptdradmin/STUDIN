
'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import { useEffect } from 'react';

// Import plugins dynamically
import 'leaflet-control-geocoder';
import 'leaflet-routing-machine';
import { Housing } from '@/lib/mock-data';
import Link from 'next/link';

// Fix for default icon paths in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


const customIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2776/2776067.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});


function Routing() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    L.Routing.control({
      position: 'topright',
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1/',
      }),
      lineOptions: { styles: [{ color: '#007AFF', weight: 4 }] },
      showAlternatives: true,
      geocoder: (L.Control as any).Geocoder.nominatim(),
    }).addTo(map);
  }, [map]);

  return null;
}

interface MapViewProps {
  housings: Housing[];
}

export default function MapView({ housings }: MapViewProps) {
  return (
    <MapContainer
      center={[50.8503, 4.3517]} // Centered on Brussels
      zoom={8}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {housings.map((housing) => (
        <Marker key={housing.id} position={housing.coordinates as L.LatLngExpression} icon={customIcon}>
          <Popup>
            <div className="w-48">
              <h3 className="font-bold">{housing.title}</h3>
              <p className="text-sm">{housing.city}</p>
              <p className="text-lg font-bold text-primary">{housing.price}€/mois</p>
              <Link href="#" className="text-sm text-accent">Voir détails</Link>
            </div>
          </Popup>
        </Marker>
      ))}
      <Routing />
    </MapContainer>
  );
}
