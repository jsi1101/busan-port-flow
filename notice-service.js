(() => {
  const notices = [
    ['BPT 신선대부두','혼잡','반입 가능','07:00~09:00 혼잡 예상','09:30 이후 진입 권장'],
    ['BPT 감만부두','원활','반입 가능','현재 특이사항 없음','현재 출발 가능'],
    ['PNIT','주의','반입 가능','오후 반입 차량 증가 예상','14:00 이전 진입 권장'],
    ['PNC','원활','반입 가능','현재 특이사항 없음','현재 출발 가능'],
    ['HJNC','주의','확인 필요','작업 상황에 따라 지연 가능','출발 전 현장 제보 확인'],
    ['HPNT','원활','반입 가능','야간 반입 시간 확인 필요','예약 시간에 맞춰 진입'],
    ['BNCT','혼잡','반입 가능','진입로 대기열 증가 예상','도심 우회 경로 권장'],
    ['BCT','주의','반입 가능','게이트 처리량 변동 가능','예상 대기시간 확인'],
    ['DGT','원활','반입 가능','현재 특이사항 없음','현재 출발 가능']
  ];
  const screen=document.getElementById('noticeScreen'); if(!screen) return;
  const back=screen.querySelector('.home-return');
  const list=document.createElement('div'); list.className='notice-list'; list.style.cssText='display:grid;gap:12px;margin-top:24px';
  list.innerHTML=notices.map(([gate,status,entry,forecast,guide])=>`<article style="padding:18px;border-radius:18px;background:#fff;border:1px solid #dfe7ef;box-shadow:0 4px 12px #17395c12"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><strong style="font-size:22px;color:#102b4e">${gate}</strong><b style="padding:6px 9px;border-radius:20px;background:${status==='혼잡'?'#ffe5e5':status==='주의'?'#fff4d6':'#e4f6ed'};color:${status==='혼잡'?'#c83e3e':status==='주의'?'#a36a00':'#18764d'};font-size:12px">${status}</b></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:14px;font-size:12px"><span style="padding:9px;background:#f5f8fb;border-radius:9px">반입 상태<br><b>${entry}</b></span><span style="padding:9px;background:#f5f8fb;border-radius:9px">혼잡 예보<br><b>${forecast}</b></span></div><p style="margin:12px 0 0;color:#1576d2;font-weight:800;font-size:13px">▶ ${guide}</p></article>`).join('');
  screen.querySelectorAll('.notice-card,.notice-list').forEach((item)=>item.remove());
  screen.insertBefore(list,back);
})();
