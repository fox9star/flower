export const REGIONS = [
  { id: 'meadow', name: '꽃바람 초원', subtitle: '모든 모험이 시작되는 곳', level: 1, color: '#80b5a1' },
  { id: 'forest', name: '반딧불 숲', subtitle: '반짝이는 비밀을 찾아서', level: 2, color: '#609483' },
  { id: 'ruins', name: '달빛 유적', subtitle: '잠든 정원의 수호자', level: 4, color: '#8e88b6' },
];

export const QUESTS = [
  { id: 'first-bloom', title: '작은 용기의 시작', description: '초원의 말썽꾸러기 5마리를 물리치세요.', target: 5, coins: 100, xp: 60, reward: '100 코인 · 60 EXP · 반딧불 숲 개방', unlock: 'forest' },
  { id: 'forest-friend', title: '숲에 다시 찾아온 평화', description: '몬스터 8마리를 물리치고 꽃길을 지켜주세요.', target: 8, coins: 180, xp: 120, reward: '180 코인 · 120 EXP · 달빛 유적 개방', unlock: 'ruins' },
  { id: 'moon-guardian', title: '달빛 정원의 약속', description: '달빛 유적에서 잠든 정원의 수호자를 물리치세요.', target: 1, coins: 300, xp: 200, reward: '300 코인 · 200 EXP · 정원의 수호자 칭호', boss: true },
];

const SAVE_KEY = 'flower-world-save-v1';
const GROUND = 480;
const clamp = (n, low, high) => Math.max(low, Math.min(high, n));
const number = (n, fallback, low, high) => Number.isFinite(n) ? clamp(n, low, high) : fallback;
const integer = (n, fallback, low, high) => Math.floor(number(n, fallback, low, high));
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

function freshState() {
  return {
    time: 0, paused: false, started: false, region: 'meadow', worldWidth: 3200,
    player: {
      x: 260, y: 424, vx: 0, vy: 0, w: 36, h: 56, facing: 1,
      hp: 100, maxHp: 100, mp: 60, maxMp: 60, level: 1, xp: 0, xpNext: 80,
      coins: 0, potions: 5, attack: 22, weaponLevel: 1, grounded: true,
      attackTimer: 0, skillTimer: 0, skillCooldown: 0, invincible: 0,
      jumps: 0,
    },
    platforms: [], enemies: [], particles: [], floaters: [],
    npc: { x: 430, y: 424, name: '정원지기 루미' },
    portal: { x: 2990, y: 386, to: 'forest' },
    quest: { id: QUESTS[0].id, kills: 0, target: 5, claimed: false, completedCount: 0 },
    totalKills: 0, unlockedRegions: ['meadow'], sound: true,
    sceneFlash: 0, title: '새싹 모험가', saveAvailable: true,
  };
}

export class Game {
  constructor({ onEvent = () => {}, storage } = {}) {
    this.onEvent = onEvent;
    try { this.storage = storage === undefined ? globalThis.localStorage : storage; }
    catch { this.storage = null; }
    this.state = freshState();
    this.previousInput = {};
    this.saveTimer = 0;
    this.attackCooldown = 0;
    this.noticeCooldown = 0;
    this.load();
    this.buildRegion(this.state.region);
  }

  emit(type, text, extra = {}) { this.onEvent({ type, text, ...extra }); }

  toast(text) {
    if (this.noticeCooldown <= 0) { this.emit('toast', text); this.noticeCooldown = 1; }
  }

