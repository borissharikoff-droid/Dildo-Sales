'use strict';

/* =========================================================
   ЗОЛОТО ДВОРФОВ — idle-игра
   Чистый JS, всё хранится в localStorage этого браузера.
   ========================================================= */

// ---------- Данные: постройки (генераторы золота) ----------
const BUILDINGS = [
  { id: 'miner',    name: 'Дворф-шахтёр',          icon: '🧔', desc: 'Машет киркой за кружку эля.',          baseCost: 15,      cps: 0.2 },
  { id: 'cart',     name: 'Рудная тележка',         icon: '🛒', desc: 'Возит руду из глубоких штолен.',       baseCost: 110,     cps: 1 },
  { id: 'shaft',    name: 'Шахтный ствол',          icon: '🕳️', desc: 'Уходит всё глубже в недра горы.',      baseCost: 1200,    cps: 8 },
  { id: 'forge',    name: 'Кузница',                icon: '🔥', desc: 'Переплавляет руду в звонкое золото.',  baseCost: 13000,   cps: 47 },
  { id: 'drill',    name: 'Паровой бур',            icon: '⚙️', desc: 'Грызёт камень днём и ночью.',          baseCost: 140000,  cps: 260 },
  { id: 'golem',    name: 'Рудный голем',           icon: '🗿', desc: 'Не устаёт, не спит и не пьёт.',        baseCost: 1.6e6,   cps: 1400 },
  { id: 'gem',      name: 'Самоцветная жила',       icon: '💎', desc: 'Сверкает золотом и самоцветами.',      baseCost: 2.2e7,   cps: 7800 },
  { id: 'dragon',   name: 'Драконья сокровищница',  icon: '🐉', desc: 'Дракон делится золотом... за долю.',   baseCost: 3.4e8,   cps: 44000 },
  { id: 'heart',    name: 'Сердце Горы',            icon: '🏔️', desc: 'Древняя сила, что куёт жилы золота.',  baseCost: 5.2e9,   cps: 260000 },
  { id: 'forgegod', name: 'Кузнечный бог',          icon: '⚒️', desc: 'Куёт золото из самого мифа о золоте.', baseCost: 7.8e10,  cps: 1.6e6 },
];

const COST_GROWTH = 1.15;

// ---------- Данные: улучшения ----------
// type: 'clickMult' | 'clickGpsPercent' | 'buildingMult' | 'globalMult'
const CLICK_UPGRADES = [
  { id: 'pick1', name: 'Железная кирка',    icon: '⛏️', desc: '×2 к золоту за удар.', cost: 120,    type: 'clickMult', value: 2, unlock: s => s.totalClicks >= 12 },
  { id: 'pick2', name: 'Стальная кирка',    icon: '⛏️', desc: '×2 к золоту за удар.', cost: 2500,   type: 'clickMult', value: 2, unlock: s => has('pick1') },
  { id: 'pick3', name: 'Серебряная кирка',  icon: '⛏️', desc: '×2 к золоту за удар.', cost: 60000,  type: 'clickMult', value: 2, unlock: s => has('pick2') },
  { id: 'pick4', name: 'Мифриловая кирка',  icon: '⛏️', desc: '×2 к золоту за удар.', cost: 1.4e6,  type: 'clickMult', value: 2, unlock: s => has('pick3') },
  { id: 'pick5', name: 'Адамантовая кирка', icon: '⛏️', desc: '×2 к золоту за удар.', cost: 4.5e7,  type: 'clickMult', value: 2, unlock: s => has('pick4') },
  { id: 'pick6', name: 'Рунная кирка',      icon: '⛏️', desc: '×3 к золоту за удар.', cost: 1.2e9,  type: 'clickMult', value: 3, unlock: s => has('pick5') },
];

