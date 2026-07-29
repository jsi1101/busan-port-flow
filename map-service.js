const colors = { gate: '#174a7c' };
const markerIcon = (color) => L.divIcon({
  className: 'port-marker-wrap',
  html: `<span class="port-marker" style="background:${color}"></span>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

const driverGates = [
  { id: 'sinseondae', name: 'BPT \uc2e0\uc120\ub300\ubd80\ub450', point: [35.1125, 129.0910] },
  { id: 'gamman', name: 'BPT \uac10\ub9cc\ubd80\ub450', point: [35.1036, 129.0978] },
  { id: 'pnit', name: 'PNIT', point: [35.0735, 128.8300] },
  { id: 'pnc', name: 'PNC', point: [35.0760, 128.8120] },
  { id: 'hjnc', name: 'HJNC', point: [35.0750, 128.7980] },
  { id: 'hpnt', name: 'HPNT', point: [35.0750, 128.7890] },
  { id: 'bnct', name: 'BNCT', point: [35.0760, 128.7810] },
  { id: 'bct', name: 'BCT', point: [35.0770, 128.7720] },
  { id: 'dgt', name: 'DGT', point: [35.0830, 128.7590] }
];

function baseMap(id, interactive = true) {
  const map = L.map(id, { zoomControl: false, scrollWheelZoom: interactive }).setView([35.09, 128.93], 10);
  L.control.zoom({ position: 'topright' }).addTo(map);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  driverGates.forEach((gate) => {
    L.marker(gate.point, { icon: markerIcon(colors.gate) }).addTo(map).bindTooltip(gate.name, { permanent: true, direction: 'top' });
  });
  return map;
}

const driverMap = baseMap('driverMap');
const routeMap = baseMap('routeMap', false);
const navigationMap = baseMap('navigationMap', false);
let routeLines = [];
let navigationLines = [];
let driverLocationMarker;
let navigationLocationMarker;
let liveLocationWatchId;
let activeNavigationGate;

function clear(lines) {
  lines.forEach((line) => line.remove());
  return [];
}

function trafficPath(map, points, isNavigation = false) {
  const lines = clear(isNavigation ? navigationLines : routeLines);
  const palette = ['#28a86b', '#f4ad32', '#eb4b4b'];
  for (let index = 0; index < points.length - 1; index += 1) {
    lines.push(L.polyline([points[index], points[index + 1]], {
      color: palette[Math.min(index, palette.length - 1)],
      weight: isNavigation ? 9 : 6,
      opacity: 0.95
    }).addTo(map));
  }
  if (isNavigation) navigationLines = lines;
  else routeLines = lines;
  const group = L.featureGroup(lines);
  if (lines.length) map.fitBounds(group.getBounds(), { padding: [28, 28] });
}

function setCurrentLocation(lat, lng, followNavigation = false) {
  const point = [lat, lng];
  if (driverLocationMarker) driverLocationMarker.setLatLng(point);
  else driverLocationMarker = L.marker(point, { icon: markerIcon('#1576d2'), zIndexOffset: 1000 }).addTo(driverMap).bindTooltip('\ub0b4 \uc704\uce58', { direction: 'top' });

  if (navigationLocationMarker) navigationLocationMarker.setLatLng(point);
  else navigationLocationMarker = L.marker(point, { icon: markerIcon('#1576d2'), zIndexOffset: 1000 }).addTo(navigationMap).bindTooltip('\ud604\uc7ac \uc704\uce58', { direction: 'top' });

  if (followNavigation) navigationMap.flyTo(point, 14, { animate: true, duration: 0.7 });
}

function navigationRoute(gate, start, fit = true) {
  const first = [(start[0] * 2 + gate.point[0]) / 3, (start[1] * 2 + gate.point[1]) / 3];
  const second = [(start[0] + gate.point[0] * 2) / 3, (start[1] + gate.point[1] * 2) / 3];
  trafficPath(navigationMap, [start, first, second, gate.point], true);
  if (!fit) navigationMap.panTo(start, { animate: true });
}

function setNavigationInstruction(message) {
  const instruction = document.getElementById('navigationInstruction');
  if (instruction) instruction.textContent = message;
}

window.refreshRouteMap = () => routeMap.invalidateSize();
window.updateDriverMapPosition = (lat, lng) => {
  setCurrentLocation(lat, lng);
  driverMap.flyTo([lat, lng], 12);
};

window.drawRecommendedRoute = (vertices) => {
  if (!vertices?.length) return;
  const start = [vertices[1], vertices[0]];
  const end = [vertices[vertices.length - 1], vertices[vertices.length - 2]];
  const middle = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
  trafficPath(routeMap, [start, middle, end]);
};

window.startLiveNavigation = () => {
  if (liveLocationWatchId !== undefined) return;
  if (!navigator.geolocation) {
    setNavigationInstruction('\uc774 \uae30\uae30\uc5d0\uc11c\ub294 \uc704\uce58 \uc11c\ube44\uc2a4\ub97c \uc9c0\uc6d0\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.');
    return;
  }
  setNavigationInstruction('\ud604\uc7ac \uc704\uce58\ub97c \uc2e4\uc2dc\uac04 \ucd94\uc801 \uc911\uc785\ub2c8\ub2e4. \uc548\uc804\ud55c \uacf3\uc5d0\uc11c \ud655\uc778\ud558\uc138\uc694.');
  liveLocationWatchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      setCurrentLocation(latitude, longitude, true);
      if (activeNavigationGate) navigationRoute(activeNavigationGate, [latitude, longitude], false);
    },
    () => {
      liveLocationWatchId = undefined;
      setNavigationInstruction('\uc704\uce58 \uad8c\ud55c\uc744 \ud5c8\uc6a9\ud558\uba74 \uc9c0\ub3c4\uc5d0 \ud604\uc7ac \uc704\uce58\uac00 \uc2e4\uc2dc\uac04\uc73c\ub85c \ud45c\uc2dc\ub429\ub2c8\ub2e4.');
    },
    { enableHighAccuracy: true, maximumAge: 3000, timeout: 12000 }
  );
};

window.stopLiveNavigation = () => {
  if (liveLocationWatchId === undefined) return;
  navigator.geolocation.clearWatch(liveLocationWatchId);
  liveLocationWatchId = undefined;
};

window.showNavigationGuide = () => {
  const gate = driverGates.find((item) => item.id === (window.selectedGateId || window.bestGateId)) || driverGates[0];
  const estimate = window.gateEstimates?.[gate.id];
  const origin = document.getElementById('originInput').value.split(',').map(Number);
  activeNavigationGate = gate;

  document.getElementById('navigationGateName').textContent = `${gate.name}\ub85c \uc774\ub3d9\ud558\uc138\uc694`;
  document.getElementById('navigationSummary').textContent = estimate
    ? `\uc774\ub3d9 ${estimate.duration}\ubd84 + \uac8c\uc774\ud2b8 \ub300\uae30 ${estimate.wait}\ubd84 = \ucd1d ${estimate.total}\ubd84`
    : 'STEP 2\uc5d0\uc11c \uacbd\ub85c\ub97c \uacc4\uc0b0\ud558\uc138\uc694.';
  navigationMap.invalidateSize();
  if (origin.length === 2 && Number.isFinite(origin[0]) && Number.isFinite(origin[1])) {
    navigationRoute(gate, [origin[1], origin[0]]);
  }
  window.startLiveNavigation();
};

driverMap.on('click', (event) => window.setAppOrigin?.(event.latlng.lat, event.latlng.lng, '\uc9c0\ub3c4\ub97c \ub20c\ub7ec \ud604\uc7ac \uc704\uce58\ub97c \uc124\uc815\ud588\uc2b5\ub2c8\ub2e4.'));
