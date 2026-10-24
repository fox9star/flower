import { Game, REGIONS, QUESTS } from './engine.js';
import { Renderer } from './renderer.js';

const $ = (selector) => document.querySelector(selector);
const icon = (name) => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
const canvas = $('#game-canvas');
const modal = $('#modal');
const keys = {};
const touch = {};
let modalView = null, pausedBeforeModal = false, toastTimer, uiTimer = 0, lastFrame = 0;
let audioContext = null;
const log = [];
const game = new Game({ onEvent: handleEvent });
const renderer = new Renderer(canvas);
window.__flowerGame = game;

function handleEvent(event) {
  if (event.type === 'save') {
    $('#save-label').textContent = '모험이 저장되었어요';
    return;
  }
  if (event.text) {
    showToast(event.text);
    if (!['hit', 'attack', 'jump'].includes(event.type)) addLog(event.text);
  }
  playSound(event.type === 'attack' && event.skill ? 'skill' : event.type);
}

function unlockAudio() {
  if (!audioContext) {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (Audio) audioContext = new Audio();
  }
  if (audioContext?.state === 'suspended') audioContext.resume().catch(() => {});
}

function playSound(type) {
  if (!audioContext || audioContext.state !== 'running' || !game?.state.sound) return;
  const tones = { jump: [440, 660, .09], attack: [260, 110, .08], hit: [140, 75, .08], skill: [440, 880, .2], levelup: [523, 1047, .4], quest: [659, 988, .3], death: [220, 110, .3] };
  const tone = tones[type];
  if (!tone) return;
  const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
  oscillator.type = type === 'attack' ? 'triangle' : 'sine';
  oscillator.frequency.setValueAtTime(tone[0], audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(tone[1], audioContext.currentTime + tone[2]);
  gain.gain.setValueAtTime(.035, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + tone[2]);
  oscillator.connect(gain); gain.connect(audioContext.destination);
  oscillator.start(); oscillator.stop(audioContext.currentTime + tone[2]);
}

function showToast(message) {
  const element = $('#game-toast');
  element.textContent = message;
  element.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { element.hidden = true; }, 3500);
}

function addLog(message) {
  log.unshift(message);
  log.splice(3);
  const journal = $('#journal');
  journal.replaceChildren(...log.map((text, i) => {
    const p = document.createElement('p'), time = document.createElement('time'), span = document.createElement('span');
    time.textContent = i === 0 ? '지금' : '기록'; span.textContent = text;
    p.append(time, span); return p;
  }));
}

function regionArt(id) {
  const palette = id === 'meadow' ? ['#dbe8cc','#b8cba8','#8ca97b','#f0cf98','#c78969'] : id === 'forest' ? ['#d4e2d6','#a1beb1','#71958c','#bfc5a7','#bfc9a7'] : ['#dfdeea','#c2bfd3','#9999b8','#e1d9c2','#b4abc9'];
  return `<span class="region-art"><svg viewBox="0 0 140 110" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="140" height="110" fill="${palette[0]}"/><circle cx="108" cy="22" r="17" fill="#fff5d6" opacity=".6"/><path d="M-10 80Q35 5 75 68Q110 15 160 75V110H0Z" fill="${palette[1]}"/><path d="M-5 92Q30 53 65 82Q112 44 151 81V110H0Z" fill="${palette[2]}"/><path d="M0 100Q50 83 140 102V110H0Z" fill="${palette[1]}"/>${id === 'meadow' ? `<rect x="53" y="64" width="43" height="31" rx="3" fill="${palette[3]}"/><path d="M45 67Q54 38 73 35Q93 40 105 67Q81 72 45 67" fill="${palette[4]}"/><path d="M70 95V79q7-10 13 0v16" fill="#93a184"/><circle cx="61" cy="78" r="4" fill="#e9ead1"/><path d="M24 97V38" stroke="#7e997a" stroke-width="5"/><path d="M9 46Q2 21 22 19Q42 8 42 34Q49 56 9 46" fill="#9db88c"/>` : id === 'forest' ? `<path d="M24 104V23M112 106V7M77 97V20" stroke="#688d7e" stroke-width="7"/><path d="M-10 37Q-5 6 22 9Q44-3 49 27Q68 52 22 54Z" fill="#86ac99"/><path d="M83 34Q72 7 100 5Q122-9 143 14V53Q109 57 83 34" fill="#6f9886"/><circle cx="53" cy="68" r="2" fill="#eff6ba"/><circle cx="93" cy="46" r="2" fill="#eff6ba"/><circle cx="32" cy="80" r="2" fill="#eff6ba"/><circle cx="66" cy="49" r="1.5" fill="#eff6ba"/>` : `<path d="M44 99V55q0-33 26-33t26 33v44H82V56q0-18-12-18T58 56v43Z" fill="#d0ccda"/><path d="M42 54h18M80 54h18M40 98h20M80 98h20" stroke="#a8a6be" stroke-width="5"/><path d="M62 97V55q0-12 8-12t8 12v42" fill="#b8b6d1"/><path d="M65 69h10m-5-5v10" stroke="#eee8d4" stroke-width="2"/>`}<path d="M7 103v-8m3 1-5 1m105 7v-8m-3 1 6 1" stroke="#e8eacb" stroke-width="2"/></svg></span>`;
}

