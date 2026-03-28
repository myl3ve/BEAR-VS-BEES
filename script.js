// ─── DOM REFS ─────────────────────────────────
const gameEl      = document.getElementById('game');
const scoreEl     = document.getElementById('score-num');
const levelEl     = document.getElementById('level-num');
const hearts      = [document.getElementById('h1'), document.getElementById('h2'), document.getElementById('h3')];
const timerBar    = document.getElementById('timer-bar');
const bear        = document.getElementById('bear');
const shieldBubble= document.getElementById('shield-bubble');
const shieldHud   = document.getElementById('shield-hud');
const levelBanner = document.getElementById('level-banner');
const bannerText  = document.getElementById('banner-text');
const bannerSub   = document.getElementById('banner-sub');
const comboDisplay= document.getElementById('combo-display');
const comboText   = document.getElementById('combo-text');
const comboBarEl  = document.getElementById('combo-bar');
const queenAlert  = document.getElementById('queen-alert');
const waspAlert   = document.getElementById('wasp-alert');
const bg          = document.getElementById('bg');
const ground      = document.getElementById('ground');
const hudPseudo   = document.getElementById('hud-pseudo');

// ─── STATE ────────────────────────────────────
let score = 0, lives = 3, level = 1, gameRunning = false, scorePerBee = 10;
let spawnInterval, timerInterval, gameTimer = 0;
let shielded = false, shieldTimer = null;
let comboCount = 0, comboTimeout = null, comboDecayInterval = null, comboPct = 100;
let queenAlive = false, honeyPotTimeout = null;
let totalKills = 0, totalQueens = 0, totalWasps = 0, maxCombo = 0;
let lightningTimeout = null;
let playerName = '';

// ─── LEVEL CONFIG ─────────────────────────────
function getSpeed(lvl) {
  return 0.65 + (lvl - 1) * 0.155;
}

function getSpawnDelay(lvl) {
  return Math.max(280, 2400 - (lvl - 1) * 220);
}

function getMaxEnemies(lvl) {
  return Math.min(3 + lvl * 2, 26);
}

function getWaspChance(lvl) {
  if (lvl < 3) return 0;
  return Math.min(0.12 + (lvl - 3) * 0.07, 0.55);
}

const lvlThresh = [0, 60, 180, 360, 600, 900, 1300, 1800, 2400, 3100, 4000];
const lvlMsg    = [
  '',
  'Ça commence !',
  'Elles s\'énervent 🐝',
  'Les guêpes arrivent ⚠️',
  'Invasion ! 🔥',
  'La Reine approche…',
  'Orage en vue ⛈️',
  'Légendaire ! 🏆',
  'Sans pitié… 💀',
  'T\'es encore là ?!',
  'IMPOSSIBLE !!!'
];

// ─── AUDIO ────────────────────────────────────
let audioCtx;
function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}
function playTone(freq, type, dur, vol = 0.3, delay = 0) {
  if (!audioCtx) return;
  const now = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
  osc.start(now); osc.stop(now + dur);
}
function sndKill()  { playTone(880,'square',0.08,0.25); playTone(660,'square',0.12,0.2,0.06); }
function sndWasp()  { playTone(440,'sawtooth',0.08,0.3); playTone(330,'sawtooth',0.1,0.25,0.05); }
function sndHurt()  { playTone(110,'sawtooth',0.3,0.4); playTone(80,'sawtooth',0.2,0.3,0.1); }
function sndCombo() { [523,659,784,1047].forEach((f,i) => playTone(f,'square',0.12,0.2,i*0.07)); }
function sndHoney() { [523,659,784].forEach((f,i) => playTone(f,'sine',0.2,0.3,i*0.1)); }
function sndQueen() { [1047,880,784,523,330].forEach((f,i) => playTone(f,'square',0.15,0.35,i*0.08)); }
function sndLevel() { [330,440,550,660,880].forEach((f,i) => playTone(f,'triangle',0.18,0.28,i*0.06)); }
function sndBolt()  { playTone(40,'sawtooth',0.4,0.5); playTone(80,'sawtooth',0.3,0.4,0.05); }

