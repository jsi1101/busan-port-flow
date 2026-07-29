(() => {
  const notices = [
    ['BPT \uc2e0\uc120\ub300\ubd80\ub450', '\ud63c\uc7a1 \uc2dc\uac04\ub300 \uc548\ub0b4', '\ucd9c\ud1f4\uadfc \uc2dc\uac04\ub300\uc5d0\ub294 \uc9c4\uc785 \ucc28\ub7c9\uc774 \uc99d\uac00\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.'],
    ['BPT \uac10\ub9cc\ubd80\ub450', '\uc815\uc0c1 \uc6b4\uc601 \uc911', '\ucd9c\ubc1c \uc804 \ucd94\ucc9c \uacbd\ub85c\uc5d0\uc11c \uc608\uc0c1 \ub300\uae30\uc2dc\uac04\uc744 \ud655\uc778\ud558\uc138\uc694.'],
    ['PNIT', '\ubc18\uc785 \uc815\ubcf4 \ud655\uc778', '\ubc30\ucc28 \uc815\ubcf4\uc640 \ubc18\uc785 \uc2dc\uac04\uc744 \ud568\uaed8 \ud655\uc778\ud558\uc138\uc694.'],
    ['PNC', '\uc9c4\uc785\ub85c \uc548\ub0b4', '\ud2b8\ub7ed \uc9c4\uc785 \uc2dc \uc804\uc6a9\ucc28\ub85c\ub97c \uc6b0\uc120 \uc774\uc6a9\ud558\uc138\uc694.'],
    ['HJNC', '\uc6b4\uc601 \uc0c1\ud669 \ud655\uc778', '\uc791\uc5c5 \uc0c1\ud669\uc5d0 \ub530\ub77c \ub300\uae30\uc2dc\uac04\uc774 \ubcc0\ub3d9\ub420 \uc218 \uc788\uc2b5\ub2c8\ub2e4.'],
    ['HPNT', '\uc57c\uac04 \ubc18\uc785 \uc548\ub0b4', '\uc57c\uac04 \ubc18\uc785 \uac00\ub2a5 \uc2dc\uac04\uc740 \ud130\ubbf8\ub110 \uacf5\uc9c0\ub97c \ud655\uc778\ud558\uc138\uc694.'],
    ['BNCT', '\uc774\ub3d9 \uacbd\ub85c \uc548\ub0b4', '\uc8fc\ubcc0 \ub3c4\ub85c \ud63c\uc7a1 \uc2dc \ub3c4\uc2ec \uc9c4\uc785 \ucd5c\uc18c\ud654 \uacbd\ub85c\ub97c \uc774\uc6a9\ud558\uc138\uc694.'],
    ['BCT', '\ubc18\uc785 \uc6b4\uc601 \uc548\ub0b4', '\uac8c\uc774\ud2b8 \uc9c4\uc785 \uc804 \uc608\uc0c1 \ub300\uae30\uc2dc\uac04\uc744 \ud655\uc778\ud558\uc138\uc694.'],
    ['DGT', '\ud604\uc7a5 \uc0c1\ud669 \uc548\ub0b4', '\ud604\uc7a5 \uc81c\ubcf4\uc640 \uac8c\uc774\ud2b8 \uacf5\uc9c0\ub97c \ud568\uaed8 \ud655\uc778\ud558\uc138\uc694.']
  ];
  const screen = document.getElementById('noticeScreen');
  if (!screen) return;
  const heading = screen.querySelector('.app-title');
  const back = screen.querySelector('.home-return');
  const list = document.createElement('div');
  list.className = 'notice-list';
  list.style.cssText = 'display:grid;gap:11px;margin-top:24px';
  list.innerHTML = notices.map(([gate, title, body]) => `<article class="notice-card" style="padding:18px;border-radius:18px;background:#fff;border:1px solid #dfe7ef"><strong style="display:block;color:#102b4e;font-size:23px;letter-spacing:-1px">${gate}</strong><h2 style="margin:8px 0 5px;font-size:16px">${title}</h2><p style="margin:0;color:#68778a;font-size:13px;line-height:1.55">${body}</p></article>`).join('');
  screen.querySelectorAll('.notice-card').forEach((card) => card.remove());
  if (back) screen.insertBefore(list, back); else screen.appendChild(list);
})();