function regionCards() {
  return REGIONS.map((region, i) => {
    const unlocked = game.state.unlockedRegions.includes(region.id);
    const current = game.state.region === region.id;
    return `<button class="region-card" data-travel="${region.id}">${regionArt(region.id)}<span class="region-info"><span>CHAPTER 0${i + 1} · LV. ${region.level}+</span><h3>${region.name}</h3><p>${region.subtitle}</p></span><span class="region-status ${current ? 'current' : ''}">${current ? '현재 위치' : unlocked ? icon('arrow') : icon('lock') + '미발견'}</span></button>`;
  }).join('');
}

let regionSignature = '';
function updateUI() {
  const s = game.state, p = s.player;
  const region = REGIONS.find(r => r.id === s.region);
  const quest = QUESTS.find(q => q.id === s.quest.id) || QUESTS[0];
  $('#welcome-card').hidden = s.started;
  $('#pause-overlay').hidden = !s.started || !s.paused || modal.open;
  $('#game-stage').classList.toggle('is-started', s.started);
  $('#start-button').firstChild.textContent = p.level > 1 || s.totalKills > 0 ? '모험 이어하기 ' : '모험 시작하기 ';
  $('#region-label').textContent = region.name;
  $('.minimap-label').innerHTML = `${region.name} ${icon('expand')}`;
  $('#minimap-player').style.left = `${p.x / s.worldWidth * 95}%`;
  $('#hp-fill').style.width = `${p.hp / p.maxHp * 100}%`;
  $('#hp-text').textContent = `${Math.ceil(p.hp)} / ${p.maxHp}`;
  $('#mp-fill').style.width = `${p.mp / p.maxMp * 100}%`;
  $('#mp-text').textContent = `${Math.floor(p.mp)} / ${p.maxMp}`;
  $('#toolbar-level').textContent = `Lv. ${p.level}`;
  $('#profile-level').textContent = String(p.level).padStart(2, '0');
  $('#avatar-level').textContent = p.level;
  $('#profile-gold').innerHTML = `${icon('coin')} ${p.coins.toLocaleString('ko-KR')}`;
  const xpPercent = p.xp / p.xpNext * 100;
  $('#xp-fill').style.width = $('#profile-xp').style.width = `${xpPercent}%`;
  $('#xp-text').textContent = `EXP ${xpPercent.toFixed(1)}%`;
  $('#xp-remaining').textContent = `${p.xpNext - p.xp} EXP`;
  $('#potion-count').textContent = p.potions;
  $('#skill-cooldown').textContent = p.skillCooldown > 0 ? p.skillCooldown.toFixed(1) : '';
  $('#quest-chapter').textContent = String(QUESTS.indexOf(quest) + 1).padStart(2, '0');
  $('#quest-title').textContent = s.quest.claimed ? '피어난 모험의 끝' : quest.title;
  $('#quest-description').textContent = s.quest.claimed ? '정원의 수호자가 되었어요. 모든 지역에서 자유롭게 모험하세요.' : quest.description;
  $('#quest-objective-label').textContent = quest.boss ? '정원의 수호자 처치' : '몬스터 처치';
  $('#quest-progress').innerHTML = `${Math.min(s.quest.kills, s.quest.target)} <span>/ ${s.quest.target}</span>`;
  $('#quest-fill').style.width = `${Math.min(100, s.quest.kills / s.quest.target * 100)}%`;
  $('#quest-check').classList.toggle('complete', s.quest.kills >= s.quest.target);
  $('#quest-gold').textContent = quest.coins;
  $('#quest-xp').textContent = quest.xp;
  const ready = s.quest.kills >= s.quest.target && !s.quest.claimed;
  $('#quest-button').classList.toggle('ready', ready);
  $('#quest-button').innerHTML = `${s.quest.claimed ? '완료한 이야기 보기' : ready ? '보상 받기' : '퀘스트 자세히 보기'} ${icon('arrow')}`;
  $('#sound-toggle').innerHTML = icon(s.sound ? 'volume' : 'mute');
  $('#sound-toggle').setAttribute('aria-label', s.sound ? '소리 끄기' : '소리 켜기');
  $('#sound-toggle').setAttribute('aria-pressed', String(s.sound));
  $('#pause-button').innerHTML = icon(s.paused ? 'play' : 'pause');
  $('#pause-button').setAttribute('aria-label', s.paused ? '계속하기' : '일시 정지');
  if (!s.saveAvailable) $('#save-label').textContent = '이 브라우저에서는 저장할 수 없어요';
  const signature = `${s.region}:${s.unlockedRegions.join(',')}`;
  if (signature !== regionSignature) { $('#region-grid').innerHTML = regionCards(); regionSignature = signature; }
}