// ─── SVG HELPERS ──────────────────────────────
function beeSVG() {
  return `<svg viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="18" cy="14" rx="13" ry="8" fill="rgba(200,230,255,0.78)" stroke="rgba(100,160,220,0.5)" stroke-width="1"/>
    <ellipse cx="34" cy="14" rx="13" ry="8" fill="rgba(200,230,255,0.78)" stroke="rgba(100,160,220,0.5)" stroke-width="1"/>
    <ellipse cx="26" cy="30" rx="12" ry="16" fill="#F5C518"/>
    <rect x="14.5" y="24" width="23" height="5" rx="2" fill="#2D1A0D" opacity=".88"/>
    <rect x="14.5" y="32" width="23" height="5" rx="2" fill="#2D1A0D" opacity=".88"/>
    <circle cx="26" cy="16" r="9" fill="#F5C518"/>
    <circle cx="22" cy="14" r="3" fill="white"/><circle cx="30" cy="14" r="3" fill="white"/>
    <circle cx="22.5" cy="14" r="1.8" fill="#1A0A00"/><circle cx="30.5" cy="14" r="1.8" fill="#1A0A00"/>
    <circle cx="22" cy="13.2" r=".6" fill="white"/><circle cx="30" cy="13.2" r=".6" fill="white"/>
    <line x1="21" y1="8" x2="16" y2="3" stroke="#2D1A0D" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="31" y1="8" x2="36" y2="3" stroke="#2D1A0D" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="15.5" cy="2.5" r="2" fill="#F5C518"/><circle cx="36.5" cy="2.5" r="2" fill="#F5C518"/>
    <path d="M24 45 L26 50 L28 45" fill="#C4930A"/>
    <path d="M19 11 L23 12.5" stroke="#2D1A0D" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M29 12.5 L33 11" stroke="#2D1A0D" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`;
}

function waspSVG() {
  return `<svg viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="16" cy="13" rx="14" ry="7" fill="rgba(220,180,50,0.55)" stroke="rgba(180,130,20,0.7)" stroke-width="1.2"/>
    <ellipse cx="42" cy="13" rx="14" ry="7" fill="rgba(220,180,50,0.55)" stroke="rgba(180,130,20,0.7)" stroke-width="1.2"/>
    <ellipse cx="29" cy="38" rx="9" ry="18" fill="#8B6914"/>
    <rect x="20" y="29" width="18" height="5" rx="2" fill="#FFD700" opacity=".95"/>
    <rect x="20" y="38" width="18" height="5" rx="2" fill="#FFD700" opacity=".95"/>
    <rect x="20" y="46" width="18" height="4" rx="2" fill="#FFD700" opacity=".8"/>
    <rect x="24" y="23" width="10" height="8" rx="4" fill="#5A3A00"/>
    <circle cx="29" cy="17" r="9" fill="#6B4400"/>
    <ellipse cx="24.5" cy="15" rx="3.2" ry="3.8" fill="#FF4500"/>
    <ellipse cx="33.5" cy="15" rx="3.2" ry="3.8" fill="#FF4500"/>
    <circle cx="25" cy="14.5" r="1.4" fill="#200000"/>
    <circle cx="34" cy="14.5" r="1.4" fill="#200000"/>
    <line x1="24" y1="9" x2="18" y2="2" stroke="#3A2000" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="34" y1="9" x2="40" y2="2" stroke="#3A2000" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="17" cy="1.5" r="2.2" fill="#8B6914"/>
    <circle cx="41" cy="1.5" r="2.2" fill="#8B6914"/>
    <path d="M25 55 L29 62 L33 55" fill="#5A3A00"/>
  </svg>`;
}