  buildRegion(regionId) {
    const s = this.state;
    const index = Math.max(0, REGIONS.findIndex(r => r.id === regionId));
    s.region = REGIONS[index].id;
    s.platforms = [
      { x: 0, y: GROUND, w: 3200, h: 120 },
      { x: 650, y: 363, w: 210, h: 30 },
      { x: 1050, y: 295, w: 200, h: 30 },
      { x: 1450, y: 372, w: 250, h: 30 },
      { x: 1890, y: 308, w: 230, h: 30 },
      { x: 2360, y: 365, w: 220, h: 30 },
    ];
    s.npc = { x: 430, y: 424, name: index === 0 ? '정원지기 루미' : index === 1 ? '숲지기 루미' : '달빛지기 루미' };
    s.portal = { x: 2990, y: 386, to: index === 0 ? 'forest' : index === 1 ? 'ruins' : 'meadow' };
    const placements = [
      [710, GROUND, 600, 850], [1020, GROUND, 900, 1190],
      [1360, GROUND, 1230, 1510], [1750, GROUND, 1600, 1840],
      [2120, GROUND, 1980, 2260], [2600, GROUND, 2450, 2780],
      [720, 363, 663, 803], [1110, 295, 1063, 1193],
      [1530, 372, 1463, 1640], [1970, 308, 1903, 2053],
    ];
    s.enemies = placements.map(([x, floor, minX, maxX], i) => {
      const type = (i + index) % 3 === 1 ? 'mushroom' : 'sprout';
      const h = type === 'mushroom' ? 48 : 38;
      const hp = 42 + index * 30 + (type === 'mushroom' ? 12 : 0);
      return {
        id: `${s.region}-${i}`, x, y: floor - h, w: 46, h,
        vx: (i % 2 ? 1 : -1) * (24 + index * 8), type, hp, maxHp: hp,
        alive: true, hitTimer: 0, minX, maxX, baseY: floor - h,
        spawnX: x, respawnTimer: 0, damage: 9 + index * 5,
        xp: 25 + index * 14, coins: 10 + index * 6,
      };
    });
    if (index === 2) s.enemies.push({
      id: 'garden-guardian', x: 2720, y: GROUND - 92, w: 86, h: 92,
      vx: -24, type: 'boss', hp: 560, maxHp: 560, alive: true, hitTimer: 0,
      minX: 2620, maxX: 2850, baseY: GROUND - 92, spawnX: 2720,
      respawnTimer: 0, damage: 22, xp: 180, coins: 120,
    });
    s.particles = []; s.floaters = [];
    s.player.x = 260; s.player.y = 424;
    s.player.vx = 0; s.player.vy = 0; s.player.grounded = true;
    s.player.jumps = 0; s.player.invincible = 1.5;
    this.previousInput = {}; this.attackCooldown = 0;
  }

  update(dt, input = {}) {
    const s = this.state, p = s.player;
    dt = clamp(Number.isFinite(dt) ? dt : 0, 0, 0.05);
    if (s.paused) { this.previousInput = { ...input }; return; }
    s.time += dt;
    this.noticeCooldown = Math.max(0, this.noticeCooldown - dt);
    if (!s.started) { this.previousInput = { ...input }; return; }
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    p.attackTimer = Math.max(0, p.attackTimer - dt);
    p.skillTimer = Math.max(0, p.skillTimer - dt);
    p.skillCooldown = Math.max(0, p.skillCooldown - dt);
    p.invincible = Math.max(0, p.invincible - dt);
    p.mp = Math.min(p.maxMp, p.mp + dt * 4.5);
    s.sceneFlash = Math.max(0, s.sceneFlash - dt);
    const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    p.vx = direction * 240;
    if (direction) p.facing = direction;
    if (input.jump && !this.previousInput.jump && p.jumps < 2) {
      p.vy = p.jumps === 0 ? -535 : -465;
      p.grounded = false; p.jumps++;
      this.emit('jump', undefined, { double: p.jumps === 2 });
      this.burst(p.x + p.w / 2, p.y + p.h, '#f7f9d3', 7);
    }
    const oldBottom = p.y + p.h;
    p.vy += 1400 * dt;
    p.x = clamp(p.x + p.vx * dt, 12, s.worldWidth - p.w - 12);
    p.y += p.vy * dt;
    p.grounded = false;
    if (p.vy >= 0) {
      for (const platform of s.platforms) {
        if (p.x + p.w > platform.x && p.x < platform.x + platform.w && oldBottom <= platform.y + 3 && p.y + p.h >= platform.y) {
          p.y = platform.y - p.h; p.vy = 0; p.grounded = true; p.jumps = 0;
          break;
        }
      }
    }
    if (p.y > 650) this.respawn();
    if (input.attack) this.attack(false);
    if (input.skill) this.attack(true);
    if (input.interact && !this.previousInput.interact) this.interact();

    for (const enemy of s.enemies) {
      enemy.hitTimer = Math.max(0, enemy.hitTimer - dt);
      if (!enemy.alive) {
        enemy.respawnTimer -= dt;
        if (enemy.respawnTimer <= 0) {
          enemy.alive = true; enemy.hp = enemy.maxHp;
          enemy.x = enemy.spawnX; enemy.y = enemy.baseY;
        }
        continue;
      }
      if (enemy.hitTimer <= 0) {
        enemy.x += enemy.vx * dt;
        if (enemy.x < enemy.minX) { enemy.x = enemy.minX; enemy.vx = Math.abs(enemy.vx); }
        if (enemy.x > enemy.maxX) { enemy.x = enemy.maxX; enemy.vx = -Math.abs(enemy.vx); }
      }
      if (overlap(p, enemy) && p.invincible <= 0) {
        p.hp = Math.max(0, p.hp - enemy.damage); p.invincible = 1.1;
        p.x = clamp(p.x + (p.x < enemy.x ? -25 : 25), 12, s.worldWidth - 50);
        this.float(p.x + p.w / 2, p.y - 10, `−${enemy.damage}`, '#ee7070');
        this.emit('hit', undefined, { damage: enemy.damage });
        if (p.hp <= 0) this.respawn();
      }
    }
    for (const particle of s.particles) {
      particle.life -= dt; particle.x += particle.vx * dt;
      particle.y += particle.vy * dt; particle.vy += 150 * dt;
    }
    s.particles = s.particles.filter(v => v.life > 0);
    for (const f of s.floaters) { f.life -= dt; f.y -= dt * 32; }
    s.floaters = s.floaters.filter(v => v.life > 0);
    this.previousInput = { ...input };
    this.saveTimer += dt;
    if (this.saveTimer >= 12) { this.save(); this.saveTimer = 0; }
  }