function openModal(view) {
  if (!modal.open) { pausedBeforeModal = game.state.paused; game.state.paused = true; modal.showModal(); }
  modalView = view;
  clearInputs();
  renderModal();
  updateUI();
}

function closeModal() {
  if (!modal.open) return;
  modal.close();
}

function renderModal() {
  const s = game.state, p = s.player;
  let content = '';
  if (modalView === 'map') {
    content = `<h2>마음이 이끄는 곳으로</h2><p class="modal-description">꽃바람 섬의 세 가지 이야기. 퀘스트를 완료하고 새로운 길을 열어보세요.</p><div class="modal-regions">${regionCards()}</div><div class="modal-callout">${icon('compass')} 열린 지역을 누르면 바로 이동해요. 필드 끝의 포털에서도 <kbd>E</kbd> 키로 다음 지역에 갈 수 있어요.</div>`;
  } else if (modalView === 'inventory') {
    content = `<h2>새싹 모험가의 가방</h2><p class="modal-description">작은 준비가 더 멋진 모험을 만들어줘요.</p><div class="inventory-stats"><div><span>레벨</span><strong>${p.level}</strong></div><div><span>공격력</span><strong>${p.attack}</strong></div><div><span>보유 골드</span><strong>${p.coins.toLocaleString('ko-KR')}</strong></div></div><div class="item-card"><span class="item-icon">${icon('sword')}</span><div><h3>꽃빛 검 +${p.weaponLevel - 1}</h3><p>강화하면 공격력이 8 증가해요.</p></div><button data-shop="upgrade" ${p.coins < p.weaponLevel * 80 || p.weaponLevel >= 10 ? 'disabled' : ''}>${p.weaponLevel >= 10 ? '최대 강화' : `${p.weaponLevel * 80} G · 강화`}</button></div><div class="item-card"><span class="item-icon">${icon('potion')}</span><div><h3>꽃잎 물약 · ${p.potions}개</h3><p>최대 HP의 65%와 MP 35 회복 <kbd>H</kbd></p></div><button data-shop="buyPotion" ${p.coins < 25 ? 'disabled' : ''}>25 G · 구매</button></div><div class="item-card"><span class="item-icon">${icon('spark')}</span><div><h3>꽃바람 베기</h3><p>전방의 적들을 공격해요.<br>MP 18 · 재사용 2.8초 · <kbd>X</kbd></p></div><span class="role-pill">기본 스킬</span></div><div class="modal-callout">몬스터를 물리치면 골드와 경험치를 얻어요. 레벨이 오르면 체력과 마나가 모두 회복돼요.</div>`;
  } else if (modalView === 'quests') {
    const quest = QUESTS.find(q => q.id === s.quest.id) || QUESTS[0];
    const ready = s.quest.kills >= s.quest.target && !s.quest.claimed;
    content = `<h2>당신이 피워낼 이야기</h2><p class="modal-description">정원지기 루미와 함께 꽃바람 섬에 평화를 되찾아주세요.</p><div class="modal-quest"><span class="eyebrow">CHAPTER ${String(QUESTS.indexOf(quest) + 1).padStart(2,'0')} / 03</span><h3>${s.quest.claimed ? '정원의 수호자, 바로 당신' : quest.title}</h3><p>${s.quest.claimed ? '모든 이야기를 완료했어요! 당신 덕분에 꽃바람 섬에 다시 꽃이 피었어요. 세 지역에서 자유롭게 모험을 이어가세요.' : quest.description}</p><div class="quest-objective"><span>${quest.boss ? '정원의 수호자' : '몬스터'} 처치</span><b>${Math.min(s.quest.kills,s.quest.target)} / ${s.quest.target}</b></div><div class="quest-meter"><i style="width:${Math.min(100,s.quest.kills/s.quest.target*100)}%"></i></div><div class="quest-rewards"><span>완료 보상</span><b>${icon('coin')} ${quest.coins}</b><b>EXP ${quest.xp}</b></div>${quest.unlock ? `<p>새로운 지역 · ${REGIONS.find(r => r.id === quest.unlock).name} 개방</p>` : ''}<button class="primary-button" id="claim-reward" ${ready ? '' : 'disabled'}>${s.quest.claimed ? '모든 이야기 완료' : ready ? '보상 받기' : '모험하며 목표를 완료해주세요'} ${icon(ready ? 'spark' : 'check')}</button></div><div class="modal-callout">${s.quest.completedCount} / 3 이야기 완료 · 누적 몬스터 ${s.totalKills}마리 처치<br>필드의 루미 가까이에서 <kbd>E</kbd> 키를 눌러도 대화하고 보상을 받을 수 있어요.</div>`;
  } else if (modalView === 'guide') {
    const rows = [['이동','← → / A D'],['이단 점프','Space / ↑ / W'],['검 공격','Z'],['꽃바람 스킬','X'],['대화 · 포털','E'],['체력 물약','H'],['캐릭터 · 가방','I'],['월드맵','M'],['퀘스트','Q'],['일시 정지','Esc']];
    content = `<h2>모험의 첫걸음</h2><p class="modal-description">가벼운 마음으로 시작해요. 당신만의 속도로 즐기면 돼요.</p><div class="guide-grid">${rows.map(([label,key])=>`<div class="guide-row"><span>${label}</span><kbd>${key}</kbd></div>`).join('')}</div><div class="modal-callout">공중에서 한 번 더 점프하면 높은 발판에 올라갈 수 있어요.<br>몬스터 5마리를 물리치고 퀘스트 보상을 받으면 다음 지역이 열려요.<br>체력이 모두 소진되면 체력을 회복하고 초입에서 다시 시작해요.<br>모바일에서는 화면 하단의 터치 버튼을 사용하세요.</div><div class="modal-callout">진행 상황은 이 브라우저에 자동 저장됩니다. 같은 기기와 브라우저에서 모험을 이어갈 수 있어요. 효과음은 상단의 스피커 버튼으로 조절하세요.</div><button class="danger-reset" id="reset-request">모험 기록 초기화</button>`;
  } else if (modalView === 'reset') {
    content = `<h2>새로운 이야기를 시작할까요?</h2><p class="modal-description">현재 레벨, 골드, 퀘스트와 장비가 모두 초기화됩니다. 이 작업은 되돌릴 수 없어요.</p><div class="reset-confirm"><button class="quest-button" data-modal="guide">돌아가기</button><button class="primary-button" id="confirm-reset">처음부터 시작</button></div>`;
  }
  $('#modal-body').innerHTML = content;
}