const CLICK_GPS_UPGRADES = [
  { id: 'echo1', name: 'Звон кирки',    icon: '🔔', desc: 'Удар добывает +5% от вашей добычи в секунду.',  cost: 90000, type: 'clickGpsPercent', value: 0.05, unlock: s => totalGps() >= 60 },
  { id: 'echo2', name: 'Эхо штолен',    icon: '🔔', desc: 'Ещё +10% от добычи в секунду за удар.',         cost: 5e6,   type: 'clickGpsPercent', value: 0.10, unlock: s => has('echo1') },
  { id: 'echo3', name: 'Гул недр',      icon: '🔔', desc: 'Ещё +15% от добычи в секунду за удар.',         cost: 4e8,   type: 'clickGpsPercent', value: 0.15, unlock: s => has('echo2') },
];

const GLOBAL_UPGRADES = [
  { id: 'glob1', name: 'Бочонок эля',          icon: '🍺', desc: '+5% ко всей добыче золота.',  cost: 1e5,   type: 'globalMult', value: 1.05, unlock: s => s.totalGoldAll >= 5e4 },
  { id: 'glob2', name: 'Гимн рудокопов',       icon: '🎵', desc: '+5% ко всей добыче золота.',  cost: 6e6,   type: 'globalMult', value: 1.05, unlock: s => s.totalGoldAll >= 3e6 },
  { id: 'glob3', name: 'Благословение предков', icon: '✨', desc: '+10% ко всей добыче золота.', cost: 1.2e8, type: 'globalMult', value: 1.10, unlock: s => s.totalGoldAll >= 6e7 },
  { id: 'glob4', name: 'Руна изобилия',        icon: '🔮', desc: '+10% ко всей добыче золота.', cost: 6e9,   type: 'globalMult', value: 1.10, unlock: s => s.totalGoldAll >= 3e9 },
  { id: 'glob5', name: 'Зов Сердца Горы',      icon: '🏔️', desc: '+15% ко всей добыче золота.', cost: 1.5e11, type: 'globalMult', value: 1.15, unlock: s => s.totalGoldAll >= 7e10 },
];

// Тиры улучшений для каждой постройки (каждый удваивает её добычу)
const TIERS = [
  { need: 1,   costMul: 10,     label: 'I' },
  { need: 5,   costMul: 50,     label: 'II' },
  { need: 25,  costMul: 500,    label: 'III' },
  { need: 50,  costMul: 5000,   label: 'IV' },
  { need: 100, costMul: 50000,  label: 'V' },
  { need: 150, costMul: 500000, label: 'VI' },
];

const BUILDING_UPGRADES = [];
BUILDINGS.forEach(b => {
  TIERS.forEach(t => {
    BUILDING_UPGRADES.push({
      id: `${b.id}_${t.label}`,
      name: `${b.name} ${t.label}`,
      icon: b.icon,
      desc: `«${b.name}» работают вдвое лучше. Нужно построек: ${t.need}.`,
      cost: Math.ceil(b.baseCost * t.costMul),
      type: 'buildingMult',
      building: b.id,
      value: 2,
      unlock: s => s.buildings[b.id] >= t.need,
    });
  });
});

const UPGRADES = [...CLICK_UPGRADES, ...CLICK_GPS_UPGRADES, ...GLOBAL_UPGRADES, ...BUILDING_UPGRADES];
const UPGRADE_BY_ID = {};
UPGRADES.forEach(u => { UPGRADE_BY_ID[u.id] = u; });

// ---------- Состояние ----------
const SAVE_KEY = 'dwarf_idle_save_v1';
const OFFLINE_CAP_SEC = 3 * 24 * 3600; // максимум 3 дня оффлайн-добычи

let state = defaultState();

function defaultState() {
  const buildings = {};
  BUILDINGS.forEach(b => { buildings[b.id] = 0; });
  return {
    gold: 0,
    totalGoldRun: 0,
    totalGoldAll: 0,
    totalClicks: 0,
    buildings,
    upgrades: {},
    ale: 0,
    buyAmount: 1,
    lastSave: Date.now(),
    started: Date.now(),
  };
}

