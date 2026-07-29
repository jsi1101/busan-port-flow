const gateCoordinates = {
  north: '129.0440,35.1120',
  sinseondae: '129.0900,35.1110',
  gamman: '129.0990,35.1050',
};

function makeFallbackRoutes(gates, origin) {
  const [originLongitude, originLatitude] = origin.split(',').map(Number);
  const radians = (value) => value * Math.PI / 180;
  const distanceKm = (latitude, longitude) => {
    const latitudeDelta = radians(latitude - originLatitude);
    const longitudeDelta = radians(longitude - originLongitude);
    const value = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(radians(originLatitude)) * Math.cos(radians(latitude)) * Math.sin(longitudeDelta / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
  };
  return gates.map((gate) => {
    const [longitude, latitude] = gateCoordinates[gate.id].split(',').map(Number);
    const kilometers = distanceKm(latitude, longitude);
    const durationMinutes = Math.max(3, Math.ceil((kilometers / 27) * 60 + 2));
    return { gate, durationMinutes, path: [originLongitude, originLatitude, longitude, latitude] };
  });
}

function showRouteEstimates(routes, result, isEstimated = false) {
  const routesWithTotals = routes.map((route) => ({ ...route, total: route.durationMinutes + route.gate.wait }));
  const best = [...routesWithTotals].sort((a, b) => a.total - b.total)[0];
  window.gateEstimates = Object.fromEntries(routesWithTotals.map((route) => [route.gate.id, { duration: route.durationMinutes, wait: route.gate.wait, total: route.total }]));
  window.bestGateId = best.gate.id;
  window.renderGates?.();
  result.textContent = `최적 경로: ${best.gate.name} · 이동 ${best.durationMinutes}분 + 예상 대기 ${best.gate.wait}분 = 총 ${best.total}분${isEstimated ? ' (예상)' : ''}`;
  document.getElementById('recommendationTitle').textContent = '세 게이트 중 최적 경로를 강조했어요';
  window.drawRecommendedRoute?.(best.path);
}

async function getRecommendedRoute() {
  const input = document.getElementById('originInput');
  const result = document.getElementById('routeResult');
  const origin = input.value.trim();
  if (!/^\d+(\.\d+)?,\d+(\.\d+)?$/.test(origin)) {
    result.textContent = '출발지 좌표를 “경도,위도” 형식으로 입력하세요. 예: 129.045,35.105';
    return;
  }
  const gates = JSON.parse(localStorage.getItem('busanPortGates') || 'null') || defaultGates;
  try {
    const attempts = await Promise.allSettled(gates.map(async (gate) => {
      const response = await fetch('/api/directions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination: gateCoordinates[gate.id] }),
      });
      if (!response.ok) throw new Error('경로 API 응답 오류');
      return { gate, ...(await response.json()) };
    }));
    const routes = attempts.filter((attempt) => attempt.status === 'fulfilled').map((attempt) => attempt.value);
    if (!routes.length) throw new Error('계산 가능한 API 경로 없음');
    showRouteEstimates(routes, result);
  } catch (error) {
    // API 키 또는 네트워크가 없어도 위치별 예상 시간을 화면에 보여줍니다.
    showRouteEstimates(makeFallbackRoutes(gates, origin), result, true);
  }
}

window.getRecommendedRoute = getRecommendedRoute;

window.setAppOrigin = (latitude, longitude, message = '현재 위치를 입력했습니다.') => {
  document.getElementById('originInput').value = `${longitude.toFixed(6)},${latitude.toFixed(6)}`;
  window.updateDriverMapPosition?.(latitude, longitude);
  document.getElementById('recommendationTitle').textContent = '현재 위치를 확인했습니다';
  document.getElementById('driverMapHint').textContent = message;
  setTimeout(getRecommendedRoute, 0);
};

document.getElementById('routeSearchButton')?.addEventListener('click', getRecommendedRoute);

function loadCurrentLocation() {
  const result = document.getElementById('routeResult');
  if (!navigator.geolocation) { result.textContent = '이 기기에서는 위치 기능을 지원하지 않습니다.'; return; }
  navigator.geolocation.getCurrentPosition((position) => {
    window.setAppOrigin(position.coords.latitude, position.coords.longitude, '파란 점이 현재 위치입니다. 추천 경로를 확인하세요.');
  }, () => {
    result.textContent = '위치 권한이 없으면 지도에서 현재 위치를 직접 눌러 설정할 수 있습니다.';
    document.getElementById('driverMapHint').textContent = '지도에서 현재 위치를 직접 누르면 출발지로 설정됩니다.';
  }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
}

document.getElementById('locationButton')?.addEventListener('click', loadCurrentLocation);
document.getElementById('driverLocationButton')?.addEventListener('click', loadCurrentLocation);