function startGame() {
  unlockAudio();
  game.act('start');
  if (game.state.paused) game.act('pause');
  updateUI();
  canvas.focus({preventScroll:true});
  addLog('당신의 첫 이야기가 시작되었어요.');
}

function clearInputs() { Object.keys(keys).forEach(k=>delete keys[k]); Object.keys(touch).forEach(k=>delete touch[k]); }

function togglePause() {
  if (!game.state.started) return;
  game.act('pause'); clearInputs(); updateUI();
}

document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  unlockAudio();
  if (button.dataset.modal) { openModal(button.dataset.modal); return; }
  if (button.dataset.action === 'adventure') { closeModal(); $('#game-stage').scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}); canvas.focus({preventScroll:true}); return; }
  if (button.dataset.travel) {
    const id = button.dataset.travel;
    if (id === game.state.region) { closeModal(); showToast('지금 모험하고 있는 곳이에요.'); return; }
    if (!game.state.unlockedRegions.includes(id)) {
      if (!modal.open) openModal('map');
      const index = REGIONS.findIndex(r=>r.id===id);
      const old = $('#modal-body .modal-callout');
      if (old) old.textContent = `「${QUESTS[index - 1].title}」 퀘스트를 완료하고 보상을 받으면 열려요.`;
      return;
    }
    game.travel(id); closeModal(); updateUI(); canvas.focus({preventScroll:true}); return;
  }
  if (button.dataset.shop) {
    game.act(button.dataset.shop); renderModal(); updateUI(); return;
  }
  if (button.dataset.gameAction) {
    if (!game.state.started) { showToast('먼저 모험을 시작해주세요.'); return; }
    game.act(button.dataset.gameAction); updateUI(); canvas.focus({preventScroll:true}); return;
  }
  switch (button.id) {
    case 'start-button': startGame(); break;
    case 'pause-button': case 'resume-button': togglePause(); break;
    case 'sound-toggle': game.act('toggleSound'); updateUI(); break;
    case 'close-modal': closeModal(); break;
    case 'fullscreen-button':
      if (document.fullscreenElement) document.exitFullscreen?.().catch(()=>{});
      else if ($('#game-stage').requestFullscreen) $('#game-stage').requestFullscreen().catch(()=>showToast('이 브라우저에서는 전체 화면을 사용할 수 없어요.'));
      else showToast('기기를 가로로 돌려 넓은 화면으로 즐겨보세요.');
      break;
    case 'claim-reward': game.act('claimQuest'); renderModal(); updateUI(); break;
    case 'reset-request': openModal('reset'); break;
    case 'confirm-reset': game.reset(); pausedBeforeModal = false; closeModal(); clearInputs(); log.length=0; addLog('새로운 모험을 시작할 준비가 되었어요.'); updateUI(); break;
  }
});