function queenSVG() {
  return `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="45" r="36" fill="rgba(255,50,50,0.08)"/>
    <path d="M24 20 L30 8 L40 14 L50 8 L56 20 Z" fill="#FFD700" stroke="#FF8C00" stroke-width="1.5"/>
    <circle cx="24" cy="21" r="3.2" fill="#FF2A2A"/>
    <circle cx="40" cy="15" r="3.2" fill="#FF2A2A"/>
    <circle cx="56" cy="21" r="3.2" fill="#FF2A2A"/>
    <ellipse cx="22" cy="30" rx="18" ry="11" fill="rgba(255,200,200,0.82)" stroke="rgba(255,100,100,0.6)" stroke-width="1.5"/>
    <ellipse cx="58" cy="30" rx="18" ry="11" fill="rgba(255,200,200,0.82)" stroke="rgba(255,100,100,0.6)" stroke-width="1.5"/>
    <ellipse cx="40" cy="57" rx="16" ry="20" fill="#FF4500"/>
    <rect x="25" y="48" width="30" height="6" rx="3" fill="#2D1A0D" opacity=".9"/>
    <rect x="25" y="58" width="30" height="6" rx="3" fill="#2D1A0D" opacity=".9"/>
    <circle cx="40" cy="34" r="14" fill="#FF4500"/>
    <circle cx="34" cy="32" r="5" fill="white"/><circle cx="46" cy="32" r="5" fill="white"/>
    <circle cx="34.5" cy="32" r="3" fill="#200000"/><circle cx="46.5" cy="32" r="3" fill="#200000"/>
    <circle cx="34" cy="31" r="1" fill="white"/><circle cx="46" cy="31" r="1" fill="white"/>
    <path d="M29 27 L35 29.5" stroke="#200000" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M45 29.5 L51 27" stroke="#200000" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="34" y1="22" x2="27" y2="14" stroke="#2D1A0D" stroke-width="2" stroke-linecap="round"/>
    <line x1="46" y1="22" x2="53" y2="14" stroke="#2D1A0D" stroke-width="2" stroke-linecap="round"/>
    <circle cx="26" cy="13" r="3" fill="#FF4500"/><circle cx="54" cy="13" r="3" fill="#FF4500"/>
    <path d="M36 74 L40 80 L44 74" fill="#C4930A"/>
  </svg>`;
}

function honeyPotSVG() {
  return `<svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
    <circle cx="28" cy="32" r="22" fill="rgba(245,166,35,0.18)"/>
    <path d="M10 20 Q10 14 16 14 L40 14 Q46 14 46 20 L46 44 Q46 50 40 50 L16 50 Q10 50 10 44 Z" fill="#F5C518"/>
    <rect x="14" y="8" width="28" height="8" rx="4" fill="#C07A10"/>
    <rect x="18" y="6" width="20" height="4" rx="2" fill="#E08A20"/>
    <ellipse cx="22" cy="24" rx="5" ry="8" fill="rgba(255,255,200,0.38)" transform="rotate(-15 22 24)"/>
    <text x="28" y="42" text-anchor="middle" font-size="16">🍯</text>
    <circle cx="44" cy="14" r="3" fill="#FFD700" opacity=".9"/>
    <circle cx="8" cy="18" r="2.2" fill="#FFD700" opacity=".7"/>
  </svg>`;
}

// ─── ENVIRONMENT ──────────────────────────────
function makeClouds() {
  document.querySelectorAll('.cloud').forEach(c => c.remove());
  for (let i = 0; i < 7; i++) {
    const c = document.createElement('div');
    c.className = 'cloud';
    const w = 70 + Math.random() * 140;
    c.style.cssText = `width:${w}px;height:${w*0.44}px;top:${4+Math.random()*22}%;left:${Math.random()*100}vw;animation-duration:${16+Math.random()*28}s;animation-delay:${-Math.random()*40}s;opacity:${0.48+Math.random()*0.42}`;
    bg.appendChild(c);
  }
}

