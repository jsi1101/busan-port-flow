const statusLabel = { congested: '혼잡', caution: '주의', smooth: '원활', unknown: '정보 없음' };
const statusClass = { congested: 'red', caution: 'yellow', smooth: 'green', unknown: 'yellow' };

function renderRoadStatus(roads) {
  const list = document.querySelector('.status-list');
  if (!list) return;
  list.innerHTML = roads.map((road) => `
    <li><span><i class="status-dot ${statusClass[road.status]}"></i>${road.name}</span>
    <b>${road.speed === null ? statusLabel[road.status] : `${statusLabel[road.status]} · ${road.speed}km/h`}</b></li>
  `).join('');
}

async function loadLiveTraffic() {
  try {
    const response = await fetch('/api/traffic');
    if (!response.ok) throw new Error('실시간 API가 아직 설정되지 않았습니다.');
    const data = await response.json();
    renderRoadStatus(data.roads);
    const updatedTime = document.getElementById('updatedTime');
    if (updatedTime) updatedTime.textContent = 'ITS 실시간 반영';
  } catch (error) {
    // GitHub Pages에서 서버가 없거나 인증키 설정 전에는 기존 시제품 상태를 유지합니다.
    console.info(error.message);
  }
}

loadLiveTraffic();
setInterval(loadLiveTraffic, 60_000);
