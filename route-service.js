const gateCoordinates = {
  north: '129.0440,35.1120',
  sinseondae: '129.0900,35.1110',
  gamman: '129.0990,35.1050',
};

async function getRecommendedRoute() {
  const input = document.getElementById('originInput');
  const result = document.getElementById('routeResult');
  const origin = input.value.trim();
  if (!/^\d+(\.\d+)?,\d+(\.\d+)?$/.test(origin)) {
    result.textContent = '출발지 좌표를 “경도,위도” 형식으로 입력하세요. 예: 129.045,35.105';
    return;
  }

  const gates = JSON.parse(localStorage.getItem('busanPortGates') || 'null') || defaultGates;
  result.textContent = '최적 경로를 계산하고 있습니다…';
  try {
    const attempts = await Promise.allSettled(gates.map(async (gate) => {
      const response = await fetch('/api/directions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination: gateCoordinates[gate.id] }),
      });
      if (!response.ok) throw new Error('경로 API가 아직 설정되지 않았습니다.');
      return { gate, ...(await response.json()) };
    }));
    const routes = attempts.filter((attempt) => attempt.status === 'fulfilled').map((attempt) => attempt.value);
    if (!routes.length) throw new Error('계산 가능한 게이트 경로가 없습니다.');
    window.gateTravelTimes = Object.fromEntries(routes.map((route) => [route.gate.id, route.durationMinutes]));
    window.renderGates?.();
    const best = [...routes].sort((a, b) => a.durationMinutes - b.durationMinutes)[0];
    result.textContent = `최적 경로: ${best.gate.name} · 약 ${best.durationMinutes}분 소요`;
    document.getElementById('recommendationTitle').textContent = `${best.gate.name}로 이동하세요`;
    window.drawRecommendedRoute?.(best.path);
  } catch (error) {
    result.textContent = '카카오 길찾기 API 키가 설정되면 실시간 우회 경로가 표시됩니다.';
  }
}

window.setAppOrigin = (latitude, longitude, message = '현재 위치를 입력했습니다.') => {
  document.getElementById('originInput').value = `${longitude.toFixed(6)},${latitude.toFixed(6)}`;
  window.updateDriverMapPosition?.(latitude, longitude);
  document.getElementById('recommendationTitle').textContent = '현재 위치를 확인했습니다';
  document.getElementById('driverMapHint').textContent = message;
  document.getElementById('routeResult').textContent = '현재 위치가 설정되었습니다. 추천 경로 화면에서 경로 계산을 눌러주세요.';
  // 지도에서 위치를 누르거나 GPS 위치를 받으면 즉시 세 게이트 경로를 다시 계산합니다.
  setTimeout(getRecommendedRoute, 0);
};

document.getElementById('routeSearchButton')?.addEventListener('click', getRecommendedRoute);

function loadCurrentLocation() {
  const result = document.getElementById('routeResult');
  if (!navigator.geolocation) { result.textContent = '이 기기에서는 위치 기능을 지원하지 않습니다.'; return; }
  result.textContent = '현재 위치를 확인하고 있습니다…';
  navigator.geolocation.getCurrentPosition((position) => {
    window.setAppOrigin(position.coords.latitude, position.coords.longitude, '파란 점이 현재 위치입니다. 추천 경로를 확인하세요.');
  }, () => { result.textContent = '위치 권한이 없으면 지도에서 현재 위치를 직접 눌러 설정할 수 있습니다.'; document.getElementById('driverMapHint').textContent = '지도에서 내 위치를 직접 누르면 파란 점으로 설정됩니다.'; }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
}

document.getElementById('locationButton')?.addEventListener('click', loadCurrentLocation);
document.getElementById('driverLocationButton')?.addEventListener('click', loadCurrentLocation);
