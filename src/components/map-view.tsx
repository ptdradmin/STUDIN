
'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';


import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-control-geocoder';
import 'leaflet.markercluster';
import 'leaflet.locatecontrol';
import 'leaflet-routing-machine';

import type { Housing, Trip, Event, Tutor, Challenge } from '@/lib/types';
import { Bed, Car, PartyPopper, BookOpen, Target } from 'lucide-react';
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
    challenge: createIcon(<Target size={24} />, '#EF4444'), // red-500
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
                <div style="${baseStyle}" data-id="${t.id}" data-type="trip">
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
        case 'challenge':
            const c = item as Challenge;
             return `
                 <div style="${baseStyle}" data-id="${c.id}" data-type="challenge">
                    <h3 style="${titleStyle}">${c.title}</h3>
                    <p style="${textStyle}">${c.points} points</p>
                </div>
            `;
        default:
            return '';
    }
}

interface MapViewProps {
  items: any[];
  itemType: 'housing' | 'trip' | 'event' | 'tutor' | 'challenge';
  onMarkerClick?: (item: any) => void;
  selectedItem?: any | null;
}

export default function MapView({ items, itemType, onMarkerClick, selectedItem }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);
  const routeControlRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [50.5, 4.75], // Centered on Belgium
        zoom: 8,
        scrollWheelZoom: true,
      });
      mapInstanceRef.current = map;

      const planLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        }
      );
      
       const satelliteLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }
      );
      
      const darkLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      });

      const terrainLayer = L.tileLayer(
        'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      });
      
      const humanitarianLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
      });


      const baseMaps = {
          "Plan": planLayer,
          "Satellite": satelliteLayer,
          "Sombre": darkLayer,
          "Terrain": terrainLayer,
          "Humanitaire": humanitarianLayer,
      };

      planLayer.addTo(map); // Default layer
      L.control.layers(baseMaps).addTo(map);


      markersRef.current = L.markerClusterGroup().addTo(map);

      // Add Geocoder search control
      (L.Control as any).geocoder({
        defaultMarkGeocode: false,
      }).on('markgeocode', function(e: any) {
        var bbox = e.geocode.bbox;
        var poly = L.polygon([
          bbox.getSouthEast(),
          bbox.getNorthEast(),
          bbox.getNorthWest(),
          bbox.getSouthWest()
        ]);
        map.fitBounds(poly.getBounds());
      }).addTo(map);

      // Add "My Location" control
      (L.control as any).locate({
        position: 'topleft',
        strings: {
            title: "Montre-moi où je suis"
        },
        flyTo: true,
        keepCurrentZoomLevel: true,
      }).addTo(map);
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

    markers.clearLayers();
    map.off('popupopen', handlePopupClick);

    if (!items || items.length === 0) return;

    const validItems = items.filter(item => {
        const coords = item.coordinates || (itemType === 'challenge' && [item.latitude, item.longitude]);
        if (!coords || !Array.isArray(coords) || coords.length !== 2 || coords[0] == null || coords[1] == null) {
            console.warn("Item skipped due to invalid coordinates:", item);
            return false;
        }
        return true;
    });

    validItems.forEach((item) => {
        const coords = item.coordinates || [item.latitude, item.longitude];
        const marker = L.marker(coords as L.LatLngExpression, {
            icon: icons[itemType],
        }).bindPopup(getPopupContent(item, itemType));
        
        markers.addLayer(marker);
    });

    if (onMarkerClick) {
        map.on('popupopen', handlePopupClick);
    }
    
     if (!selectedItem) {
        const validCoords = validItems.map(item => item.coordinates || [item.latitude, item.longitude]);
          
        if (validCoords.length > 0) {
            const bounds = L.latLngBounds(validCoords as L.LatLngExpression[]);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
    }

  }, [items, itemType, onMarkerClick, selectedItem]);
  
  
   useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing route before adding a new one
    if (routeControlRef.current) {
        map.removeControl(routeControlRef.current);
        routeControlRef.current = null;
    }

    // Only draw a route for items of type 'trip' that have valid start and end coordinates.
    const shouldDrawRoute = 
        selectedItem && 
        itemType === 'trip' && 
        Array.isArray(selectedItem.coordinates) && selectedItem.coordinates.length === 2 &&
        Array.isArray(selectedItem.arrivalCoordinates) && selectedItem.arrivalCoordinates.length === 2;

    if (shouldDrawRoute) {
        const route = L.Routing.control({
            waypoints: [
                L.latLng(selectedItem.coordinates[0], selectedItem.coordinates[1]),
                L.latLng(selectedItem.arrivalCoordinates[0], selectedItem.arrivalCoordinates[1])
            ],
            routeWhileDragging: false,
            show: false, // Hides the itinerary text panel
            addWaypoints: false, // Prevents users from adding more waypoints
            createMarker: function() { return null; } // Prevent default markers
        }).addTo(map);

        routeControlRef.current = route;
    }
  }, [selectedItem, itemType]);

  return (
    <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} className="rounded-lg overflow-hidden" />
  );
}
