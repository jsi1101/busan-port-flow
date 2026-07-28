const toast = document.getElementById('toast');
const defaultGates = [
  { id: 'north', name: '북항 게이트', wait: 12, vehicles: 14, available: true },
  { id: 'sinseondae', name: '신선대 게이트', wait: 8, vehicles: 9, available: true },
  { id: 'gamman', name: '감만부두 게이트', wait: 5, vehicles: 4, available: true },
];
function getGates() { return JSON.parse(localStorage.getItem('busanPortGates') || 'null') || defaultGates; }
function showScreen(name) {
  document.getElementById('locationScreen').hidden = name !== 'location';
  document.getElementById('routeScreen').hidden = name !== 'route';
  document.querySelectorAll('.app-screen').forEach((screen) => screen.classList.toggle('active', screen.id === `${name}Screen`));
  document.querySelectorAll('.app-nav').forEach((button) => button.classList.toggle('active', button.dataset.screen === name));
  if (name === 'location') setTimeout(() => driverMap.invalidateSize(), 0);
  if (name === 'route') setTimeout(() => window.refreshRouteMap?.(), 0);
}
window.navigateAppScreen = showScreen;
function renderGates() {
  document.getElementById('gateCards').innerHTML = getGates().map((gate) => {
    const color = gate.wait > 30 ? 'red' : gate.wait >= 10 ? 'yellow' : 'green';
    const label = gate.wait > 30 ? '혼잡' : gate.wait >= 10 ? '주의' : '원활';
    return `<article class="app-gate-card"><span class="status-dot ${color}"></span><div><small>${label} · 예상</small><h3>${gate.name}</h3><p>예상 대기 차량 ${gate.vehicles}대</p></div><strong>${gate.wait}<em>분</em></strong></article>`;
  }).join('');
}
renderGates();
document.querySelectorAll('.app-nav').forEach((button) => button.addEventListener('click', () => showScreen(button.dataset.screen)));
document.getElementById('toRouteButton').addEventListener('click', () => showScreen('route'));
document.getElementById('backToLocationButton').addEventListener('click', () => showScreen('location'));
