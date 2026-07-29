const defaultGates = [
  { id: 'sinseondae', name: 'BPT 신선대부두', wait: 8 }, { id: 'gamman', name: 'BPT 감만부두', wait: 5 },
  { id: 'pnit', name: 'PNIT 부산신항국제터미널', wait: 10 }, { id: 'pnc', name: 'PNC 부산신항만', wait: 7 },
  { id: 'hjnc', name: 'HJNC 한진부산컨테이너터미널', wait: 9 }, { id: 'hpnt', name: 'HPNT 현대부산신항터미널', wait: 6 },
  { id: 'bnct', name: 'BNCT 부산신항컨테이너터미널', wait: 11 }, { id: 'bct', name: 'BCT 부산컨테이너터미널', wait: 7 },
  { id: 'dgt', name: 'DGT 동원글로벌터미널', wait: 8 },
];
function getGates() { const saved = JSON.parse(localStorage.getItem('busanPortGates') || 'null'); return saved?.length >= 9 ? saved : defaultGates; }
function showScreen(name) {
  ['home','notice','report','location','route','navigation'].forEach((screen) => document.getElementById(`${screen}Screen`).hidden = screen !== name);
  if (name === 'location') setTimeout(() => driverMap.invalidateSize(), 0);
  if (name === 'route') setTimeout(() => { window.refreshRouteMap?.(); window.getRecommendedRoute?.(); }, 0);
  if (name === 'navigation') setTimeout(() => window.showNavigationGuide?.(), 0);
  if (name === 'report') renderReports();
}
window.navigateAppScreen = showScreen;
function renderGates() { document.getElementById('gateCards').innerHTML = getGates().map((gate) => { const estimate = window.gateEstimates?.[gate.id]; const best = window.bestGateId === gate.id; const selected = window.selectedGateId === gate.id; const label = `${best ? '★ 최적 경로' : ''}${best && selected ? ' · ' : ''}${selected ? '✓ 선택한 길안내' : ''}${!best && !selected ? '탭하여 이 게이트 선택' : ''}`; const cityBenefit = estimate?.cityBenefit ? `<p class="city-benefit">${estimate.cityBenefit}</p>` : ''; return `<article class="app-gate-card" data-gate-id="${gate.id}" style="cursor:pointer;${selected ? 'border:3px solid #102b4e;background:#eaf5ff;' : best ? 'border:2px solid #1576d2;background:#eef7ff;' : ''}"><div><small>${label}</small><h3>${gate.name}</h3><p>${estimate ? `이동 ${estimate.duration}분 + 예상 대기 ${estimate.wait}분` : '위치를 설정하면 총 소요시간을 계산합니다'}</p>${cityBenefit}</div><strong>${estimate ? estimate.total : '-'}<em>${estimate ? '분' : ''}</em></strong></article>`; }).join(''); document.querySelectorAll('[data-gate-id]').forEach((card) => card.onclick = () => window.selectGateRoute?.(card.dataset.gateId)); }
const renderGateCards = renderGates;
function renderGatesOrdered() {
  renderGateCards();
  const bestCard = document.querySelector(`[data-gate-id="${window.bestGateId}"]`);
  if (bestCard) document.getElementById('gateCards').prepend(bestCard);
}
window.renderGates = renderGatesOrdered; renderGatesOrdered();
document.getElementById('startRouteButton').onclick = () => showScreen('location');
document.getElementById('noticeButton').onclick = () => showScreen('notice');
document.getElementById('reportButton').onclick = () => showScreen('report');
document.getElementById('toRouteButton').onclick = () => showScreen('route');
window.routePreference = 'fast';
document.querySelectorAll('.route-mode-button').forEach((button) => button.onclick = () => { window.routePreference = button.dataset.routeMode; document.querySelectorAll('.route-mode-button').forEach((item) => item.classList.toggle('active', item === button)); document.getElementById('routeModeDescription').textContent = window.routePreference === 'city' ? '도심 혼잡·주거지역 통과를 줄이고 항만 전용도로 우선 경로를 추천합니다.' : '이동시간과 게이트 대기시간이 가장 짧은 경로를 추천합니다.'; window.getRecommendedRoute?.(); });
document.getElementById('backToLocationButton').onclick = () => showScreen('location');
document.getElementById('startNavigationButton').onclick = () => showScreen('navigation');
document.getElementById('backToRouteButton').onclick = () => showScreen('route');
document.querySelectorAll('.home-return').forEach((button) => button.onclick = () => showScreen('home'));
const defaultReports = [{ message: '[BPT 신선대부두] 진입로 대기줄이 길어지고 있습니다.', time: '7분 전' },{ message: '[BPT 감만부두] 게이트 앞 도로 흐름이 원활합니다.', time: '18분 전' }];
function getReports() { return JSON.parse(localStorage.getItem('busanPortReports') || 'null') || defaultReports; }
function renderReports() { document.getElementById('reportFeed').innerHTML = getReports().map((report) => `<article style="padding-top:11px;border-top:1px solid #e5ebf1"><b style="display:block;font-size:14px;color:#102b4e">${report.message}</b><small style="display:block;margin-top:4px;color:#68778a">부산항 이용 기사 · ${report.time}</small></article>`).join(''); }
function relativeReportTime(reportedAt, fallback) {
  if (!reportedAt) return fallback || '\ucd5c\uadfc';
  const minutes = Math.max(0, Math.floor((Date.now() - reportedAt) / 60000));
  if (minutes < 1) return '\ubc29\uae08 \uc804';
  if (minutes < 60) return `${minutes}\ubd84 \uc804`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}\uc2dc\uac04 \uc804`;
  return `${Math.floor(minutes / 1440)}\uc77c \uc804`;
}
setTimeout(() => {
  renderReports = () => {
    document.getElementById('reportFeed').innerHTML = getReports().map((report) =>
      `<article style="padding-top:11px;border-top:1px solid #e5ebf1"><b style="display:block;font-size:14px;color:#102b4e">${report.message}</b><small style="display:block;margin-top:4px;color:#68778a">\ucd5c\uadfc \ud604\uc7a5 \uc81c\ubcf4 \u00b7 ${relativeReportTime(report.reportedAt, report.time)}</small></article>`
    ).join('');
  };
  document.getElementById('submitReportButton').onclick = () => {
    const custom = document.getElementById('customReportInput').value.trim();
    const isOther = selectedReportType === '\uae30\ud0c0';
    if (!selectedReportGate || !selectedReportType || (isOther && !custom)) return alert('\uac8c\uc774\ud2b8\uc640 \uc0c1\ud669\uc744 \uc120\ud0dd\ud55c \ud6c4 \uc81c\ubcf4\ub97c \ub4f1\ub85d\ud574 \uc8fc\uc138\uc694.');
    const reports = getReports();
    reports.unshift({ message: `[${selectedReportGate}] ${isOther ? custom : selectedReportType}`, reportedAt: Date.now() });
    localStorage.setItem('busanPortReports', JSON.stringify(reports.slice(0, 6)));
    renderReports();
    alert('\ud604\uc7a5 \uc81c\ubcf4\uac00 \ub4f1\ub85d\ub418\uc5c8\uc2b5\ub2c8\ub2e4.');
  };
  renderReports();
  setInterval(() => { if (!document.getElementById('reportScreen').hidden) renderReports(); }, 30000);
}, 0);
let selectedReportGate = '', selectedReportType = '';
document.querySelectorAll('.report-gate').forEach((button) => button.onclick = () => { selectedReportGate = button.dataset.gate; document.querySelectorAll('.report-gate').forEach((item) => item.style.cssText=''); button.style.cssText='background:#eaf5ff;color:#1576d2;border-color:#1576d2'; });
document.querySelectorAll('.report-type').forEach((button) => button.onclick = () => { selectedReportType = button.dataset.report; document.getElementById('customReportInput').style.display = selectedReportType === '기타' ? 'block' : 'none'; });
document.getElementById('submitReportButton').onclick = () => { const custom=document.getElementById('customReportInput').value.trim(); if(!selectedReportGate || !selectedReportType || (selectedReportType === '기타' && !custom)) { alert('게이트와 상황을 선택하고, 기타는 내용을 입력하세요.'); return; } const reports=getReports(); reports.unshift({message:`[${selectedReportGate}] ${selectedReportType === '기타' ? custom : selectedReportType}`,time:'방금 전'}); localStorage.setItem('busanPortReports',JSON.stringify(reports.slice(0,6))); renderReports(); alert('현장 제보가 등록되었습니다.'); };
