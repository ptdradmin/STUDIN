
'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet-control-geocoder';
import 'leaflet-routing-machine';
import type { Housing, Trip, Event, Tutor } from '@/lib/mock-data';
import HousingDetailModal from './housing-detail-modal';
import { Bed, GraduationCap, PartyPopper } from 'lucide-react';

// Fix for default icon paths in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const icons = {
    housing: new L.Icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/2776/2776067.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    }),
    trip: new L.Icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448653.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    }),
    event: new L.Icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/9483/9483842.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    }),
    tutor: new L.Icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/306/306411.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    }),
}

const generateHousingPopup = (housing: Housing) => `
    <div class="w-48" id="popup-${housing.id}">
        <h3 class="font-bold">${housing.title}</h3>
        <p class="text-sm">${housing.city}</p>
        <p class="text-lg font-bold text-primary">${housing.price}€/mois</p>
        <button data-id="${housing.id}" class="text-sm text-accent font-semibold hover:underline">Voir détails</button>
    </div>
`;


const getPopupContent = (item: any, type: string) => {
    switch(type) {
        case 'housing':
            const h = item as Housing;
            return generateHousingPopup(h);
        case 'trip':
            const t = item as Trip;
            return `
                <div class="w-48">
                    <h3 class="font-bold">${t.departure} → ${t.arrival}</h3>
                    <p class="text-sm">Par ${t.driver}</p>
                    <p class="text-lg font-bold text-primary">${t.price}</p>
                </div>
            `;
         case 'event':
            const e = item as Event;
            return `
                <div class="w-48">
                    <h3 class="font-bold">${e.title}</h3>
                    <p class="text-sm">${e.location}</p>
                </div>
            `;
        case 'tutor':
            const tu = item as Tutor;
            return `
                <div class="w-48">
                    <h3 class="font-bold">${tu.name}</h3>
                    <p class="text-sm">${tu.subject}</p>
                    <p class="text-lg font-bold text-primary">${tu.rate}</p>
                </div>
            `;
        default:
            return '';
    }
}

interface MapViewProps {
  items: any[];
  itemType: 'housing' | 'trip' | 'event' | 'tutor' | null;
}

export default function MapView({ items, itemType }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [selectedHousing, setSelectedHousing] = useState<Housing | null>(null);


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


  const handleDetailClick = (e: Event) => {
    const target = e.target as HTMLElement;
    if(target.tagName === 'BUTTON' && target.dataset.id) {
        const housingId = parseInt(target.dataset.id, 10);
        const housing = items.find(h => h.id === housingId) as Housing;
        if(housing) {
            setSelectedHousing(housing);
        }
    }
  }
  
  // Update markers when items data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map) {
      // Clear existing markers
      markersRef.current.forEach(marker => map.removeLayer(marker));
      markersRef.current = [];

      if (!items || !itemType) return;

      // Add new markers
      items.forEach((item) => {
        if (!item.coordinates) return;
        const popupContent = getPopupContent(item, itemType);
        
        const marker = L.marker(item.coordinates as L.LatLngExpression, {
          icon: icons[itemType],
        }).addTo(map)
          .bindPopup(popupContent);
        
        marker.on('popupopen', (e) => {
            const popupNode = e.popup.getElement();
            if (popupNode) {
                popupNode.addEventListener('click', handleDetailClick);
            }
        });
        marker.on('popupclose', (e) => {
             const popupNode = e.popup.getElement();
            if (popupNode) {
                popupNode.removeEventListener('click', handleDetailClick);
            }
        });

        markersRef.current.push(marker);
      });

      if (items.length > 0) {
        const bounds = L.latLngBounds(items.map(item => item.coordinates));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [items, itemType]);

  return (
    <>
      <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
       {selectedHousing && (
        <HousingDetailModal
          housing={selectedHousing}
          onClose={() => setSelectedHousing(null)}
        />
      )}
    </>
  );
}