function makeGrass() {
  const g = document.getElementById('ground');
  g.querySelectorAll('.grass-blade,.flower').forEach(el => el.remove());
  for (let i = 0; i < 65; i++) {
    const b = document.createElement('div');
    b.className = 'grass-blade';
    b.style.cssText = `left:${Math.random()*100}%;height:${8+Math.random()*20}px;transform:rotate(${-18+Math.random()*36}deg);opacity:${0.68+Math.random()*0.32}`;
    g.appendChild(b);
  }
  const flowers = ['🌸','🌼','🌻','🌺','🌷','💐'];
  for (let i = 0; i < 12; i++) {
    const f = document.createElement('div');
    f.className = 'flower';
    f.textContent = flowers[Math.floor(Math.random()*flowers.length)];
    f.style.cssText = `left:${3+Math.random()*94}%;font-size:${1.1+Math.random()*0.7}rem;animation-delay:${-Math.random()*3}s;animation-duration:${2.5+Math.random()*2}s`;
    g.appendChild(f);
  }
}

// ─── MENU NAVIGATION ──────────────────────────
function handlePlay() {
  const val = document.getElementById('pseudo-input').value.trim();
  playerName = val || 'Joueur';
  startGame();
}

function showRules() {
  document.getElementById('menu-screen').style.display = 'none';
  document.getElementById('rules-screen').style.display = 'flex';
}
function hideRules() {
  document.getElementById('rules-screen').style.display = 'none';
  document.getElementById('menu-screen').style.display = 'flex';
}
function backToMenu() {
  document.getElementById('gameover-screen').style.display = 'none';
  document.getElementById('menu-screen').style.display = 'flex';
  bg.classList.remove('storm');
  makeClouds();
}

document.getElementById('pseudo-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') handlePlay();
});

// ─── SPAWN BEE ────────────────────────────────
function spawnBee(forceQueen = false) {
  if (!gameRunning) return;
  if (document.querySelectorAll('.bee:not(.dying)').length >= getMaxEnemies(level)) return;

  const isQueen = forceQueen || (!queenAlive && level >= 5 && Math.random() < 0.07);
  const isWasp  = !isQueen && Math.random() < getWaspChance(level);

  const bee = document.createElement('div');
  if (isQueen) {
    bee.className = 'bee queen';
    bee.innerHTML = queenSVG();
    queenAlive = true;
  } else if (isWasp) {
    bee.className = 'bee wasp';
    bee.innerHTML = waspSVG();
  } else {
    bee.className = 'bee normal';
    bee.innerHTML = beeSVG();
  }

  const fromLeft = Math.random() < 0.5;
  const sx = fromLeft ? -90 : window.innerWidth + 10;
  const sy = 80 + Math.random() * (window.innerHeight - 320);
  bee.style.left = sx + 'px';
  bee.style.top  = sy + 'px';

  const tx = window.innerWidth / 2 - (isQueen ? 42 : isWasp ? 29 : 27);
  const ty = window.innerHeight - 210;
  const ang = Math.atan2(ty - sy, tx - sx);

  let spd = getSpeed(level);
  if (isWasp)  spd *= 1.55;
  if (isQueen) spd *= 0.70;

  let vx = Math.cos(ang) * spd * 2;
  let vy = Math.sin(ang) * spd * 2;
  let x = sx, y = sy, waveTick = Math.random() * Math.PI * 2;

  bee.addEventListener('click', e => {
    e.stopPropagation();
    initAudio();
    if (bee.classList.contains('dying')) return;
    killBee(bee, x, y, false, isQueen, isWasp);
  });

  gameEl.appendChild(bee);

  if (isQueen) {
    queenAlert.classList.remove('show');
    void queenAlert.offsetWidth;
    queenAlert.classList.add('show');
    queenAlert.addEventListener('animationend', () => queenAlert.classList.remove('show'), { once: true });
    sndLevel();
  }
  if (isWasp && Math.random() < 0.25) {
    waspAlert.classList.remove('show');
    void waspAlert.offsetWidth;
    waspAlert.classList.add('show');
    waspAlert.addEventListener('animationend', () => waspAlert.classList.remove('show'), { once: true });
  }

  const anim = { raf: null, done: false };
  function move() {
    if (!gameRunning || bee.classList.contains('dying')) {
      cancelAnimationFrame(anim.raf);
      return;
    }
    waveTick += isWasp ? 0.12 : isQueen ? 0.042 : 0.085;
    x += vx;
    y += vy + Math.sin(waveTick) * (isQueen ? 2.5 : isWasp ? 1.8 : 1.4);

    const bx2 = window.innerWidth / 2;
    const by2 = window.innerHeight - 160;
    const hitRadius = isQueen ? 96 : isWasp ? 74 : 72;
    const d = Math.hypot(x + (isQueen ? 42 : isWasp ? 29 : 27) - bx2, y + (isQueen ? 42 : 27) - by2);

    if (d < hitRadius && !anim.done) {
      anim.done = true;
      hitBear(bee, x, y, isQueen, isWasp);
      return;
    }

    bee.style.left = x + 'px';
    bee.style.top  = y + 'px';
    bee.style.transform = vx < 0 ? 'scaleX(-1)' : '';
    anim.raf = requestAnimationFrame(move);
  }
  anim.raf = requestAnimationFrame(move);
}

