"use client";

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import gcoord from 'gcoord';

// Correction icône Leaflet par défaut
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Composant pour mettre à jour la vue de la carte
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function MapComponent({ events }) {
  const [userLocation, setUserLocation] = useState(null);
  const [heading, setHeading] = useState(0);
  const watchIdRef = useRef(null);

  useEffect(() => {
    // Activer la géolocalisation
    if ('geolocation' in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          // Conversion WGS84 -> GCJ02
          const gcj02Coords = gcoord.transform(
            [position.coords.longitude, position.coords.latitude],
            gcoord.WGS84,
            gcoord.GCJ02
          );
          // gcoord retourne [lng, lat], Leaflet utilise [lat, lng]
          setUserLocation([gcj02Coords[1], gcj02Coords[0]]);
        },
        (error) => console.error("Erreur GPS:", error),
        { enableHighAccuracy: true, maximumAge: 0 }
      );
    }

    // Boussole via gyroscope
    const handleOrientation = (e) => {
      let compassHeading = e.webkitCompassHeading || Math.abs(e.alpha - 360);
      setHeading(compassHeading);
    };

    if (window.DeviceOrientationEvent) {
      // Pour iOS, il faut parfois demander la permission
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        // Le faire au clic de l'utilisateur idéalement, ici on bind l'event
        window.addEventListener('deviceorientation', handleOrientation);
      } else {
        window.addEventListener('deviceorientationabsolute', handleOrientation);
      }
    }

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
    };
  }, []);

  const defaultCenter = userLocation || [39.9042, 116.4074]; // Pékin par défaut (GCJ-02 environ)

  // Icône personnalisée pour l'utilisateur
  const userIcon = L.divIcon({
    className: 'custom-user-icon',
    html: `<div style="transform: rotate(${heading}deg); width: 20px; height: 20px; background: #00e5ff; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0, 229, 255, 0.8);">
             <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-bottom: 10px solid white; position: absolute; top: -12px; left: 1px;"></div>
           </div>`,
    iconSize: [20, 20],
  });

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer 
        center={defaultCenter} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        {/* Fond de carte local (Amap / GaoDe) qui utilise déjà le format GCJ-02 */}
        <TileLayer
          url="https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
          attribution="&copy; AutoNavi"
        />

        {userLocation && <MapUpdater center={userLocation} />}

        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>Votre position (GCJ-02)</Popup>
          </Marker>
        )}

        {events.filter(e => e.latitude && e.longitude).map(event => {
          // Conversion des événements s'ils sont saisis en WGS84
          // On assume qu'ils sont en WGS84 et on les convertit en GCJ02
          const gcj02Coords = gcoord.transform(
            [event.longitude, event.latitude],
            gcoord.WGS84,
            gcoord.GCJ02
          );
          
          return (
            <Marker key={event.id} position={[gcj02Coords[1], gcj02Coords[0]]}>
              <Popup>
                <b>{event.title}</b><br/>
                {event.time} - {event.date}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