function has(id) { return !!state.upgrades[id]; }

// ---------- Множители и добыча ----------
function aleBonus() { return 1 + state.ale * 0.02; }

function globalMultiplier() {
  let m = aleBonus();
  GLOBAL_UPGRADES.forEach(u => { if (has(u.id)) m *= u.value; });
  return m;
}

function buildingMultiplier(id) {
  let m = 1;
  BUILDING_UPGRADES.forEach(u => { if (u.building === id && has(u.id)) m *= u.value; });
  return m;
}

function buildingCps(b) {
  return b.cps * state.buildings[b.id] * buildingMultiplier(b.id) * globalMultiplier();
}

function totalGps() {
  let raw = 0;
  for (const b of BUILDINGS) raw += b.cps * state.buildings[b.id] * buildingMultiplier(b.id);
  return raw * globalMultiplier();
}

function clickValue() {
  let mult = 1, gpsPct = 0;
  CLICK_UPGRADES.forEach(u => { if (has(u.id)) mult *= u.value; });
  CLICK_GPS_UPGRADES.forEach(u => { if (has(u.id)) gpsPct += u.value; });
  return mult * globalMultiplier() + totalGps() * gpsPct;
}

// ---------- Стоимость построек ----------
function buildingCost(b, ownedAt) {
  return Math.floor(b.baseCost * Math.pow(COST_GROWTH, ownedAt));
}

function exactBulkCost(b, count) {
  const owned = state.buildings[b.id];
  let total = 0;
  for (let i = 0; i < count; i++) total += buildingCost(b, owned + i);
  return total;
}

function maxAffordable(b) {
  const r = COST_GROWTH, owned = state.buildings[b.id], gold = state.gold;
  const a = b.baseCost * Math.pow(r, owned);
  const rhs = 1 + gold * (r - 1) / a;
  if (rhs <= 1) return 0;
  let n = Math.floor(Math.log(rhs) / Math.log(r));
  if (n < 0) n = 0;
  if (n > 100000) n = 100000;
  while (n > 0 && exactBulkCost(b, n) > gold) n--;
  while (n < 100000 && exactBulkCost(b, n + 1) <= gold) n++;
  return n;
}

function plannedCount(b) {
  return state.buyAmount === -1 ? maxAffordable(b) : state.buyAmount;
}

// ---------- Действия ----------
function buyBuilding(b) {
  let count = plannedCount(b);
  if (count <= 0) return;
  let cost = exactBulkCost(b, count);
  if (cost > state.gold) {
    if (state.buyAmount === -1) {
      while (count > 0 && exactBulkCost(b, count) > state.gold) count--;
      if (count <= 0) return;
      cost = exactBulkCost(b, count);
    } else {
      return;
    }
  }
  state.gold -= cost;
  state.buildings[b.id] += count;
  render();
}

function buyUpgrade(u) {
  if (has(u.id) || state.gold < u.cost) return;
  state.gold -= u.cost;
  state.upgrades[u.id] = true;
  render();
}

function gainGold(amount) {
  state.gold += amount;
  state.totalGoldRun += amount;
  state.totalGoldAll += amount;
}

function doClick(ev) {
  const v = clickValue();
  gainGold(v);
  state.totalClicks++;
  spawnFloatAt(ev, '+' + fmt(v));
  renderTopbar();
}

// ---------- Престиж (эль / таверна) ----------
function alePotential() { return Math.floor(Math.sqrt(state.totalGoldAll / 1e9)); }
function aleToGain() { return Math.max(0, alePotential() - state.ale); }
function goldForNextAle() {
  const next = alePotential() + 1;
  return next * next * 1e9; // обратное к sqrt(total/1e9)
}

