const defaultGates = [
  { id: 'north', name: '북항 게이트', wait: 45, vehicles: 38, available: false },
  { id: 'sinseondae', name: '신선대 게이트', wait: 20, vehicles: 17, available: true },
  { id: 'gamman', name: '감만부두 게이트', wait: 5, vehicles: 4, available: true },
];

const savedGates = JSON.parse(localStorage.getItem('busanPortGates') || 'null') || defaultGates;
const gateFields = document.getElementById('gateFields');

gateFields.innerHTML = savedGates.map((gate) => `
  <section class="admin-card">
    <h2>${gate.name}</h2>
    <label>예상 대기시간(분)<input type="number" min="0" max="180" name="wait-${gate.id}" value="${gate.wait}" required /></label>
    <label>대기 차량 수(대)<input type="number" min="0" max="500" name="vehicles-${gate.id}" value="${gate.vehicles}" required /></label>
    <label class="check-label"><input type="checkbox" name="available-${gate.id}" ${gate.available ? 'checked' : ''} /> 입차 가능</label>
  </section>
`).join('');

document.getElementById('gateForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const gates = savedGates.map((gate) => ({
    ...gate,
    wait: Number(form.get(`wait-${gate.id}`)),
    vehicles: Number(form.get(`vehicles-${gate.id}`)),
    available: form.get(`available-${gate.id}`) === 'on',
  }));
  localStorage.setItem('busanPortGates', JSON.stringify(gates));
  document.getElementById('saveMessage').textContent = '저장 완료! 기사 화면을 새로고침하면 반영됩니다.';
});