  attack(skill = false) {
    const s = this.state, p = s.player;
    if (!s.started || s.paused) return false;
    if (skill) {
      if (p.skillCooldown > 0) return false;
      if (p.mp < 18) { this.toast('마나가 부족해요. 잠시 기다리면 회복됩니다.'); return false; }
      p.mp -= 18; p.skillCooldown = 2.8; p.skillTimer = 0.55;
    } else {
      if (this.attackCooldown > 0) return false;
      this.attackCooldown = 0.36; p.attackTimer = 0.23;
    }
    const reach = skill ? 450 : 112;
    const hitbox = {
      x: p.facing === 1 ? p.x + p.w - 10 : p.x - reach + 10,
      y: p.y - (skill ? 55 : 25), w: reach,
      h: p.h + (skill ? 110 : 45),
    };
    let hits = 0;
    for (const enemy of s.enemies) {
      if (!enemy.alive || !overlap(hitbox, enemy)) continue;
      const critical = Math.random() < 0.17;
      const damage = Math.round(p.attack * (skill ? 2.2 : 1) * (critical ? 1.5 : 1));
      enemy.hp = Math.max(0, enemy.hp - damage); enemy.hitTimer = 0.22;
      enemy.x = clamp(enemy.x + p.facing * (skill ? 18 : 10), enemy.minX, enemy.maxX);
      this.float(enemy.x + enemy.w / 2, enemy.y - 12, `${critical ? '✦ ' : ''}${damage}`, critical ? '#fff4ae' : '#ffffff');
      this.burst(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, skill ? '#c9a7fa' : '#fff2a2', 10);
      hits++;
      if (enemy.hp <= 0) this.defeat(enemy);
    }
    if (skill) this.burst(p.x + p.w / 2, p.y + 20, '#d5b8ff', 20);
    this.emit('attack', undefined, { skill, hits });
    return true;
  }

  defeat(enemy) {
    const s = this.state;
    enemy.alive = false; enemy.respawnTimer = enemy.type === 'boss' ? 35 : 13;
    s.totalKills++; s.player.coins += enemy.coins;
    this.gainXp(enemy.xp);
    this.float(enemy.x + enemy.w / 2, enemy.y + 15, `+${enemy.coins} 코인`, '#ffdf8b');
    const quest = QUESTS.find(q => q.id === s.quest.id);
    if (quest && !s.quest.claimed && s.quest.kills < s.quest.target && (!quest.boss || enemy.type === 'boss')) {
      s.quest.kills++;
      if (s.quest.kills >= s.quest.target) this.emit('quest', '퀘스트 완료! 보상을 받아주세요.');
    }
    this.burst(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, '#f6cf6a', 16);
    this.save();
  }

  gainXp(amount) {
    const s = this.state, p = s.player;
    p.xp += amount;
    while (p.xp >= p.xpNext && p.level < 99) {
      p.xp -= p.xpNext; p.level++;
      p.xpNext = 50 + p.level * 30;
      p.maxHp = 100 + (p.level - 1) * 20;
      p.maxMp = 60 + (p.level - 1) * 8;
      p.hp = p.maxHp; p.mp = p.maxMp;
      p.attack = 22 + (p.level - 1) * 4 + (p.weaponLevel - 1) * 8;
      s.sceneFlash = 0.5;
      this.float(p.x + p.w / 2, p.y - 30, `LEVEL UP! ${p.level}`, '#ffdd78');
      this.burst(p.x + p.w / 2, p.y + 20, '#ffe7a2', 30);
      this.emit('levelup', `레벨 ${p.level}! 체력과 마나가 모두 회복되었어요.`);
    }
  }

