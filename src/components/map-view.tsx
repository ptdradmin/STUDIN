
'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-control-geocoder';
import 'leaflet-routing-machine';
import type { Housing } from '@/lib/mock-data';

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

interface MapViewProps {
  housings: Housing[];
}

export default function MapView({ housings }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [50.8503, 4.3517], // Brussels
        zoom: 8,
        scrollWheelZoom: true,
      });
      mapInstanceRef.current = map;

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        }
      ).addTo(map);

      // Add routing control
      L.Routing.control({
        position: 'topright',
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1/',
        }),
        lineOptions: { styles: [{ color: 'hsl(var(--accent))', weight: 4 }] },
        showAlternatives: true,
        geocoder: (L.Control as any).Geocoder.nominatim(),
      }).addTo(map);
    }
    
    // Cleanup function to remove map instance on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount and cleanup on unmount

  // Update markers when housings data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map) {
      // Clear existing markers
      markersRef.current.forEach(marker => map.removeLayer(marker));
      markersRef.current = [];

      // Add new markers
      housings.forEach((housing) => {
        const marker = L.marker(housing.coordinates as L.LatLngExpression, {
          icon: customIcon,
        }).addTo(map)
          .bindPopup(`
            <div class="w-48">
              <h3 class="font-bold">${housing.title}</h3>
              <p class="text-sm">${housing.city}</p>
              <p class="text-lg font-bold text-primary">${housing.price}€/mois</p>
              <a href="#" class="text-sm text-accent">Voir détails</a>
            </div>
          `);
        markersRef.current.push(marker);
      });
    }
  }, [housings]);

  return <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />;
}