function doPrestige() {
  const gain = aleToGain();
  if (gain <= 0) {
    toast('Пока маловато золота для нового пира. Копайте дальше!');
    return;
  }
  if (!confirm(`Уйти на пир и получить ${fmt(gain)} 🍺 эля?\n\nВсё золото, дворфы, постройки и улучшения будут сброшены.`)) return;
  state.ale += gain;
  state.gold = 0;
  state.totalGoldRun = 0;
  BUILDINGS.forEach(b => { state.buildings[b.id] = 0; });
  state.upgrades = {};
  save();
  rebuildUpgradeGrid();
  render();
  toast(`🍺 За пир дворфы рассказали столько историй, что вы получили ${fmt(gain)} эля!`);
}

// ---------- Сохранение ----------
function encode(obj) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
}
function decode(str) {
  return JSON.parse(decodeURIComponent(escape(atob(str))));
}

function save() {
  state.lastSave = Date.now();
  try {
    localStorage.setItem(SAVE_KEY, encode(state));
  } catch (e) {
    console.warn('Не удалось сохранить:', e);
  }
}

function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const s = decode(raw);
    state = Object.assign(defaultState(), s);
    const fresh = defaultState();
    state.buildings = Object.assign(fresh.buildings, s.buildings || {});
    state.upgrades = s.upgrades || {};
    // выкидываем неизвестные улучшения (на случай смены версии)
    Object.keys(state.upgrades).forEach(id => { if (!UPGRADE_BY_ID[id]) delete state.upgrades[id]; });
    return true;
  } catch (e) {
    console.warn('Не удалось загрузить сохранение:', e);
    return false;
  }
}

function applyOffline() {
  const now = Date.now();
  const dt = Math.min((now - (state.lastSave || now)) / 1000, OFFLINE_CAP_SEC);
  if (dt < 10) return;
  const earned = totalGps() * dt;
  if (earned <= 0) return;
  gainGold(earned);
  showOffline(earned, dt);
}

// ---------- Форматирование чисел ----------
const UNITS = ['', 'тыс', 'млн', 'млрд', 'трлн', 'квдрлн', 'квнтлн', 'скстлн', 'сптлн', 'октлн', 'нонлн', 'дцлн'];
function fmt(n) {
  if (!isFinite(n)) return '∞';
  if (n < 0) return '-' + fmt(-n);
  if (n < 1000) {
    return Number.isInteger(n) ? n.toString() : (Math.round(n * 10) / 10).toString();
  }
  const tier = Math.floor(Math.log10(n) / 3);
  if (tier < UNITS.length) {
    const scaled = n / Math.pow(1000, tier);
    return scaled.toFixed(2) + ' ' + UNITS[tier];
  }
  return n.toExponential(2);
}

function fmtGold(n) {
  return n < 1000 ? Math.floor(n).toString() : fmt(n);
}

function fmtTime(sec) {
  sec = Math.floor(sec);
  const d = Math.floor(sec / 86400); sec -= d * 86400;
  const h = Math.floor(sec / 3600); sec -= h * 3600;
  const m = Math.floor(sec / 60); sec -= m * 60;
  const parts = [];
  if (d) parts.push(d + 'д');
  if (h) parts.push(h + 'ч');
  if (m) parts.push(m + 'м');
  parts.push(sec + 'с');
  return parts.join(' ');
}

// =========================================================
//   DOM / рендер
// =========================================================
const $ = sel => document.querySelector(sel);
const el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
};

let dom = {};
const buildingRefs = {};
let upgGridSig = '';
const upgCellRefs = {};

function cacheDom() {
  dom = {
    gold: $('#gold'), gps: $('#gps'), clickVal: $('#clickVal'), ale: $('#ale'), aleBonus: $('#aleBonus'),
    clicks: $('#clicks'), floats: $('#floats'), mineBtn: $('#mineBtn'),
    buildingList: $('#buildingList'), upgradeList: $('#upgradeList'), noUpgrades: $('#noUpgrades'),
    upgCount: $('#upgCount'), boughtList: $('#boughtList'), boughtCount: $('#boughtCount'),
    pAle: $('#pAle'), pBonus: $('#pBonus'), pGain: $('#pGain'), pNext: $('#pNext'), prestigeBtn: $('#prestigeBtn'),
    sGold: $('#sGold'), sRun: $('#sRun'), sAll: $('#sAll'), sClicks: $('#sClicks'),
    sBuild: $('#sBuild'), sUpg: $('#sUpg'), sAle: $('#sAle'), sTime: $('#sTime'),
    saveBox: $('#saveBox'),
    offlineModal: $('#offlineModal'), offTime: $('#offTime'), offGold: $('#offGold'),
    toast: $('#toast'),
  };
}