  interact() {
    const s = this.state, p = s.player;
    if (Math.abs(p.x - s.portal.x) < 120 && p.y > 280) return this.travel(s.portal.to);
    if (Math.abs(p.x - s.npc.x) < 140) {
      if (s.quest.kills >= s.quest.target && !s.quest.claimed) return this.act('claimQuest');
      this.toast(s.quest.claimed ? '루미: 덕분에 정원에 평화가 돌아왔어요!' : `루미: ${QUESTS.find(q => q.id === s.quest.id)?.description || '꽃길을 함께 지켜주세요.'}`);
      return true;
    }
    this.toast('루미 또는 빛나는 포털 가까이에서 E를 눌러주세요.');
    return false;
  }

  travel(regionId) {
    const s = this.state;
    const region = REGIONS.find(r => r.id === regionId);
    if (!region) return false;
    if (!s.unlockedRegions.includes(regionId)) { this.toast('퀘스트를 완료하고 보상을 받으면 열리는 지역이에요.'); return false; }
    if (s.player.level < region.level) { this.toast(`레벨 ${region.level}부터 입장할 수 있어요.`); return false; }
    if (s.region === regionId) { this.toast('이미 이 지역에 있어요.'); return false; }
    this.buildRegion(regionId); this.save();
    this.emit('toast', `${region.name}에 도착했어요.`);
    return true;
  }

  act(action) {
    const s = this.state, p = s.player;
    if (action === 'start') { s.started = true; s.paused = false; return true; }
    if (action === 'pause') { if (s.started) s.paused = !s.paused; return s.paused; }
    if (action === 'toggleSound') { s.sound = !s.sound; this.save(); return s.sound; }
    if (action === 'save') return this.save();
    if (action === 'interact') return this.interact();
    if (action === 'attack') return this.attack(false);
    if (action === 'skill') return this.attack(true);
    if (action === 'potion') {
      if (p.potions <= 0) { this.toast('물약이 없어요. 가방에서 새 물약을 구입하세요.'); return false; }
      if (p.hp >= p.maxHp && p.mp >= p.maxMp) { this.toast('체력과 마나가 가득 차 있어요.'); return false; }
      p.potions--; p.hp = Math.min(p.maxHp, p.hp + Math.round(p.maxHp * 0.65));
      p.mp = Math.min(p.maxMp, p.mp + 35);
      this.float(p.x + p.w / 2, p.y - 8, '회복!', '#b9efb4');
      this.burst(p.x + p.w / 2, p.y + 28, '#b9efb4', 14);
      this.emit('toast', '꽃잎 물약으로 체력과 마나를 회복했어요.'); this.save(); return true;
    }
    if (action === 'buyPotion') {
      if (p.coins < 25) { this.toast('물약을 구입하려면 25 코인이 필요해요.'); return false; }
      p.coins -= 25; p.potions++;
      this.emit('toast', '꽃잎 물약 1개를 구입했어요.'); this.save(); return true;
    }
    if (action === 'upgrade') {
      const cost = p.weaponLevel * 80;
      if (p.weaponLevel >= 10) { this.toast('무기가 최고 단계에 도달했어요!'); return false; }
      if (p.coins < cost) { this.toast(`강화하려면 ${cost} 코인이 필요해요.`); return false; }
      p.coins -= cost; p.weaponLevel++;
      p.attack = 22 + (p.level - 1) * 4 + (p.weaponLevel - 1) * 8;
      this.emit('toast', `꽃빛 검 +${p.weaponLevel - 1}! 공격력이 8 증가했어요.`); this.save(); return true;
    }
    if (action === 'claimQuest') {
      const index = QUESTS.findIndex(q => q.id === s.quest.id), quest = QUESTS[index];
      if (!quest || s.quest.claimed) { this.toast('모든 이야기 퀘스트를 완료했어요!'); return false; }
      if (s.quest.kills < s.quest.target) { this.toast(`목표를 달성해주세요. (${s.quest.kills}/${s.quest.target})`); return false; }
      p.coins += quest.coins; this.gainXp(quest.xp);
      if (quest.unlock && !s.unlockedRegions.includes(quest.unlock)) s.unlockedRegions.push(quest.unlock);
      const completedCount = index + 1;
      if (QUESTS[index + 1]) {
        const next = QUESTS[index + 1];
        s.quest = { id: next.id, kills: 0, target: next.target, claimed: false, completedCount };
      } else { s.quest.claimed = true; s.quest.completedCount = completedCount; s.title = '정원의 수호자'; }
      this.emit('quest', quest.unlock ? `보상 획득! ${REGIONS.find(r => r.id === quest.unlock).name}이 열렸어요.` : '정원의 수호자가 되었어요! 모든 이야기 퀘스트 완료!');
      this.save(); return true;
    }
    return false;
  }

