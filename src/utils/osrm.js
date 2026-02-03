/**
 * OSRM (OpenStreetMap) – المسافة على الطريق والوقت المتوقع للوصول (تتبع الدليفري)
 */

const OSRM_BASE = 'https://router.project-osrm.org';

export async function getRouteDistanceAndEta(from, to) {
  if (from?.lat == null || from?.lng == null || to?.lat == null || to?.lng == null) return null;
  const coords = `${Number(from.lng)},${Number(from.lat)};${Number(to.lng)},${Number(to.lat)}`;
  const url = `${OSRM_BASE}/route/v1/driving/${coords}?overview=false`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.[0]) return null;
    const route = data.routes[0];
    const distanceMeters = Math.round(route.distance * 10) / 10;
    const durationSeconds = Math.round(route.duration);
    const distanceKm = Math.round((distanceMeters / 1000) * 1000) / 1000;
    const estimatedMinutes = Math.max(1, Math.round(durationSeconds / 60));
    const eta = new Date(Date.now() + durationSeconds * 1000).toISOString();
    return { distanceMeters, durationSeconds, distanceKm, estimatedMinutes, eta };
  } catch (err) {
    console.warn('OSRM fetch failed:', err);
    return null;
  }
}