// ─── HIT BEAR ─────────────────────────────────
function hitBear(bee, bx, by, isQueen, isWasp) {
  if (bee.classList.contains('dying')) return;
  bee.remove();
  if (isQueen) queenAlive = false;

  if (shielded) {
    showMsg(window.innerWidth/2-30, window.innerHeight-210, '🛡️ BLOQUÉ !', '#00BFFF');
    shieldBubble.style.animation = 'none';
    void shieldBubble.offsetWidth;
    shieldBubble.style.animation = '';
    playTone(440,'sine',0.2,0.3);
    return;
  }

  loseHeart();
  isWasp ? sndWasp() : sndHurt();
  bear.classList.remove('hurt');
  void bear.offsetWidth;
  bear.classList.add('hurt');
  bear.addEventListener('animationend', () => bear.classList.remove('hurt'), { once: true });

  gameEl.style.transform = `translate(${(Math.random()-0.5)*18}px,${(Math.random()-0.5)*12}px)`;
  setTimeout(() => { gameEl.style.transform = ''; }, 140);
  resetCombo();
}

// ─── KILL BEE (1 click) ───────────────────────
function killBee(bee, bx, by, stun, isQueen, isWasp) {
  if (bee.classList.contains('dying')) return;

  const scared = !isQueen && !isWasp && !stun && Math.random() < 0.12;
  if (scared) {
    showMsg(bx, by, ['😱','🏃','Nooon!','Peur!'][Math.floor(Math.random()*4)], '#7FDBFF');
    const ang = Math.random()*Math.PI*2;
    let sx = bx, sy = by, t = 0;
    const fx = Math.cos(ang)*10, fy = Math.sin(ang)*10;
    const flee = () => {
      sx += fx; sy += fy; t++;
      bee.style.left = sx+'px'; bee.style.top = sy+'px';
      bee.style.opacity = Math.max(0, 1-t/25);
      if (t < 25) requestAnimationFrame(flee);
      else bee.remove();
    };
    requestAnimationFrame(flee);
    return;
  }

  bee.classList.add('dying');
  if (isQueen) queenAlive = false;
  bee.addEventListener('animationend', () => bee.remove(), { once: true });

  const sz = isQueen ? 105 : isWasp ? 75 : 65;
  const splash = document.createElement('div');
  splash.className = isWasp ? 'wasp-splash' : 'honey-splash';
  splash.style.cssText = `left:${bx}px;top:${by}px;width:${sz}px;height:${sz}px;`;
  if (isQueen) splash.style.background = 'radial-gradient(circle,rgba(255,80,0,.9),rgba(255,200,0,.5))';
  gameEl.appendChild(splash);
  splash.addEventListener('animationend', () => splash.remove());

  const sparkles = ['✨','💫','⭐','🌟'];
  for (let i = 0; i < (isQueen ? 5 : 2); i++) {
    const sp = document.createElement('div');
    sp.className = 'sparkle';
    sp.textContent = sparkles[Math.floor(Math.random()*sparkles.length)];
    sp.style.cssText = `position:absolute;pointer-events:none;z-index:60;font-size:1.2rem;left:${bx+(Math.random()-0.5)*60}px;top:${by+(Math.random()-0.5)*60}px;animation:sparklePop 0.6s ease-out forwards;animation-delay:${i*0.08}s`;
    gameEl.appendChild(sp);
    sp.addEventListener('animationend', () => sp.remove());
  }

  const parts = isQueen
    ? ['#FF4500','#FFD700','#FF2A2A','#FFA500','white']
    : isWasp
      ? ['#8B6914','#FFD700','#FF6600','#C4930A','#3A2000']
      : ['#F5C518','#FF8C00','#FFD700','#FFF8E7','#2D1A0D'];
  spawnParts(bx, by, parts, isQueen ? 22 : isWasp ? 14 : 10);

  totalKills++;
  if (isQueen) { totalQueens++; sndQueen(); showMsg(bx, by-30, '👑 +150 POINTS !', '#FFD700'); }
  else if (isWasp) { totalWasps++; sndWasp(); }
  else sndKill();

  addCombo();
  const multi = getMulti();
  const basePoints = isQueen ? 150 : isWasp ? 20 : scorePerBee;
  const pts = Math.round(basePoints * multi);
  addScore(pts);

  const col = isWasp ? '#FF8C00' : isQueen ? '#FFD700' : '#F5C518';
  if (multi > 1) showMsg(bx, by, `x${multi} +${pts}`, comboColor());
  else showMsg(bx, by, `+${pts}`, col);
}

