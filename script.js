const toast = document.getElementById('toast');
const defaultGates = [
  { id: 'north', name: '북항 게이트', wait: 12, vehicles: 14, available: true },
  { id: 'sinseondae', name: '신선대 게이트', wait: 8, vehicles: 9, available: true },
  { id: 'gamman', name: '감만부두 게이트', wait: 5, vehicles: 4, available: true },
];
function getGates() { return JSON.parse(localStorage.getItem('busanPortGates') || 'null') || defaultGates; }
function showScreen(name) {
  document.getElementById('homeScreen').hidden = name !== 'home';
  document.getElementById('noticeScreen').hidden = name !== 'notice';
  document.getElementById('reportScreen').hidden = name !== 'report';
  document.getElementById('locationScreen').hidden = name !== 'location';
  document.getElementById('routeScreen').hidden = name !== 'route';
  document.getElementById('navigationScreen').hidden = name !== 'navigation';
  document.querySelectorAll('.app-screen').forEach((screen) => screen.classList.toggle('active', screen.id === `${name}Screen`));
  document.querySelectorAll('.app-nav').forEach((button) => button.classList.toggle('active', button.dataset.screen === name));
  if (name === 'location') setTimeout(() => driverMap.invalidateSize(), 0);
  if (name === 'route') setTimeout(() => { window.refreshRouteMap?.(); window.getRecommendedRoute?.(); }, 0);
  if (name === 'navigation') setTimeout(() => window.showNavigationGuide?.(), 0);
  if (name === 'report') renderReports();
}
window.navigateAppScreen = showScreen;
function renderGates() {
  document.getElementById('gateCards').innerHTML = getGates().map((gate) => {
    const estimate = window.gateEstimates?.[gate.id];
    const isBest = window.bestGateId === gate.id;
    return `<article class="app-gate-card" style="${isBest ? 'border:2px solid #1576d2;background:#eef7ff;' : ''}"><div><small>${isBest ? '★ 최적 경로' : ''}</small><h3>${gate.name}</h3><p>${estimate ? `이동 ${estimate.duration}분 + 예상 대기 ${estimate.wait}분` : '위치를 설정하면 총 소요시간을 계산합니다'}</p></div><strong>${estimate ? estimate.total : '-'}<em>${estimate ? '분' : ''}</em></strong></article>`;
  }).join('');
}
window.renderGates = renderGates;
renderGates();
document.querySelectorAll('.app-nav').forEach((button) => button.addEventListener('click', () => showScreen(button.dataset.screen)));
document.getElementById('startRouteButton').addEventListener('click', () => showScreen('location'));
document.getElementById('noticeButton').addEventListener('click', () => {
  showScreen('notice');
});
const defaultReports = [
  { message: '신선대부두 진입로 대기줄이 길어지고 있습니다.', time: '7분 전' },
  { message: '감만부두 게이트 앞 도로 흐름은 현재 원활합니다.', time: '18분 전' },
];
function getReports() { return JSON.parse(localStorage.getItem('busanPortReports') || 'null') || defaultReports; }
function renderReports() {
  document.getElementById('reportFeed').innerHTML = getReports().map((report) => `<article style="padding-top:11px;border-top:1px solid #e5ebf1"><b style="display:block;font-size:14px;color:#102b4e">${report.message}</b><small style="display:block;margin-top:4px;color:#68778a">부산항 이용 기사 · ${report.time}</small></article>`).join('');
}
document.getElementById('reportButton').addEventListener('click', () => showScreen('report'));
document.querySelectorAll('.report-type').forEach((button) => button.addEventListener('click', () => {
  const reports = getReports();
  reports.unshift({ message: button.dataset.report, time: '방금 전' });
  localStorage.setItem('busanPortReports', JSON.stringify(reports.slice(0, 6)));
  renderReports();
  alert('현장 제보가 등록되었습니다. 다른 기사에게 공유됩니다.');
}));
document.querySelectorAll('.home-return').forEach((button) => button.addEventListener('click', () => showScreen('home')));
document.getElementById('toRouteButton').addEventListener('click', () => showScreen('route'));
document.getElementById('backToLocationButton').addEventListener('click', () => showScreen('location'));
document.getElementById('startNavigationButton').addEventListener('click', () => showScreen('navigation'));
document.getElementById('backToRouteButton').addEventListener('click', () => showScreen('route'));
