const colors = { gate: '#174a7c' };
function markerIcon(color) { return L.divIcon({ className: 'port-marker-wrap', html: `<span class="port-marker" style="background:${color}"></span>`, iconSize: [22, 22], iconAnchor: [11, 11] }); }

const driverGates = [
  { id: 'north', name: '북항 게이트', point: [35.1118, 129.0461], color: colors.gate },
  { id: 'sinseondae', name: '신선대부두 게이트', point: [35.1125, 129.0910], color: colors.gate },
  { id: 'gamman', name: '감만부두 게이트', point: [35.1036, 129.0978], color: colors.gate },
];

function addBaseMap(elementId, interactive = true) {
  const map = L.map(elementId, { zoomControl: false, scrollWheelZoom: interactive }).setView([35.108, 129.070], 12);
  L.control.zoom({ position: 'topright' }).addTo(map);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
  driverGates.forEach((gate) => L.marker(gate.point, { icon: markerIcon(gate.color) }).addTo(map).bindTooltip(gate.name, { permanent: true, direction: 'top', offset: [0, -10] }));
  return map;
}

const driverMap = addBaseMap('driverMap');
const routeMap = addBaseMap('routeMap', false);
const navigationMap = addBaseMap('navigationMap', false);
let driverLocationMarker;
let routeLocationMarker;
let navigationLocationMarker;
let routeLine;
let navigationLine;

window.refreshRouteMap = () => routeMap.invalidateSize();
window.updateDriverMapPosition = (latitude, longitude) => {
  const point = [latitude, longitude];
  if (driverLocationMarker) driverLocationMarker.setLatLng(point);
  else driverLocationMarker = L.marker(point, { icon: markerIcon('#1576d2') }).addTo(driverMap).bindPopup('<b>현재 위치</b>');
  if (routeLocationMarker) routeLocationMarker.setLatLng(point);
  else routeLocationMarker = L.marker(point, { icon: markerIcon('#1576d2') }).addTo(routeMap).bindPopup('<b>현재 위치</b>');
  if (navigationLocationMarker) navigationLocationMarker.setLatLng(point);
  else navigationLocationMarker = L.marker(point, { icon: markerIcon('#1576d2') }).addTo(navigationMap).bindPopup('<b>현재 위치</b>');
  driverLocationMarker.openPopup();
  driverMap.flyTo(point, 14, { duration: 0.8 });
  document.getElementById('driverMapHint').textContent = '파란 점이 현재 위치입니다. 게이트별 예상 시간을 비교하세요.';
};

function pointsFromVertices(vertices) {
  const points = [];
  for (let index = 0; index < vertices.length; index += 2) points.push([vertices[index + 1], vertices[index]]);
  return points;
}

window.drawRecommendedRoute = (vertices) => {
  if (!Array.isArray(vertices) || vertices.length < 4) return;
  const points = pointsFromVertices(vertices);
  if (routeLine) routeLine.remove();
  routeLine = L.polyline(points, { color: '#1576d2', weight: 6, opacity: 0.9 }).addTo(routeMap);
  routeMap.fitBounds(routeLine.getBounds(), { padding: [28, 28] });
};

window.showNavigationGuide = () => {
  const gateId = window.bestGateId;
  const gate = driverGates.find((item) => item.id === gateId) || driverGates[0];
  const estimate = window.gateEstimates?.[gate.id];
  const origin = document.getElementById('originInput').value.split(',').map(Number);
  const hasOrigin = origin.length === 2 && origin.every(Number.isFinite);
  document.getElementById('navigationGateName').textContent = `${gate.name}로 이동하세요`;
  document.getElementById('navigationSubtitle').textContent = estimate ? `총 ${estimate.total}분 예상 · 이동 ${estimate.duration}분 + 게이트 대기 ${estimate.wait}분` : '추천 게이트까지 안전하게 이동하세요.';
  document.getElementById('navigationSummary').textContent = estimate ? `예상 이동 ${estimate.duration}분, 게이트 대기 ${estimate.wait}분을 포함해 총 ${estimate.total}분 걸립니다.` : 'STEP 2에서 경로를 계산하면 예상 시간이 표시됩니다.';
  document.getElementById('navigationInstruction').textContent = `${gate.name} 방향으로 이동 후, 게이트 진입 전 대기시간을 다시 확인하세요.`;
  navigationMap.invalidateSize();
  if (!hasOrigin) return;
  const start = [origin[1], origin[0]];
  if (navigationLocationMarker) navigationLocationMarker.setLatLng(start);
  else navigationLocationMarker = L.marker(start, { icon: markerIcon('#1576d2') }).addTo(navigationMap).bindPopup('<b>현재 위치</b>');
  if (navigationLine) navigationLine.remove();
  navigationLine = L.polyline([start, gate.point], { color: '#1576d2', weight: 7, opacity: 0.92 }).addTo(navigationMap);
  navigationMap.fitBounds(navigationLine.getBounds(), { padding: [28, 28] });
};

driverMap.on('click', (event) => window.setAppOrigin?.(event.latlng.lat, event.latlng.lng, '지도를 눌러 현재 위치를 설정했습니다.'));