// ─── PARTICLES ────────────────────────────────
function spawnParts(bx, by, colors, n) {
  for (let i = 0; i < n; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const s  = 5 + Math.random()*10;
    const tx = (Math.random()-0.5)*140;
    const ty = -55 - Math.random()*75;
    p.style.cssText = `left:${bx+22}px;top:${by+22}px;width:${s}px;height:${s}px;background:${colors[Math.floor(Math.random()*colors.length)]};--tx:${tx}px;--ty:${ty}px;`;
    gameEl.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }
}

// ─── COMBO ────────────────────────────────────
function addCombo() {
  comboCount++;
  if (comboCount > maxCombo) maxCombo = comboCount;
  comboPct = 100;
  comboDisplay.classList.add('active');
  const m = getMulti();
  comboText.textContent = comboCount >= 2
    ? `x${m} COMBO ! ${'🔥'.repeat(Math.min(m,5))}`
    : '🐝 Bien visé !';
  comboText.style.color = comboColor();
  comboText.style.fontSize = `${1.4 + Math.min(m-1,3)*0.25}rem`;
  if (comboCount >= 3) sndCombo();

  clearTimeout(comboTimeout);
  clearInterval(comboDecayInterval);
  comboDecayInterval = setInterval(() => {
    comboPct -= 2;
    comboBarEl.style.width  = Math.max(0,comboPct)+'%';
    comboBarEl.style.background = comboColor();
    if (comboPct <= 0) { clearInterval(comboDecayInterval); resetCombo(); }
  }, 60);
  comboTimeout = setTimeout(resetCombo, 3000);
}

function resetCombo() {
  comboCount = 0; comboPct = 0;
  comboDisplay.classList.remove('active');
  clearTimeout(comboTimeout);
  clearInterval(comboDecayInterval);
}

function getMulti() {
  if (comboCount >= 10) return 5;
  if (comboCount >= 7)  return 4;
  if (comboCount >= 4)  return 3;
  if (comboCount >= 2)  return 2;
  return 1;
}

function comboColor() {
  return ['#FFD700','#FFD700','#FF8C00','#FF4500','#FF0080','#FF0000'][getMulti()] || '#FFD700';
}

