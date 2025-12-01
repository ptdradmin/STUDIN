
'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-control-geocoder';
import 'leaflet.markercluster';

import type { Housing, Trip, Event, Tutor } from '@/lib/types';
import { Bed, Car, PartyPopper, BookOpen, MapPin } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';


// Fix for default icon paths in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createIcon = (icon: React.ReactElement, color: string) => {
    const iconMarkup = renderToStaticMarkup(
      <div style={{
          backgroundColor: color,
          borderRadius: '50%',
          padding: '8px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}>
        {React.cloneElement(icon, { color: 'white', strokeWidth: 2 })}
      </div>
    );

    return new L.DivIcon({
        html: iconMarkup,
        className: '', // Important to override default leaflet styles
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });
};

const icons = {
    housing: createIcon(<Bed size={24} />, '#8B5CF6'), // primary
    trip: createIcon(<Car size={24} />, '#F59E0B'), // amber-500
    event: createIcon(<PartyPopper size={24} />, '#EC4899'), // pink-500
    tutor: createIcon(<BookOpen size={24} />, '#10B981'), // emerald-500
};


const getPopupContent = (item: any, type: string) => {
    const baseStyle = "font-family: 'Inter', sans-serif; max-width: 200px;";
    const titleStyle = "font-weight: bold; font-size: 1rem; margin-bottom: 4px; color: #111827;";
    const textStyle = "font-size: 0.875rem; color: #6B7281; margin: 0;";
    const priceStyle = "font-weight: bold; font-size: 1.125rem; color: #8B5CF6; margin-top: 8px;";
    
    switch(type) {
        case 'housing':
            const h = item as Housing;
            return `
                <div style="${baseStyle}" data-id="${h.id}" data-type="housing">
                    <img src="${h.imageUrl}" alt="${h.title}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 6px; margin-bottom: 8px;" />
                    <h3 style="${titleStyle}">${h.title}</h3>
                    <p style="${textStyle}">${h.city}</p>
                    <p style="${priceStyle}">${h.price}€/mois</p>
                </div>
            `;
        case 'trip':
            const t = item as Trip;
            return `
                <div style="${baseStyle}">
                    <h3 style="${titleStyle}">${t.departureCity} → ${t.arrivalCity}</h3>
                    <p style="${textStyle}">Par ${t.username}</p>
                    <p style="${priceStyle.replace('#8B5CF6', '#F59E0B')}">${t.pricePerSeat}€</p>
                </div>
            `;
         case 'event':
            const e = item as Event;
            return `
                 <div style="${baseStyle}" data-id="${e.id}" data-type="event">
                    <img src="${e.imageUrl}" alt="${e.title}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 6px; margin-bottom: 8px;" />
                    <h3 style="${titleStyle}">${e.title}</h3>
                    <p style="${textStyle}">${e.city}</p>
                </div>
            `;
        case 'tutor':
            const tu = item as Tutor;
             return `
                 <div style="${baseStyle}" data-id="${tu.id}" data-type="tutor">
                    <h3 style="${titleStyle}">${tu.subject}</h3>
                    <p style="${textStyle}">par ${tu.username}</p>
                     <p style="${priceStyle.replace('#8B5CF6', '#10B981')}">${tu.pricePerHour}€/h</p>
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
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [50.5, 4.75], // Centered on Belgium
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

      markersRef.current = L.markerClusterGroup().addTo(map);
    }
    
    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);
  
  const handlePopupClick = (e: L.LeafletMouseEvent) => {
      const popup = e.target.getPopup();
      if (!popup || !onMarkerClick) return;

      const content = popup.getContent();
      if (typeof content !== 'string') return;

      const div = document.createElement('div');
      div.innerHTML = content;
      const itemElement = div.firstChild as HTMLElement | null;
      
      const id = itemElement?.dataset.id;
      if (id) {
          const item = items.find(i => i.id === id);
          if (item) {
              onMarkerClick(item);
          }
      }
  };


  useEffect(() => {
    const markers = markersRef.current;
    const map = mapInstanceRef.current;

    if (!markers || !map) return;

    // Clear existing layers
    markers.clearLayers();

    // Remove old listeners before adding new ones
    map.off('popupopen', handlePopupClick);

    if (!items || items.length === 0) return;

    items.forEach((item) => {
        if (!item.coordinates || !Array.isArray(item.coordinates) || item.coordinates.length !== 2) {
            console.warn("Item skipped due to invalid coordinates:", item);
            return;
        }
        
        const marker = L.marker(item.coordinates as L.LatLngExpression, {
            icon: icons[itemType],
        }).bindPopup(getPopupContent(item, itemType));
        
        markers.addLayer(marker);
    });

    // Add new listener
    if (onMarkerClick) {
        map.on('popupopen', handlePopupClick);
    }

    const validCoords = items
        .map(item => item.coordinates)
        .filter(coord => Array.isArray(coord) && coord.length === 2 && coord[0] != null && coord[1] != null);
      
    if (validCoords.length > 0) {
        const bounds = L.latLngBounds(validCoords as L.LatLngExpression[]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }

  }, [items, itemType, onMarkerClick]);

  return (
    <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} className="rounded-lg overflow-hidden" />
  );
}