modal.addEventListener('close', () => { game.state.paused = pausedBeforeModal; modalView = null; clearInputs(); updateUI(); canvas.focus({preventScroll:true}); });
modal.addEventListener('click', event => { if (event.target === modal) { const box = modal.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closeModal(); } });

const bindings = { ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'jump',KeyW:'jump',Space:'jump',KeyZ:'attack',KeyX:'skill',KeyE:'interact' };
document.addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
  if (modal.open) return;
  if (event.code === 'Enter' && !game.state.started) { event.preventDefault(); startGame(); return; }
  if (bindings[event.code]) { event.preventDefault(); unlockAudio(); keys[event.code] = true; }
  if (event.repeat) return;
  if (event.code === 'Escape') { event.preventDefault(); togglePause(); }
  else if (event.code === 'KeyI') openModal('inventory');
  else if (event.code === 'KeyM') openModal('map');
  else if (event.code === 'KeyQ') openModal('quests');
  else if (event.code === 'KeyH') { if(game.state.started) game.act('potion'); }
});
document.addEventListener('keyup', event => { delete keys[event.code]; });

document.querySelectorAll('[data-control]').forEach(button => {
  button.addEventListener('pointerdown', event => { event.preventDefault(); unlockAudio(); button.setPointerCapture(event.pointerId); touch[button.dataset.control] = true; });
  for (const type of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(type, () => { delete touch[button.dataset.control]; });
});

window.addEventListener('blur', () => { clearInputs(); if (game.state.started && !game.state.paused) { game.act('pause'); updateUI(); } });
document.addEventListener('visibilitychange', () => { if(document.hidden) { clearInputs(); game.save(); if(game.state.started&&!game.state.paused) {game.act('pause'); updateUI();} } });
window.addEventListener('pagehide', () => game.save());
window.addEventListener('resize', () => renderer.resize());
document.addEventListener('fullscreenchange', () => renderer.resize());

function frame(now) {
  const dt = lastFrame ? Math.min((now - lastFrame) / 1000, .05) : 0;
  lastFrame = now;
  const input = {...touch};
  for (const [code, action] of Object.entries(bindings)) if (keys[code]) input[action] = true;
  game.update(dt, input);
  renderer.render(game.state, dt);
  uiTimer += dt;
  if (uiTimer >= .1) { updateUI(); uiTimer = 0; }
  requestAnimationFrame(frame);
}

updateUI();
requestAnimationFrame(frame);