// ─── HONEY POT ────────────────────────────────
function spawnHoneyPot() {
  if (!gameRunning) return;
  const pot = document.createElement('div');
  pot.className = 'honeypot';
  pot.innerHTML = honeyPotSVG();
  pot.style.left = (80 + Math.random()*(window.innerWidth-190)) + 'px';
  gameEl.appendChild(pot);

  pot.addEventListener('click', e => {
    e.stopPropagation();
    initAudio();
    pot.classList.add('collecting');
    sndHoney();
    const cx = parseFloat(pot.style.left);
    const cy = parseFloat(pot.style.top) || 150;
    if (!shielded && (lives >= 3 || Math.random() < 0.4)) {
      activateShield();
      showMsg(cx, cy, '🛡️ BOUCLIER !', '#00BFFF');
      showNotif('🛡️ Bouclier activé ! (5 sec)');
    } else {
      gainHeart();
      showMsg(cx, cy, '❤️ +1 VIE !', '#FF69B4');
      showNotif('❤️ Vie récupérée !');
    }
    pot.addEventListener('animationend', () => pot.remove(), { once: true });
  });

  setTimeout(() => { if (pot.parentNode) pot.remove(); }, 4500);
  honeyPotTimeout = setTimeout(spawnHoneyPot, 8000 + Math.random()*10000);
}

function activateShield() {
  shielded = true;
  shieldBubble.style.display = 'block';
  bear.classList.add('shielded');
  shieldHud.style.display = 'block';
  clearTimeout(shieldTimer);
  shieldTimer = setTimeout(deactivateShield, 5000);
}
function deactivateShield() {
  shielded = false;
  shieldBubble.style.display = 'none';
  shieldHud.style.display    = 'none';
  bear.classList.remove('shielded');
}
function gainHeart() {
  if (lives >= 3) return;
  const h = hearts[lives];
  h.classList.remove('lost','losing');
  h.classList.add('gaining');
  h.addEventListener('animationend', () => h.classList.remove('gaining'), { once: true });
  lives++;
}
function showNotif(txt) {
  const n = document.createElement('div');
  n.className = 'powerup-notif';
  n.textContent = txt;
  document.body.appendChild(n);
  n.addEventListener('animationend', () => n.remove());
}

// ─── LIGHTNING ────────────────────────────────
function spawnLightning() {
  if (!gameRunning || level < 6) return;
  const n = 1 + Math.floor(Math.random()*3);
  for (let i = 0; i < n; i++) {
    setTimeout(() => {
      if (!gameRunning) return;
      const bolt = document.createElement('div');
      bolt.className = 'lightning';
      bolt.style.left   = Math.random()*window.innerWidth + 'px';
      bolt.style.height = (200 + Math.random()*300) + 'px';
      bolt.style.transform = `rotate(${-6+Math.random()*12}deg)`;
      bg.appendChild(bolt);
      sndBolt();
      bolt.addEventListener('animationend', () => bolt.remove());
    }, i*200 + Math.random()*300);
  }
  const next = level >= 8
    ? 1500 + Math.random()*2000
    : 3000 + Math.random()*4000;
  lightningTimeout = setTimeout(spawnLightning, next);
}

// ─── SCORE & LEVEL ────────────────────────────
function addScore(pts) {
  score += pts;
  scoreEl.textContent = Math.floor(score);
  scoreEl.style.transform = 'scale(1.4)';
  setTimeout(() => { scoreEl.style.transform = ''; }, 190);
  checkLevel();
}
function loseHeart() {
  if (lives <= 0) return;
  lives--;
  const h = hearts[lives];
  h.classList.add('losing');
  h.addEventListener('animationend', () => h.classList.add('lost'), { once: true });
  if (lives <= 0) endGame();
}
function showMsg(x, y, txt, col) {
  const m = document.createElement('div');
  m.className = 'score-pop';
  m.textContent = txt;
  m.style.cssText = `left:${x}px;top:${y-12}px;color:${col};`;
  gameEl.appendChild(m);
  m.addEventListener('animationend', () => m.remove());
}
function checkLevel() {
  const nl = lvlThresh.filter(t => score >= t).length;
  if (nl > level) {
    level = nl;
    levelEl.textContent = level;
    scorePerBee = 10 + level * 5;

    bannerText.textContent = `Niveau ${level} !`;
    bannerSub.textContent  = lvlMsg[Math.min(level, lvlMsg.length-1)];
    levelBanner.classList.remove('show');
    void levelBanner.offsetWidth;
    levelBanner.classList.add('show');
    levelBanner.addEventListener('animationend', () => levelBanner.classList.remove('show'), { once: true });

    clearInterval(spawnInterval);
    spawnInterval = setInterval(spawnBee, getSpawnDelay(level));
    sndLevel();

    if (level === 6) {
      bg.classList.add('storm');
      setTimeout(spawnLightning, 500);
    }
  }
}

