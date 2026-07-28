const colors = { congested: '#eb4b4b', caution: '#f4ad32', smooth: '#28a86b' };
function markerIcon(color) { return L.divIcon({ className: 'port-marker-wrap', html: `<span class="port-marker" style="background:${color}"></span>`, iconSize: [22, 22], iconAnchor: [11, 11] }); }

const driverMap = L.map('driverMap', { zoomControl: false, scrollWheelZoom: true }).setView([35.108, 129.070], 12);
L.control.zoom({ position: 'topright' }).addTo(driverMap);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(driverMap);
const driverGates = [
  { name: '북항 게이트', point: [35.1118, 129.0461], color: colors.congested },
  { name: '신선대 게이트', point: [35.1125, 129.0910], color: colors.caution },
  { name: '감만부두 게이트', point: [35.1036, 129.0978], color: colors.smooth },
];
driverGates.forEach((gate) => L.marker(gate.point, { icon: markerIcon(gate.color) }).addTo(driverMap).bindTooltip(gate.name, { permanent: true, direction: 'top', offset: [0, -10] }));
const routeMap = L.map('routeMap', { zoomControl: false, scrollWheelZoom: false }).setView([35.108, 129.070], 12);
L.control.zoom({ position: 'topright' }).addTo(routeMap);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(routeMap);
driverGates.forEach((gate) => L.marker(gate.point, { icon: markerIcon(gate.color) }).addTo(routeMap).bindTooltip(gate.name, { permanent: true, direction: 'top', offset: [0, -10] }));
let driverLocationMarker;
let routeLocationMarker;
let routeLine;
window.refreshRouteMap = () => routeMap.invalidateSize();
window.updateDriverMapPosition = (latitude, longitude) => {
  const point = [latitude, longitude];
  if (driverLocationMarker) driverLocationMarker.setLatLng(point);
  else driverLocationMarker = L.marker(point, { icon: markerIcon('#1576d2') }).addTo(driverMap).bindPopup('<b>현재 위치</b>');
  if (routeLocationMarker) routeLocationMarker.setLatLng(point);
  else routeLocationMarker = L.marker(point, { icon: markerIcon('#1576d2') }).addTo(routeMap).bindPopup('<b>현재 위치</b>');
  driverLocationMarker.openPopup(); driverMap.flyTo(point, 14, { duration: 0.8 });
  document.getElementById('driverMapHint').textContent = '파란 점이 현재 위치입니다. 게이트 색상과 대기시간을 비교하세요.';
};
window.drawRecommendedRoute = (vertices) => {
  if (!Array.isArray(vertices) || vertices.length < 4) return;
  const points = [];
  for (let index = 0; index < vertices.length; index += 2) points.push([vertices[index + 1], vertices[index]]);
  if (routeLine) routeLine.remove();
  routeLine = L.polyline(points, { color: '#1576d2', weight: 6, opacity: 0.9 }).addTo(routeMap);
  routeMap.fitBounds(routeLine.getBounds(), { padding: [28, 28] });
};
driverMap.on('click', (event) => window.setAppOrigin?.(event.latlng.lat, event.latlng.lng, '지도를 눌러 현재 위치를 설정했습니다.'));