function buildBuildingRows() {
  dom.buildingList.innerHTML = '';
  BUILDINGS.forEach((b, i) => {
    const row = el('div', 'building');
    row.innerHTML = `
      <div class="icon">${b.icon}</div>
      <div class="info">
        <div class="name">${b.name}</div>
        <div class="desc">${b.desc}</div>
        <div class="out"></div>
      </div>
      <div class="right">
        <div class="owned">0</div>
        <button class="buy" type="button">Купить</button>
      </div>`;
    const buyBtn = row.querySelector('.buy');
    buyBtn.addEventListener('click', () => buyBuilding(b));
    buildingRefs[b.id] = {
      row,
      out: row.querySelector('.out'),
      owned: row.querySelector('.owned'),
      buy: buyBtn,
      index: i,
    };
    dom.buildingList.appendChild(row);
  });
}

function isRevealed(b, i) {
  if (state.buildings[b.id] > 0) return true;
  if (state.totalGoldAll >= b.baseCost * 0.5) return true;
  if (i === 0) return true;
  if (i > 0 && state.buildings[BUILDINGS[i - 1].id] > 0) return true;
  return false;
}

function updateBuildings() {
  BUILDINGS.forEach((b, i) => {
    const ref = buildingRefs[b.id];
    const revealed = isRevealed(b, i);
    ref.row.style.display = revealed ? '' : 'none';
    if (!revealed) return;

    const owned = state.buildings[b.id];
    ref.owned.textContent = owned;
    ref.out.textContent = owned > 0
      ? `Добывают +${fmt(buildingCps(b))}/сек`
      : `+${fmt(b.cps * globalMultiplier())}/сек за штуку`;

    const count = plannedCount(b);
    const showCount = state.buyAmount === -1 ? Math.max(1, count) : count;
    const cost = exactBulkCost(b, Math.max(1, count));
    const canAfford = count > 0 && cost <= state.gold;

    ref.buy.disabled = !canAfford;
    ref.row.classList.toggle('affordable', canAfford);

    const label = state.buyAmount === -1 ? `Купить ×${showCount}` : `Купить ×${state.buyAmount}`;
    ref.buy.innerHTML = `${label}<br>💰 ${fmt(cost)}`;
  });
}

function availableUpgrades() {
  return UPGRADES
    .filter(u => !has(u.id) && u.unlock(state))
    .sort((a, b) => a.cost - b.cost);
}

function rebuildUpgradeGrid() {
  upgGridSig = '';
}

function updateUpgrades() {
  const list = availableUpgrades();
  const sig = list.map(u => u.id).join(',');

  if (sig !== upgGridSig) {
    upgGridSig = sig;
    dom.upgradeList.innerHTML = '';
    for (const k in upgCellRefs) delete upgCellRefs[k];
    list.forEach(u => {
      const cell = el('div', 'upg');
      cell.innerHTML = `
        ${u.icon}
        <div class="tip">
          <span class="tname">${u.name}</span>
          ${u.desc}
          <span class="tcost"></span>
        </div>`;
      cell.addEventListener('click', () => buyUpgrade(u));
      dom.upgradeList.appendChild(cell);
      upgCellRefs[u.id] = { cell, cost: cell.querySelector('.tcost') };
    });
  }

  list.forEach(u => {
    const ref = upgCellRefs[u.id];
    if (!ref) return;
    const ok = state.gold >= u.cost;
    ref.cell.classList.toggle('affordable', ok);
    ref.cost.textContent = '💰 ' + fmt(u.cost);
    ref.cost.className = 'tcost ' + (ok ? 'ok' : 'no');
  });

  dom.noUpgrades.style.display = list.length ? 'none' : 'block';
  dom.upgCount.textContent = list.length ? String(list.length) : '';

  // куплено
  const bought = UPGRADES.filter(u => has(u.id));
  dom.boughtCount.textContent = bought.length;
  if (dom.boughtList.childElementCount !== bought.length) {
    dom.boughtList.innerHTML = '';
    bought.forEach(u => {
      const b = el('div', 'b', u.icon);
      b.title = `${u.name}\n${u.desc}`;
      dom.boughtList.appendChild(b);
    });
  }
}

