
'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet-control-geocoder';
import 'leaflet-routing-machine';
import type { Housing, Trip, Event, Tutor } from '@/lib/types';
import { Bed, GraduationCap, PartyPopper, Car, BookOpen } from 'lucide-react';

// Fix for default icon paths in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const getIcon = (type: string) => {
    let iconUrl: string;
    switch(type) {
        case 'housing': iconUrl = 'https://cdn-icons-png.flaticon.com/512/2776/2776067.png'; break;
        case 'trip': iconUrl = 'https://cdn-icons-png.flaticon.com/512/3448/3448653.png'; break;
        case 'event': iconUrl = 'https://cdn-icons-png.flaticon.com/512/9483/9483842.png'; break;
        case 'tutor': iconUrl = 'https://cdn-icons-png.flaticon.com/512/1904/1904425.png'; break;
        default: iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
    }
    return new L.Icon({
        iconUrl,
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    });
}


const getPopupContent = (item: any, type: string) => {
    switch(type) {
        case 'housing':
            const h = item as Housing;
            return `
                <div class="w-48" data-id="${h.id}" data-type="housing">
                    <img src="${h.imageUrl}" alt="${h.title}" class="w-full h-20 object-cover rounded-md mb-2" />
                    <h3 class="font-bold text-base">${h.title}</h3>
                    <p class="text-sm text-muted-foreground">${h.city}</p>
                    <p class="text-lg font-bold text-primary">${h.price}€/mois</p>
                </div>
            `;
        case 'trip':
            const t = item as Trip;
            return `
                <div class="w-48">
                    <h3 class="font-bold">${t.departureCity} → ${t.arrivalCity}</h3>
                    <p class="text-sm">Par ${t.driverUsername}</p>
                    <p class="text-lg font-bold text-primary">${t.pricePerSeat}€</p>
                </div>
            `;
         case 'event':
            const e = item as Event;
            return `
                <div class="w-48">
                    <h3 class="font-bold">${e.title}</h3>
                    <p class="text-sm">${e.city}</p>
                </div>
            `;
        case 'tutor':
            const tu = item as Tutor;
            return `
                <div class="w-48">
                    <h3 class="font-bold">${tu.subject}</h3>
                    <p class="text-sm">${tu.level}</p>
                    <p class="text-lg font-bold text-primary">${tu.pricePerHour}€/h</p>
                </div>
            `;
        default:
            return '';
    }
}

interface MapViewProps {
  items: any[];
  itemType: 'housing' | 'trip' | 'event' | 'tutor';
  onMarkerClick?: (item: any) => void;
}

export default function MapView({ items, itemType, onMarkerClick }: MapViewProps) {
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
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        }
      ).addTo(map);
    }
    
    // Cleanup function to remove map instance on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount and cleanup on unmount


  const handlePopupClick = (e: L.LeafletMouseEvent) => {
    const content = e.target.getPopup().getContent();
    if (typeof content === 'string') {
        const div = document.createElement('div');
        div.innerHTML = content;
        const itemElement = div.firstChild as HTMLElement;
        const id = itemElement?.dataset.id;
        const type = itemElement?.dataset.type;

        if (id && type && onMarkerClick) {
            const item = items.find(i => i.id === id);
            if (item) {
                onMarkerClick(item);
            }
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
        
        const marker = L.marker(item.coordinates as L.LatLngExpression, {
          icon: getIcon(itemType),
        }).addTo(map)
          .bindPopup(getPopupContent(item, itemType));
        
        if (onMarkerClick) {
            marker.on('click', handlePopupClick);
        }
        
        markersRef.current.push(marker);
      });

      if (items.length > 0) {
        const validCoords = items.filter(item => item.coordinates).map(item => item.coordinates);
        if (validCoords.length > 0) {
          const bounds = L.latLngBounds(validCoords as L.LatLngExpression[]);
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    }

    // Cleanup listeners
    return () => {
        markersRef.current.forEach(marker => marker.off('click'));
    }

  }, [items, itemType, onMarkerClick]);

  return (
    <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
  );
}