// ─── TIMER ────────────────────────────────────
function startTimer() {
  gameTimer = 120;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!gameRunning) return;
    gameTimer -= 0.1;
    const pct = Math.max(0, gameTimer/120*100);
    timerBar.style.width = pct + '%';
    const r = Math.round(255*(1-pct/100));
    const g = Math.round(174*(pct/100));
    timerBar.style.background = `linear-gradient(90deg,rgb(${r},${g+80},0),rgb(${r+60},${g+120},0))`;
    score += 1;
    scoreEl.textContent = Math.floor(score);
    checkLevel();
    if (gameTimer <= 0) endGame();
  }, 100);
}

// ─── GAME LIFECYCLE ───────────────────────────
function startGame() {
  initAudio();
  score = 0; lives = 3; level = 1; scorePerBee = 10;
  queenAlive = false; shielded = false;
  totalKills = 0; totalQueens = 0; totalWasps = 0; maxCombo = 0;
  scoreEl.textContent = '0';
  levelEl.textContent = '1';
  hearts.forEach(h => h.classList.remove('lost','losing','gaining'));
  shieldBubble.style.display = 'none';
  shieldHud.style.display    = 'none';
  bear.classList.remove('shielded','hurt');
  bg.classList.remove('storm');
  comboDisplay.classList.remove('active');
  comboCount = 0;
  hudPseudo.textContent = playerName ? `👤 ${playerName}` : '';
  document.getElementById('menu-screen').style.display    = 'none';
  document.getElementById('rules-screen').style.display   = 'none';
  document.getElementById('gameover-screen').style.display= 'none';
  gameEl.innerHTML = '';
  clearTimeout(lightningTimeout);
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  clearTimeout(honeyPotTimeout);
  clearTimeout(shieldTimer);
  gameRunning = true;
  setTimeout(spawnBee, 300);
  spawnInterval = setInterval(spawnBee, getSpawnDelay(level));
  startTimer();
  honeyPotTimeout = setTimeout(spawnHoneyPot, 9000 + Math.random()*5000);
}

function endGame() {
  gameRunning = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  clearTimeout(honeyPotTimeout);
  clearTimeout(shieldTimer);
  clearTimeout(lightningTimeout);
  document.querySelectorAll('.bee,.honeypot,.lightning').forEach(e => e.remove());
  deactivateShield();
  resetCombo();
  const mm = maxCombo >= 10 ? 5 : maxCombo >= 7 ? 4 : maxCombo >= 4 ? 3 : maxCombo >= 2 ? 2 : 1;
  document.getElementById('final-pseudo').textContent = playerName ? `🐻 Bravo ${playerName} !` : '';
  document.getElementById('final-score').textContent = Math.floor(score) + ' pts';
  document.getElementById('final-stats').innerHTML =
    `Niveau atteint : <b>${level}</b><br>` +
    `Ennemis éliminés : <b>${totalKills}</b><br>` +
    `Guêpes vaincues : <b>${totalWasps} 🟡</b><br>` +
    (totalQueens ? `Reines vaincues : <b>${totalQueens} 👑</b><br>` : '') +
    `Meilleur combo : <b>${maxCombo > 1 ? 'x'+mm+' ('+maxCombo+' kills)' : maxCombo+' kill'}</b>`;
  document.getElementById('gameover-screen').style.display = 'flex';
}

makeClouds();
makeGrass();