function renderPrestige() {
  const gain = aleToGain();
  dom.pAle.textContent = fmt(state.ale);
  dom.pBonus.textContent = state.ale > 0 ? `(+${(state.ale * 2)}% к добыче)` : '';
  dom.pGain.textContent = fmt(gain);
  dom.prestigeBtn.disabled = gain <= 0;
  dom.pNext.textContent = `Следующая кружка эля — при ${fmt(goldForNextAle())} 💰 добытого золота за всё время (сейчас ${fmt(state.totalGoldAll)}).`;
}

function renderMisc() {
  dom.sGold.textContent = fmt(state.gold);
  dom.sRun.textContent = fmt(state.totalGoldRun);
  dom.sAll.textContent = fmt(state.totalGoldAll);
  dom.sClicks.textContent = fmt(state.totalClicks);
  let totalBuild = 0;
  BUILDINGS.forEach(b => { totalBuild += state.buildings[b.id]; });
  dom.sBuild.textContent = fmt(totalBuild);
  dom.sUpg.textContent = UPGRADES.filter(u => has(u.id)).length;
  dom.sAle.textContent = fmt(state.ale);
  dom.sTime.textContent = fmtTime((Date.now() - state.started) / 1000);
}

function renderTopbar() {
  dom.gold.textContent = fmtGold(state.gold);
  dom.gps.textContent = fmt(totalGps());
  dom.clickVal.textContent = fmt(clickValue());
  dom.ale.textContent = fmt(state.ale);
  dom.aleBonus.textContent = state.ale > 0 ? `+${state.ale * 2}%` : '';
  dom.clicks.textContent = fmt(state.totalClicks);
}

function render() {
  renderTopbar();
  updateBuildings();
  updateUpgrades();
  renderPrestige();
  renderMisc();
}

// ---------- Плавающие числа ----------
function spawnFloatAt(ev, text, cls) {
  const rect = dom.floats.getBoundingClientRect();
  let x, y;
  if (ev && ev.clientX != null) {
    x = ev.clientX - rect.left;
    y = ev.clientY - rect.top;
  } else {
    x = rect.width / 2 + (Math.random() * 60 - 30);
    y = rect.height / 2;
  }
  spawnFloatXY(x, y, text, cls);
}

function spawnFloatXY(x, y, text, cls) {
  const f = el('span', 'float' + (cls ? ' ' + cls : ''), text);
  f.style.left = x + 'px';
  f.style.top = y + 'px';
  dom.floats.appendChild(f);
  setTimeout(() => f.remove(), 900);
}

// ---------- Золотой самородок (случайный бонус) ----------
let nuggetTimer = null;
function scheduleNugget() {
  const delay = (60 + Math.random() * 110) * 1000;
  nuggetTimer = setTimeout(spawnNugget, delay);
}

