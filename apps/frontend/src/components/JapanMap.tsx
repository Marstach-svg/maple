'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Pin, PrefectureStats } from '@maple/shared';
import LocationSearch from './LocationSearch';

interface JapanMapProps {
  pins: Pin[];
  prefectureStats: PrefectureStats[];
  onPinClick?: (pin: Pin) => void;
  onMapClick?: (coordinates: [number, number], prefecture: string, address?: string) => void;
}

export default function JapanMap({ pins, prefectureStats, onPinClick, onMapClick }: JapanMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Reverse geocoding function to get place name from coordinates
  const reverseGeocode = async (lng: number, lat: number) => {
    try {
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL&language=ja`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const placeName = feature.place_name;
        
        // Extract prefecture from the address components
        const context = feature.context || [];
        let prefecture = '';
        let address = placeName;
        
        // Look for prefecture in context
        for (const item of context) {
          if (item.id && item.id.includes('region')) {
            prefecture = item.text;
            break;
          }
        }
        
        // If no prefecture found in context, try to extract from place_name
        if (!prefecture) {
          const addressParts = placeName.split(',').map((part: string) => part.trim());
          // Look for prefecture pattern (ends with 県, 府, 都, 道)
          for (const part of addressParts) {
            if (part.match(/(県|府|都|道)$/)) {
              prefecture = part;
              break;
            }
          }
        }
        
        console.log('MapTiler: Reverse geocoding result:', { placeName, prefecture, address });
        return { prefecture, address };
      }
    } catch (error) {
      console.error('MapTiler: Reverse geocoding error:', error);
    }
    
    return { prefecture: '不明', address: '住所不明' };
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Create map instance
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'raster-tiles': {
            type: 'raster',
            tiles: [
              'https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=get_your_own_OpIi9ZULNHzrESv6T2vL'
            ],
            tileSize: 256,
            attribution: '© MapTiler © OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'simple-tiles',
            type: 'raster',
            source: 'raster-tiles',
            minzoom: 0,
            maxzoom: 22
          }
        ]
      },
      center: [138.2529, 36.2048], // Japan center
      zoom: 5,
      minZoom: 4,
      maxZoom: 18
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      console.log('MapTiler: Map loaded successfully');
      setMapLoaded(true);
    });

    // Handle map clicks
    map.current.on('click', async (e) => {
      if (onMapClick) {
        const { lng, lat } = e.lngLat;
        console.log('MapTiler: Map clicked at', { lng, lat });
        
        // Get address information from coordinates
        const { prefecture, address } = await reverseGeocode(lng, lat);
        
        // Call the callback with address info
        onMapClick([lng, lat], prefecture, address);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Handle onMapClick changes separately
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing click handler
    map.current.off('click');
    
    // Add new click handler
    map.current.on('click', async (e) => {
      if (onMapClick) {
        const { lng, lat } = e.lngLat;
        console.log('MapTiler: Map clicked at', { lng, lat });
        
        // Get address information from coordinates
        const { prefecture, address } = await reverseGeocode(lng, lat);
        
        // Call the callback with address info
        onMapClick([lng, lat], prefecture, address);
      }
    });
  }, [onMapClick, mapLoaded]);

  // Add pins to map
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing pins
    pins.forEach((_, index) => {
      const markerId = `pin-${index}`;
      const existingMarker = document.getElementById(markerId);
      if (existingMarker) {
        existingMarker.remove();
      }
    });

    // Add new pins
    pins.forEach((pin, index) => {
      const marker = new maplibregl.Marker({
        color: '#ec4899'
      })
        .setLngLat([pin.longitude, pin.latitude])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(
            `<div>
              <h3 style="margin: 0 0 8px 0; font-weight: bold;">${pin.title}</h3>
              <p style="margin: 0 0 4px 0; color: #666;">${pin.prefecture}</p>
              ${pin.description ? `<p style="margin: 0; font-size: 14px;">${pin.description}</p>` : ''}
            </div>`
          )
        )
        .addTo(map.current!);

      // Add click handler
      marker.getElement().addEventListener('click', () => {
        if (onPinClick) {
          onPinClick(pin);
        }
      });

      // Add ID for cleanup
      marker.getElement().id = `pin-${index}`;
    });

    console.log('MapTiler: Added', pins.length, 'pins to map');
  }, [pins, mapLoaded, onPinClick]);

  const handleLocationSearch = (coordinates: [number, number], prefecture: string, address: string) => {
    // Fly to the selected location
    if (map.current) {
      map.current.flyTo({
        center: coordinates,
        zoom: 14,
        essential: true
      });
    }
    
    // Call the map click handler with the selected location
    if (onMapClick) {
      onMapClick(coordinates, prefecture, address);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <LocationSearch onLocationSelect={handleLocationSearch} />
      </div>
      
      <div
        ref={mapContainer}
        className="w-full h-[600px] rounded-lg border border-gray-300"
        style={{ minHeight: '400px' }}
      />
      
      <div className="mt-4 flex items-center justify-between bg-gradient-to-r from-honey-50 to-primary-50 p-4 rounded-xl border border-honey-200/50">
        <div className="text-sm text-warm-700 font-medium flex items-center">
          ✨ 検索または地図をクリックして新しい場所を追加
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="text-xs text-warm-600 font-medium flex items-center space-x-1">
            <span>📍 ピン数:</span>
            <span className="bg-primary-200 px-2 py-1 rounded-full text-primary-800">{pins.length}</span>
          </div>
          
          {prefectureStats.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-warm-600 font-medium">🗾 都道府県:</span>
              <span className="text-xs font-semibold bg-maple-200 px-2 py-1 rounded-full text-maple-800">{prefectureStats.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}