  respawn() {
    const s = this.state, p = s.player;
    p.hp = p.maxHp; p.mp = p.maxMp;
    p.x = 260; p.y = 424; p.vx = 0; p.vy = 0;
    p.grounded = true; p.jumps = 0; p.invincible = 3;
    this.emit('death', '루미가 구해줬어요! 체력을 회복하고 다시 출발하세요.');
    this.save();
  }

  burst(x, y, color, count) {
    const s = this.state;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2, speed = 30 + Math.random() * 100;
      const life = 0.45 + Math.random() * 0.5;
      s.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 45, life, maxLife: life, color, size: 2 + Math.random() * 4 });
    }
    if (s.particles.length > 220) s.particles.splice(0, s.particles.length - 220);
  }

  float(x, y, text, color) {
    this.state.floaters.push({ x, y, text, color, life: 1.15, maxLife: 1.15 });
    if (this.state.floaters.length > 50) this.state.floaters.shift();
  }

  save() {
    const s = this.state, p = s.player;
    if (!this.storage) { s.saveAvailable = false; return false; }
    try {
      this.storage.setItem(SAVE_KEY, JSON.stringify({
        version: 1, region: s.region,
        player: { level: p.level, xp: p.xp, hp: p.hp, mp: p.mp, coins: p.coins, potions: p.potions, weaponLevel: p.weaponLevel },
        quest: s.quest, totalKills: s.totalKills, sound: s.sound,
      }));
      s.saveAvailable = true;
      this.emit('save', '모험 기록 저장 완료'); return true;
    } catch { s.saveAvailable = false; return false; }
  }

  load() {
    if (!this.storage) { this.state.saveAvailable = false; return; }
    try {
      const raw = this.storage.getItem(SAVE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data || data.version !== 1 || !data.player) return;
      const s = this.state, p = s.player, saved = data.player;
      p.level = integer(saved.level, 1, 1, 99);
      p.weaponLevel = integer(saved.weaponLevel, 1, 1, 10);
      p.xpNext = 50 + p.level * 30;
      p.xp = integer(saved.xp, 0, 0, p.xpNext - 1);
      p.maxHp = 100 + (p.level - 1) * 20; p.maxMp = 60 + (p.level - 1) * 8;
      p.hp = number(saved.hp, p.maxHp, 1, p.maxHp); p.mp = number(saved.mp, p.maxMp, 0, p.maxMp);
      p.coins = integer(saved.coins, 0, 0, 9999999); p.potions = integer(saved.potions, 5, 0, 9999);
      p.attack = 22 + (p.level - 1) * 4 + (p.weaponLevel - 1) * 8;
      const index = Math.max(0, QUESTS.findIndex(q => q.id === data.quest?.id));
      const definition = QUESTS[index];
      s.quest = {
        id: definition.id, target: definition.target,
        kills: integer(data.quest?.kills, 0, 0, definition.target),
        claimed: index === QUESTS.length - 1 && data.quest?.claimed === true && data.quest?.kills >= definition.target,
        completedCount: index,
      };
      if (s.quest.claimed) { s.quest.completedCount = QUESTS.length; s.title = '정원의 수호자'; }
      s.unlockedRegions = ['meadow'];
      for (let i = 0; i < index; i++) if (QUESTS[i].unlock) s.unlockedRegions.push(QUESTS[i].unlock);
      s.region = s.unlockedRegions.includes(data.region) ? data.region : 'meadow';
      if (REGIONS.find(r => r.id === s.region).level > p.level) s.region = 'meadow';
      s.totalKills = integer(data.totalKills, 0, 0, 9999999);
      s.sound = data.sound !== false;
    } catch { /* An unavailable or damaged local save never prevents playing. */ }
  }

  reset() {
    try { this.storage?.removeItem(SAVE_KEY); } catch { /* Local storage may be unavailable. */ }
    this.state = freshState(); this.saveTimer = 0; this.noticeCooldown = 0;
    this.buildRegion('meadow');
    this.emit('toast', '새로운 모험을 준비했어요.');
  }
}