function spawnNugget() {
  const panel = dom.mineBtn.closest('.mine-panel');
  const rect = panel.getBoundingClientRect();
  const nug = el('div', 'nugget', '💰');
  const pad = 50;
  const x = pad + Math.random() * Math.max(10, rect.width - pad * 2);
  const y = pad + Math.random() * Math.max(10, rect.height - pad * 2);
  nug.style.left = x + 'px';
  nug.style.top = y + 'px';
  nug.title = 'Золотой самородок! Скорей кликай!';
  let alive = true;
  const remove = () => { if (alive) { alive = false; nug.remove(); scheduleNugget(); } };
  nug.addEventListener('click', () => {
    if (!alive) return;
    const bonus = Math.min(state.gold * 0.15, totalGps() * 900) + 13 * clickValue();
    gainGold(bonus);
    spawnFloatXY(x, y, 'Самородок! +' + fmt(bonus), 'lucky');
    toast('💰 Золотой самородок: +' + fmt(bonus) + ' золота!');
    alive = false;
    nug.remove();
    scheduleNugget();
    render();
  });
  panel.appendChild(nug);
  setTimeout(remove, 13000);
}

// ---------- Модалки / тосты ----------
function showOffline(earned, dt) {
  dom.offTime.textContent = fmtTime(dt);
  dom.offGold.textContent = fmt(earned);
  dom.offlineModal.classList.remove('hidden');
}

let toastTimer = null;
function toast(msg) {
  dom.toast.textContent = msg;
  dom.toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => dom.toast.classList.add('hidden'), 3200);
}

// ---------- Вкладки и кнопки ----------
function wireUI() {
  dom.mineBtn.addEventListener('click', doClick);

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      $('#tab-' + btn.dataset.tab).classList.add('active');
    });
  });

  document.querySelectorAll('.amt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.amt-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.buyAmount = parseInt(btn.dataset.amt, 10);
      updateBuildings();
    });
  });

  dom.prestigeBtn.addEventListener('click', doPrestige);
  $('#offClose').addEventListener('click', () => dom.offlineModal.classList.add('hidden'));

  $('#saveBtn').addEventListener('click', () => { save(); toast('💾 Игра сохранена.'); });
  $('#exportBtn').addEventListener('click', () => {
    save();
    dom.saveBox.value = localStorage.getItem(SAVE_KEY) || '';
    dom.saveBox.select();
    toast('📤 Код сохранения скопирован в поле ниже.');
  });
  $('#importBtn').addEventListener('click', () => {
    const raw = dom.saveBox.value.trim();
    if (!raw) { toast('Вставьте код сохранения в поле.'); return; }
    try {
      decode(raw);
      localStorage.setItem(SAVE_KEY, raw);
      load();
      rebuildUpgradeGrid();
      render();
      toast('📥 Сохранение загружено!');
    } catch (e) {
      toast('❌ Неверный код сохранения.');
    }
  });
  $('#wipeBtn').addEventListener('click', () => {
    if (!confirm('Точно сбросить ВЕСЬ прогресс, включая эль? Это нельзя отменить.')) return;
    localStorage.removeItem(SAVE_KEY);
    state = defaultState();
    rebuildUpgradeGrid();
    render();
    toast('🗑️ Прогресс сброшен. Дворфы начинают заново.');
  });

  window.addEventListener('beforeunload', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
}

function syncBuyAmountButtons() {
  document.querySelectorAll('.amt-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.amt, 10) === state.buyAmount);
  });
}

// ---------- Игровой цикл ----------
let lastFrame = 0;
function loop(now) {
  if (!lastFrame) lastFrame = now;
  const dt = Math.min((now - lastFrame) / 1000, 3600);
  lastFrame = now;
  if (dt > 0) gainGold(totalGps() * dt);
  renderTopbar();
  requestAnimationFrame(loop);
}

// ---------- Запуск ----------
function init() {
  cacheDom();
  const loaded = load();
  if (loaded) applyOffline();
  buildBuildingRows();
  wireUI();
  syncBuyAmountButtons();
  render();
  scheduleNugget();
  setInterval(render, 200);
  setInterval(save, 15000);
  lastFrame = 0;
  requestAnimationFrame(loop);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
