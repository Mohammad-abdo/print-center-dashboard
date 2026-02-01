import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix default marker icon in Vite/bundlers
const createIcon = (color) =>
  new L.DivIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

const DEFAULT_CENTER = [30.0444, 31.2357];
const TEAL = '#0d9488';
const AMBER = '#f59e0b';
const EMERALD = '#10b981';

function FitBounds({ points }) {
  const map = useMap();
  const hasPoints = points.length > 0;
  if (hasPoints && points.every((p) => p[0] && p[1])) {
    try {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 14 });
    } catch (_) {}
  }
  return null;
}

export default function DeliveryTrackingMap({ order, printCenter, deliveryLatestLocation, delivery }) {
  const points = useMemo(() => {
    const p = [];
    if (printCenter?.latitude != null && printCenter?.longitude != null) {
      p.push([printCenter.latitude, printCenter.longitude]);
    }
    if (order?.latitude != null && order?.longitude != null) {
      p.push([order.latitude, order.longitude]);
    }
    if (deliveryLatestLocation?.latitude != null && deliveryLatestLocation?.longitude != null) {
      p.push([deliveryLatestLocation.latitude, deliveryLatestLocation.longitude]);
    }
    return p;
  }, [order, printCenter, deliveryLatestLocation]);

  const center = useMemo(() => {
    if (points.length === 0) return DEFAULT_CENTER;
    const sumLat = points.reduce((s, p) => s + p[0], 0);
    const sumLng = points.reduce((s, p) => s + p[1], 0);
    return [sumLat / points.length, sumLng / points.length];
  }, [points]);

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200" style={{ height: 320 }}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        {printCenter?.latitude != null && printCenter?.longitude != null && (
          <Marker
            position={[printCenter.latitude, printCenter.longitude]}
            icon={createIcon(TEAL)}
          >
            <Popup>
              <strong>نقطة الطباعة</strong>
              <br />
              {printCenter.name}
              <br />
              {printCenter.location}
            </Popup>
          </Marker>
        )}
        {order?.latitude != null && order?.longitude != null && (
          <Marker
            position={[order.latitude, order.longitude]}
            icon={createIcon(AMBER)}
          >
            <Popup>
              <strong>العميل</strong>
              <br />
              {order.address || 'عنوان التوصيل'}
            </Popup>
          </Marker>
        )}
        {deliveryLatestLocation?.latitude != null && deliveryLatestLocation?.longitude != null && (
          <Marker
            position={[deliveryLatestLocation.latitude, deliveryLatestLocation.longitude]}
            icon={createIcon(EMERALD)}
          >
            <Popup>
              <strong>الدليفري</strong>
              {delivery && (
                <>
                  <br />
                  {delivery.name} — {delivery.phone}
                  <br />
                  آخر تحديث: {deliveryLatestLocation.createdAt ? new Date(deliveryLatestLocation.createdAt).toLocaleString('ar-EG') : ''}
                </>
              )}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
