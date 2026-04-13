/* ══════════════════════════════════════════════
   SÉLECTION DES ÉLÉMENTS DU DOM
   ══════════════════════════════════════════════ */
const gameEl       = document.getElementById('game');
const scoreEl      = document.getElementById('score-num');
const levelEl      = document.getElementById('level-num');
const hearts       = [document.getElementById('h1'), document.getElementById('h2'), document.getElementById('h3')];
const timerBar     = document.getElementById('timer-bar');
const bear         = document.getElementById('bear');
const shieldBubble = document.getElementById('shield-bubble');
const shieldHud    = document.getElementById('shield-hud');
const levelBanner  = document.getElementById('level-banner');
const bannerText   = document.getElementById('banner-text');
const bannerSub    = document.getElementById('banner-sub');
const comboDisplay = document.getElementById('combo-display');
const comboText    = document.getElementById('combo-text');
const comboBarEl   = document.getElementById('combo-bar');
const queenAlert   = document.getElementById('queen-alert');
const waspAlert    = document.getElementById('wasp-alert');
const bg           = document.getElementById('bg');
const hudPseudo    = document.getElementById('hud-pseudo');
const slowmoOv     = document.getElementById('slowmo-overlay');
const slowmoHud    = document.getElementById('slowmo-hud');

/* ══════════════════════════════════════════════
   VARIABLES D'ÉTAT DU JEU
   ══════════════════════════════════════════════ */
let score       = 0;
let lives       = 3;
let level       = 1;
let gameRunning = false;
let scorePerBee = 10;

let spawnInterval = null;
let timerInterval = null;
let gameTimer     = 0;

let shielded    = false;
let shieldTimer = null;

let comboCount         = 0;
let comboTimeout       = null;
let comboDecayInterval = null;
let comboPct           = 100;
let maxCombo           = 0;

let queenAlive = false;

let honeyPotTimeout  = null;
let chronoTimeout    = null;
let hiveTimeout      = null;
let lightningTimeout = null;

let totalKills  = 0;
let totalQueens = 0;
let totalWasps  = 0;

let slowFactor   = 1;
let slowMoActive = false;
let slowMoTimer  = null;

let playerName = '';

const BGM_FILE_PATH = 'the_mountain-instrumental-513154.mp3';
const BGM_VOLUME = 0.12;
const SFX_VOLUME_MULTIPLIER = 1.35;
let bgMusic = null;

/* ══════════════════════════════════════════════
   CONFIGURATION DES NIVEAUX
   ══════════════════════════════════════════════ */
function getSpeed(lvl)      { return 0.50 + (lvl - 1) * 0.14; }
function getSpawnDelay(lvl) { return Math.max(300, 2500 - (lvl - 1) * 220); }
function getMaxEnemies(lvl) { return Math.min(3 + lvl * 2, 26); }
function getWaspChance(lvl) {
  if (lvl < 3) return 0;
  return Math.min(0.12 + (lvl - 3) * 0.07, 0.55);
}

const LEVEL_THRESHOLDS = [0, 150, 350, 600, 950, 1400, 1950, 2600, 3400, 4350, 5500];

const LEVEL_MESSAGES = [
  '', 'Ça commence !', "Elles s'énervent 🐝", 'Les guêpes arrivent ⚠️',
  'Invasion ! 🔥', 'La Reine approche…', 'Orage en vue ⛈️',
  'Légendaire ! 🏆', 'Sans pitié… 💀', "T'es encore là ?!", 'IMPOSSIBLE !!!'
];

/* ══════════════════════════════════════════════
   SYSTÈME AUDIO (Web Audio API)
   ══════════════════════════════════════════════ */
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playTone(freq, type, dur, vol = 0.3, delay = 0) {
  if (!audioCtx) return;
  const now  = audioCtx.currentTime + delay;
  const osc  = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  const boostedVol = Math.min(vol * SFX_VOLUME_MULTIPLIER, 1);
  gain.gain.setValueAtTime(boostedVol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
  osc.start(now);
  osc.stop(now + dur);
}

function startBackgroundMusic() {
  if (!bgMusic) {
    bgMusic = new Audio(BGM_FILE_PATH);
    bgMusic.loop = true;
    bgMusic.preload = 'auto';
  }

  bgMusic.volume = BGM_VOLUME;
  bgMusic.currentTime = 0;
  bgMusic.play().catch(() => {
    // Browser may block autoplay if no user interaction happened yet.
  });
}

function stopBackgroundMusic() {
  if (!bgMusic) return;
  bgMusic.pause();
  bgMusic.currentTime = 0;
}

function sndKill()  { playTone(880,'square',0.08,0.25); playTone(660,'square',0.12,0.2,0.06); }
function sndWasp()  { playTone(440,'sawtooth',0.08,0.3); playTone(330,'sawtooth',0.1,0.25,0.05); }
function sndHurt()  { playTone(110,'sawtooth',0.3,0.4); playTone(80,'sawtooth',0.2,0.3,0.1); }
function sndCombo() { [523,659,784,1047].forEach((f,i) => playTone(f,'square',0.12,0.2,i*0.07)); }
function sndHoney() { [523,659,784].forEach((f,i) => playTone(f,'sine',0.2,0.3,i*0.1)); }
function sndQueen() { [1047,880,784,523,330].forEach((f,i) => playTone(f,'square',0.15,0.35,i*0.08)); }
function sndLevel() { [330,440,550,660,880].forEach((f,i) => playTone(f,'triangle',0.18,0.28,i*0.06)); }
function sndBolt()  { playTone(40,'sawtooth',0.4,0.5); playTone(80,'sawtooth',0.3,0.4,0.05); }
function sndChrono(){ [800,1000,1200,1500].forEach((f,i) => playTone(f,'sine',0.15,0.3,i*0.06)); }
function sndHive()  { playTone(200,'sawtooth',0.3,0.5); playTone(150,'sawtooth',0.2,0.4,0.1); }

/* ══════════════════════════════════════════════
   SVG DES PERSONNAGES ET OBJETS
   ══════════════════════════════════════════════ */
function beeSVG() {
  return `<svg viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="18" cy="14" rx="13" ry="8" fill="rgba(200,230,255,.78)" stroke="rgba(100,160,220,.5)" stroke-width="1"/>
    <ellipse cx="34" cy="14" rx="13" ry="8" fill="rgba(200,230,255,.78)" stroke="rgba(100,160,220,.5)" stroke-width="1"/>
    <ellipse cx="26" cy="30" rx="12" ry="16" fill="#F5C518"/>
    <rect x="14.5" y="24" width="23" height="5" rx="2" fill="#2D1A0D" opacity=".88"/>
    <rect x="14.5" y="32" width="23" height="5" rx="2" fill="#2D1A0D" opacity=".88"/>
    <circle cx="26" cy="16" r="9" fill="#F5C518"/>
    <circle cx="22" cy="14" r="3" fill="white"/><circle cx="30" cy="14" r="3" fill="white"/>
    <circle cx="22.5" cy="14" r="1.8" fill="#1A0A00"/><circle cx="30.5" cy="14" r="1.8" fill="#1A0A00"/>
    <line x1="21" y1="8" x2="16" y2="3" stroke="#2D1A0D" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="31" y1="8" x2="36" y2="3" stroke="#2D1A0D" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="15.5" cy="2.5" r="2" fill="#F5C518"/>
    <circle cx="36.5" cy="2.5" r="2" fill="#F5C518"/>
    <path d="M24 45 L26 50 L28 45" fill="#C4930A"/>
  </svg>`;
}

function waspSVG() {
  return `<svg viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="16" cy="13" rx="14" ry="7" fill="rgba(220,180,50,.55)" stroke="rgba(180,130,20,.7)" stroke-width="1.2"/>
    <ellipse cx="42" cy="13" rx="14" ry="7" fill="rgba(220,180,50,.55)" stroke="rgba(180,130,20,.7)" stroke-width="1.2"/>
    <ellipse cx="29" cy="38" rx="9" ry="18" fill="#8B6914"/>
    <rect x="20" y="29" width="18" height="5" rx="2" fill="#FFD700" opacity=".95"/>
    <rect x="20" y="38" width="18" height="5" rx="2" fill="#FFD700" opacity=".95"/>
    <rect x="24" y="23" width="10" height="8" rx="4" fill="#5A3A00"/>
    <circle cx="29" cy="17" r="9" fill="#6B4400"/>
    <ellipse cx="24.5" cy="15" rx="3.2" ry="3.8" fill="#FF4500"/>
    <ellipse cx="33.5" cy="15" rx="3.2" ry="3.8" fill="#FF4500"/>
    <circle cx="25" cy="14.5" r="1.4" fill="#200000"/>
    <circle cx="34" cy="14.5" r="1.4" fill="#200000"/>
    <line x1="24" y1="9" x2="18" y2="2" stroke="#3A2000" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="34" y1="9" x2="40" y2="2" stroke="#3A2000" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M25 55 L29 62 L33 55" fill="#5A3A00"/>
  </svg>`;
}

function queenSVG() {
  return `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 20 L30 8 L40 14 L50 8 L56 20 Z" fill="#FFD700" stroke="#FF8C00" stroke-width="1.5"/>
    <circle cx="24" cy="21" r="3.2" fill="#FF2A2A"/>
    <circle cx="40" cy="15" r="3.2" fill="#FF2A2A"/>
    <circle cx="56" cy="21" r="3.2" fill="#FF2A2A"/>
    <ellipse cx="22" cy="30" rx="18" ry="11" fill="rgba(255,200,200,.82)" stroke="rgba(255,100,100,.6)" stroke-width="1.5"/>
    <ellipse cx="58" cy="30" rx="18" ry="11" fill="rgba(255,200,200,.82)" stroke="rgba(255,100,100,.6)" stroke-width="1.5"/>
    <ellipse cx="40" cy="57" rx="16" ry="20" fill="#FF4500"/>
    <rect x="25" y="48" width="30" height="6" rx="3" fill="#2D1A0D" opacity=".9"/>
    <rect x="25" y="58" width="30" height="6" rx="3" fill="#2D1A0D" opacity=".9"/>
    <circle cx="40" cy="34" r="14" fill="#FF4500"/>
    <circle cx="34" cy="32" r="5" fill="white"/>
    <circle cx="46" cy="32" r="5" fill="white"/>
    <circle cx="34.5" cy="32" r="3" fill="#200000"/>
    <circle cx="46.5" cy="32" r="3" fill="#200000"/>
    <path d="M29 27 L35 29.5" stroke="#200000" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M45 29.5 L51 27" stroke="#200000" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="34" y1="22" x2="27" y2="14" stroke="#2D1A0D" stroke-width="2" stroke-linecap="round"/>
    <line x1="46" y1="22" x2="53" y2="14" stroke="#2D1A0D" stroke-width="2" stroke-linecap="round"/>
    <circle cx="26" cy="13" r="3" fill="#FF4500"/>
    <circle cx="54" cy="13" r="3" fill="#FF4500"/>
    <path d="M36 74 L40 80 L44 74" fill="#C4930A"/>
  </svg>`;
}

function honeyPotSVG() {
  return `<svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 20 Q10 14 16 14 L40 14 Q46 14 46 20 L46 44 Q46 50 40 50 L16 50 Q10 50 10 44 Z" fill="#F5C518"/>
    <rect x="14" y="8" width="28" height="8" rx="4" fill="#C07A10"/>
    <rect x="18" y="6" width="20" height="4" rx="2" fill="#E08A20"/>
    <text x="28" y="42" text-anchor="middle" font-size="16">🍯</text>
  </svg>`;
}

function hiveSVG() {
  return `<svg viewBox="0 0 88 88" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="44" cy="52" rx="30" ry="26" fill="#8B4513"/>
    <ellipse cx="44" cy="50" rx="27" ry="23" fill="#C4821A"/>
    <polygon points="35,44 39,38 47,38 51,44 47,50 39,50" fill="#F5A623" stroke="#8B4513" stroke-width="1.2" opacity="0.9"/>
    <polygon points="22,44 26,38 34,38 38,44 34,50 26,50" fill="#F5A623" stroke="#8B4513" stroke-width="1.2" opacity="0.85"/>
    <polygon points="48,44 52,38 60,38 64,44 60,50 52,50" fill="#F5A623" stroke="#8B4513" stroke-width="1.2" opacity="0.85"/>
    <polygon points="28,57 32,51 40,51 44,57 40,63 32,63" fill="#FFD700" stroke="#8B4513" stroke-width="1.2" opacity="0.8"/>
    <polygon points="44,57 48,51 56,51 60,57 56,63 48,63" fill="#FFD700" stroke="#8B4513" stroke-width="1.2" opacity="0.8"/>
    <polygon points="28,31 32,25 40,25 44,31 40,37 32,37" fill="#F5C518" stroke="#8B4513" stroke-width="1.2" opacity="0.75"/>
    <polygon points="44,31 48,25 56,25 60,31 56,37 48,37" fill="#F5C518" stroke="#8B4513" stroke-width="1.2" opacity="0.75"/>
    <ellipse cx="44" cy="68" rx="10" ry="6" fill="#3A1A00"/>
    <ellipse cx="44" cy="67" rx="7"  ry="4" fill="#2A0F00"/>
    <path d="M44 14 Q44 6 52 4" stroke="#5A3A1A" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <circle cx="52" cy="4" r="3" fill="#5A3A1A"/>
    <circle cx="58" cy="30" r="4" fill="#F5C518"/>
    <ellipse cx="55" cy="27" rx="5" ry="3" fill="rgba(200,230,255,.7)"/>
    <ellipse cx="61" cy="27" rx="5" ry="3" fill="rgba(200,230,255,.7)"/>
    <text x="44" y="22" text-anchor="middle" font-size="10">⚠️</text>
  </svg>`;
}

function chronoSVG() {
  return `<svg viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg">
    <circle cx="29" cy="35" r="21" fill="#003A6B" stroke="#00BFFF" stroke-width="2.5"/>
    <circle cx="29" cy="35" r="17" fill="#004080"/>
    <ellipse cx="23" cy="28" rx="6" ry="4" fill="rgba(255,255,255,.18)" transform="rotate(-20 23 28)"/>
    <line x1="29" y1="35" x2="29" y2="22" stroke="#00BFFF" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="29" y1="35" x2="38" y2="39" stroke="#FFD700" stroke-width="2" stroke-linecap="round"/>
    <circle cx="29" cy="35" r="2.5" fill="#00BFFF"/>
    <rect x="25" y="10" width="8" height="5" rx="2" fill="#00BFFF"/>
    <text x="29" y="50" text-anchor="middle" font-size="8" fill="#00BFFF" font-weight="bold" font-family="sans-serif">SLOW</text>
  </svg>`;
}

/* ══════════════════════════════════════════════
   CRÉATION DE L'ENVIRONNEMENT
   ══════════════════════════════════════════════ */
function makeClouds() {
  document.querySelectorAll('.cloud').forEach(c => c.remove());
  for (let i = 0; i < 7; i++) {
    const c = document.createElement('div');
    c.className = 'cloud';
    const w = 70 + Math.random() * 140;
    c.style.cssText = `
      width:${w}px; height:${w * 0.44}px;
      top:${4 + Math.random() * 22}%;
      left:${Math.random() * 100}vw;
      animation-duration:${16 + Math.random() * 28}s;
      animation-delay:${-Math.random() * 40}s;
      opacity:${0.48 + Math.random() * 0.42}
    `;
    bg.appendChild(c);
  }
}

function makeGrass() {
  const g = document.getElementById('ground');
  g.querySelectorAll('.grass-blade, .flower').forEach(el => el.remove());
  for (let i = 0; i < 65; i++) {
    const b = document.createElement('div');
    b.className = 'grass-blade';
    b.style.cssText = `
      left:${Math.random() * 100}%;
      height:${8 + Math.random() * 20}px;
      transform:rotate(${-18 + Math.random() * 36}deg);
      opacity:${0.68 + Math.random() * 0.32}
    `;
    g.appendChild(b);
  }
  const fleurs = ['🌸','🌼','🌻','🌺','🌷','💐'];
  for (let i = 0; i < 12; i++) {
    const f = document.createElement('div');
    f.className = 'flower';
    f.textContent = fleurs[Math.floor(Math.random() * fleurs.length)];
    f.style.cssText = `
      left:${3 + Math.random() * 94}%;
      font-size:${1.1 + Math.random() * 0.7}rem;
      animation-delay:${-Math.random() * 3}s;
      animation-duration:${2.5 + Math.random() * 2}s
    `;
    g.appendChild(f);
  }
}

/* ══════════════════════════════════════════════
   NAVIGATION ENTRE LES ÉCRANS
   ══════════════════════════════════════════════ */
function handlePlay() {
  playerName = document.getElementById('pseudo-input').value.trim() || 'Joueur';
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

document.getElementById('pseudo-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') handlePlay();
});

/* ══════════════════════════════════════════════
   SYSTÈME DE RALENTI
   ══════════════════════════════════════════════ */
function activateSlowMo() {
  slowMoActive = true;
  slowFactor   = 0.22;
  slowmoOv.classList.add('active');
  slowmoHud.classList.add('active');
  document.querySelectorAll('.bee:not(.dying)').forEach(b => b.classList.add('slowed'));
  clearTimeout(slowMoTimer);
  slowMoTimer = setTimeout(deactivateSlowMo, 6000);
}

function deactivateSlowMo() {
  slowMoActive = false;
  slowFactor   = 1;
  slowmoOv.classList.remove('active');
  slowmoHud.classList.remove('active');
  document.querySelectorAll('.bee').forEach(b => b.classList.remove('slowed'));
}

/* ══════════════════════════════════════════════
   SPAWN DES ENNEMIS
   ══════════════════════════════════════════════ */
function spawnBee(forceQueen = false) {
  if (!gameRunning) return;
  if (document.querySelectorAll('.bee:not(.dying)').length >= getMaxEnemies(level)) return;

  const isQueen = forceQueen || (!queenAlive && level >= 5 && Math.random() < 0.07);
  const isWasp  = !isQueen && Math.random() < getWaspChance(level);

  const bee = document.createElement('div');
  if (isQueen)     { bee.className = 'bee queen';  bee.innerHTML = queenSVG(); queenAlive = true; }
  else if (isWasp) { bee.className = 'bee wasp';   bee.innerHTML = waspSVG(); }
  else             { bee.className = 'bee normal';  bee.innerHTML = beeSVG(); }

  if (slowMoActive) bee.classList.add('slowed');

  const fromLeft = Math.random() < 0.5;
  const startX   = fromLeft ? -90 : window.innerWidth + 10;
  const startY   = 80 + Math.random() * (window.innerHeight - 320);

  bee.style.left = startX + 'px';
  bee.style.top  = startY + 'px';

  const bearCenterX = window.innerWidth / 2 - (isQueen ? 45 : 32);
  const bearCenterY = window.innerHeight - 210;
  const angle       = Math.atan2(bearCenterY - startY, bearCenterX - startX);

  let baseSpeed = getSpeed(level);
  if (isWasp)  baseSpeed *= 1.5;
  if (isQueen) baseSpeed *= 0.7;

  const baseVx = Math.cos(angle) * baseSpeed * 2;
  const baseVy = Math.sin(angle) * baseSpeed * 2;

  let x = startX, y = startY;
  let waveTick = Math.random() * Math.PI * 2;
  const state = { alive: true, rafId: null };

  bee.addEventListener('click', e => {
    e.stopPropagation();
    initAudio();
    if (!state.alive) return;
    state.alive = false;
    cancelAnimationFrame(state.rafId);
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

  function moveBee() {
    if (!gameRunning || !state.alive) return;

    waveTick += (isWasp ? 0.12 : isQueen ? 0.042 : 0.085) * slowFactor;
    x += baseVx * slowFactor;
    y += baseVy * slowFactor + Math.sin(waveTick) * (isQueen ? 2.5 : isWasp ? 1.8 : 1.4) * slowFactor;

    const beeWidth  = isQueen ? 90 : isWasp ? 66 : 62;
    const beeHeight = isQueen ? 90 : isWasp ? 66 : 62;
    const hitRadius = isQueen ? 85 : isWasp ? 68 : 65;
    const beeCX  = x + beeWidth  / 2;
    const beeCY  = y + beeHeight / 2;
    const bearCX = window.innerWidth  / 2;
    const bearCY = window.innerHeight - 160;
    const dist   = Math.hypot(beeCX - bearCX, beeCY - bearCY);

    if (dist < hitRadius) {
      state.alive = false;
      hitBear(bee, x, y, isQueen, isWasp);
      return;
    }

    bee.style.left = x + 'px';
    bee.style.top  = y + 'px';
    bee.style.transform = baseVx < 0 ? 'scaleX(-1)' : '';
    state.rafId = requestAnimationFrame(moveBee);
  }

  state.rafId = requestAnimationFrame(moveBee);
}

/* ══════════════════════════════════════════════
   COLLISION AVEC L'OURS
   ══════════════════════════════════════════════ */
function hitBear(bee, bx, by, isQueen, isWasp) {
  bee.remove();
  if (isQueen) queenAlive = false;

  if (shielded) {
    showMsg(window.innerWidth / 2 - 30, window.innerHeight - 210, '🛡️ BLOQUÉ !', '#00BFFF');
    shieldBubble.style.animation = 'none';
    void shieldBubble.offsetWidth;
    shieldBubble.style.animation = '';
    playTone(440, 'sine', 0.2, 0.3);
    return;
  }

  loseHeart();
  isWasp ? sndWasp() : sndHurt();

  bear.classList.remove('hurt');
  void bear.offsetWidth;
  bear.classList.add('hurt');
  bear.addEventListener('animationend', () => bear.classList.remove('hurt'), { once: true });

  gameEl.style.transform = `translate(${(Math.random() - 0.5) * 18}px, ${(Math.random() - 0.5) * 12}px)`;
  setTimeout(() => { gameEl.style.transform = ''; }, 140);

  resetCombo();
}

/* ══════════════════════════════════════════════
   TUER UN ENNEMI
   ══════════════════════════════════════════════ */
function killBee(bee, bx, by, stun, isQueen, isWasp) {
  if (!isQueen && !isWasp && !stun && Math.random() < 0.10) {
    showMsg(bx, by, ['😱','🏃','Nooon!','Peur!'][Math.floor(Math.random() * 4)], '#7FDBFF');
    let fx = bx, fy = by, t = 0;
    const ang = Math.random() * Math.PI * 2;
    const dx = Math.cos(ang) * 10, dy = Math.sin(ang) * 10;
    const flee = () => {
      fx += dx; fy += dy; t++;
      bee.style.left = fx + 'px';
      bee.style.top  = fy + 'px';
      bee.style.opacity = Math.max(0, 1 - t / 25);
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
  splash.style.cssText = `left:${bx}px; top:${by}px; width:${sz}px; height:${sz}px;`;
  if (isQueen) splash.style.background = 'radial-gradient(circle,rgba(255,80,0,.9),rgba(255,200,0,.5))';
  gameEl.appendChild(splash);
  splash.addEventListener('animationend', () => splash.remove());

  ['✨','💫','⭐','🌟'].slice(0, isQueen ? 5 : 2).forEach((s, i) => {
    const sp = document.createElement('div');
    sp.className = 'sparkle';
    sp.textContent = s;
    sp.style.cssText = `
      position:absolute; pointer-events:none; z-index:60; font-size:1.2rem;
      left:${bx + (Math.random() - 0.5) * 60}px;
      top:${by  + (Math.random() - 0.5) * 60}px;
      animation:sparklePop .6s ease-out ${i * 0.08}s forwards
    `;
    gameEl.appendChild(sp);
    sp.addEventListener('animationend', () => sp.remove());
  });

  const colors = isQueen  ? ['#FF4500','#FFD700','#FF2A2A','#FFA500','white']
               : isWasp   ? ['#8B6914','#FFD700','#FF6600','#C4930A','#3A2000']
               :             ['#F5C518','#FF8C00','#FFD700','#FFF8E7','#2D1A0D'];
  spawnParticles(bx, by, colors, isQueen ? 22 : isWasp ? 14 : 10);

  totalKills++;
  if (isQueen) { totalQueens++; sndQueen(); showMsg(bx, by - 30, '👑 +150 POINTS !', '#FFD700'); }
  else if (isWasp) { totalWasps++; sndWasp(); }
  else { sndKill(); }

  addCombo();
  const multiplier = getComboMultiplier();
  const points     = Math.round((isQueen ? 150 : isWasp ? 20 : scorePerBee) * multiplier);
  addScore(points);

  if (multiplier > 1) showMsg(bx, by, `x${multiplier} +${points}`, comboColor());
  else showMsg(bx, by, `+${points}`, isWasp ? '#FF8C00' : isQueen ? '#FFD700' : '#F5C518');
}

/* ══════════════════════════════════════════════
   PARTICULES
   ══════════════════════════════════════════════ */
function spawnParticles(bx, by, colors, n) {
  for (let i = 0; i < n; i++) {
    const p  = document.createElement('div');
    p.className = 'particle';
    const size = 5 + Math.random() * 10;
    const tx   = (Math.random() - 0.5) * 140;
    const ty   = -55 - Math.random() * 75;
    p.style.cssText = `
      left:${bx + 22}px; top:${by + 22}px;
      width:${size}px; height:${size}px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      --tx:${tx}px; --ty:${ty}px;
    `;
    gameEl.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }
}

/* ══════════════════════════════════════════════
   SYSTÈME DE COMBO
   ══════════════════════════════════════════════ */
function addCombo() {
  comboCount++;
  if (comboCount > maxCombo) maxCombo = comboCount;
  comboPct = 100;
  comboDisplay.classList.add('active');

  const m = getComboMultiplier();
  comboText.textContent = comboCount >= 2
    ? `x${m} COMBO ! ${'🔥'.repeat(Math.min(m, 5))}`
    : '🐝 Bien visé !';
  comboText.style.color    = comboColor();
  comboText.style.fontSize = `${1.4 + Math.min(m - 1, 3) * 0.25}rem`;

  if (comboCount >= 3) sndCombo();

  clearTimeout(comboTimeout);
  clearInterval(comboDecayInterval);

  comboDecayInterval = setInterval(() => {
    comboPct -= 2;
    comboBarEl.style.width      = Math.max(0, comboPct) + '%';
    comboBarEl.style.background = comboColor();
    if (comboPct <= 0) { clearInterval(comboDecayInterval); resetCombo(); }
  }, 60);

  comboTimeout = setTimeout(resetCombo, 3000);
}

function resetCombo() {
  comboCount = 0;
  comboPct   = 0;
  comboDisplay.classList.remove('active');
  clearTimeout(comboTimeout);
  clearInterval(comboDecayInterval);
}

function getComboMultiplier() {
  if (comboCount >= 10) return 5;
  if (comboCount >= 7)  return 4;
  if (comboCount >= 4)  return 3;
  if (comboCount >= 2)  return 2;
  return 1;
}

function comboColor() {
  return ['#FFD700','#FFD700','#FF8C00','#FF4500','#FF0080','#FF0000'][getComboMultiplier()] || '#FFD700';
}

/* ══════════════════════════════════════════════
   POWER-UP : POT DE MIEL
   ══════════════════════════════════════════════ */
function spawnHoneyPot() {
  if (!gameRunning) return;

  const pot = document.createElement('div');
  pot.className = 'honeypot';
  pot.innerHTML = honeyPotSVG();
  pot.style.left = (80 + Math.random() * (window.innerWidth - 190)) + 'px';
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
  honeyPotTimeout = setTimeout(spawnHoneyPot, 8000 + Math.random() * 10000);
}

/* ══════════════════════════════════════════════
   POWER-UP : CHRONOMÈTRE RALENTI
   ══════════════════════════════════════════════ */
function spawnChrono() {
  if (!gameRunning) return;

  const ch = document.createElement('div');
  ch.className = 'chrono';
  ch.innerHTML = chronoSVG();
  ch.style.left = (80 + Math.random() * (window.innerWidth - 190)) + 'px';
  gameEl.appendChild(ch);

  ch.addEventListener('click', e => {
    e.stopPropagation();
    initAudio();
    ch.classList.add('collecting');
    sndChrono();
    const cx = parseFloat(ch.style.left);
    const cy = parseFloat(ch.style.top) || 150;
    activateSlowMo();
    showMsg(cx, cy, '⏳ RALENTI !', '#00BFFF');
    showNotif('⏱ Ralenti ! 6 secondes !');
    ch.addEventListener('animationend', () => ch.remove(), { once: true });
  });

  setTimeout(() => { if (ch.parentNode) ch.remove(); }, 5500);
  chronoTimeout = setTimeout(spawnChrono, 18000 + Math.random() * 17000);
}

/* ══════════════════════════════════════════════
   OBSTACLE : RUCHE
   ══════════════════════════════════════════════ */
function spawnHive() {
  if (!gameRunning) return;

  const hive = document.createElement('div');
  hive.className = 'hive';
  hive.innerHTML  = hiveSVG();

  let hx, hy, attempts = 0;
  do {
    hx = 60 + Math.random() * (window.innerWidth - 160);
    hy = 90 + Math.random() * (window.innerHeight - 280);
    attempts++;
  } while (Math.hypot(hx - window.innerWidth / 2, hy - (window.innerHeight - 160)) < 200 && attempts < 20);

  hive.style.left = hx + 'px';
  hive.style.top  = hy + 'px';
  gameEl.appendChild(hive);

  hive.addEventListener('click', e => {
    e.stopPropagation();
    initAudio();
    if (hive.classList.contains('dying')) return;

    hive.classList.add('dying');
    hive.addEventListener('animationend', () => hive.remove(), { once: true });
    spawnParticles(hx, hy, ['#8B4513','#F5A623','#FFD700','#FF6600','#3A1A00'], 16);
    sndHive();
    showMsg(hx + 16, hy, '🪵 -1 VIE !', '#FF4500');
    showNotif('🪵 Ruche touchée ! -1 vie !');

    if (shielded) {
      showMsg(hx + 16, hy - 28, '🛡️ BLOQUÉ !', '#00BFFF');
      playTone(440, 'sine', 0.2, 0.3);
    } else {
      loseHeart();
      bear.classList.remove('hurt');
      void bear.offsetWidth;
      bear.classList.add('hurt');
      bear.addEventListener('animationend', () => bear.classList.remove('hurt'), { once: true });
      gameEl.style.transform = `translate(${(Math.random() - 0.5) * 18}px, ${(Math.random() - 0.5) * 12}px)`;
      setTimeout(() => { gameEl.style.transform = ''; }, 140);
    }
  });

  setTimeout(() => {
    if (hive.parentNode && !hive.classList.contains('dying')) hive.remove();
  }, 8000 + Math.random() * 4000);

  hiveTimeout = setTimeout(spawnHive, 15000 + Math.random() * 13000);
}

/* ══════════════════════════════════════════════
   BOUCLIER
   ══════════════════════════════════════════════ */
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
  h.classList.remove('lost', 'losing');
  h.classList.add('gaining');
  h.addEventListener('animationend', () => h.classList.remove('gaining'), { once: true });
  lives++;
}

function showNotif(txt) {
  const n = document.createElement('div');
  n.className  = 'powerup-notif';
  n.textContent = txt;
  document.body.appendChild(n);
  n.addEventListener('animationend', () => n.remove());
}

/* ══════════════════════════════════════════════
   ÉCLAIRS
   ══════════════════════════════════════════════ */
function spawnLightning() {
  if (!gameRunning || level < 6) return;

  const count = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      if (!gameRunning) return;
      const bolt = document.createElement('div');
      bolt.className = 'lightning';
      bolt.style.left   = Math.random() * window.innerWidth + 'px';
      bolt.style.height = (200 + Math.random() * 300) + 'px';
      bolt.style.transform = `rotate(${-6 + Math.random() * 12}deg)`;
      bg.appendChild(bolt);
      sndBolt();
      bolt.addEventListener('animationend', () => bolt.remove());
    }, i * 200 + Math.random() * 300);
  }

  const delay = level >= 8 ? 1500 + Math.random() * 2000 : 3000 + Math.random() * 4000;
  lightningTimeout = setTimeout(spawnLightning, delay);
}

/* ══════════════════════════════════════════════
   SCORE ET NIVEAUX
   ══════════════════════════════════════════════ */
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
  if (lives <= 0) setTimeout(endGame, 200);
}

function showMsg(x, y, txt, col) {
  const m = document.createElement('div');
  m.className  = 'score-pop';
  m.textContent = txt;
  m.style.cssText = `left:${x}px; top:${y - 12}px; color:${col};`;
  gameEl.appendChild(m);
  m.addEventListener('animationend', () => m.remove());
}

function checkLevel() {
  const newLevel = LEVEL_THRESHOLDS.filter(t => score >= t).length;

  if (newLevel > level) {
    level = newLevel;
    levelEl.textContent = level;
    scorePerBee = 10 + level * 5;

    bannerText.textContent = `Niveau ${level} !`;
    bannerSub.textContent  = LEVEL_MESSAGES[Math.min(level, LEVEL_MESSAGES.length - 1)];
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

/* ══════════════════════════════════════════════
   COMPTE À REBOURS
   ══════════════════════════════════════════════ */
function startTimer() {
  gameTimer = 120;
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (!gameRunning) return;

    gameTimer -= 0.1;

    const pct = Math.max(0, gameTimer / 120 * 100);
    timerBar.style.width = pct + '%';
    const r  = Math.round(255 * (1 - pct / 100));
    const gv = Math.round(174 * (pct / 100));
    timerBar.style.background = `linear-gradient(90deg, rgb(${r},${gv+80},0), rgb(${r+60},${gv+120},0))`;

    score += 1;
    scoreEl.textContent = Math.floor(score);
    checkLevel();

    if (gameTimer <= 0) endGame();
  }, 100);
}

/* ══════════════════════════════════════════════
   CYCLE DE VIE DU JEU
   ══════════════════════════════════════════════ */
function startGame() {
  initAudio();
  startBackgroundMusic();

  score       = 0;
  lives       = 3;
  level       = 1;
  scorePerBee = 10;
  queenAlive  = false;
  shielded    = false;
  slowMoActive = false;
  slowFactor   = 1;
  totalKills   = 0;
  totalQueens  = 0;
  totalWasps   = 0;
  maxCombo     = 0;

  scoreEl.textContent = '0';
  levelEl.textContent = '1';
  hearts.forEach(h => h.classList.remove('lost', 'losing', 'gaining'));
  shieldBubble.style.display = 'none';
  shieldHud.style.display    = 'none';
  bear.classList.remove('shielded', 'hurt');
  bg.classList.remove('storm');
  comboDisplay.classList.remove('active');
  comboCount = 0;
  slowmoOv.classList.remove('active');
  slowmoHud.classList.remove('active');
  hudPseudo.textContent = playerName ? `👤 ${playerName}` : '';

  document.getElementById('menu-screen').style.display    = 'none';
  document.getElementById('rules-screen').style.display   = 'none';
  document.getElementById('gameover-screen').style.display = 'none';

  gameEl.innerHTML = '';

  [lightningTimeout, honeyPotTimeout, chronoTimeout, hiveTimeout, shieldTimer, slowMoTimer]
    .forEach(clearTimeout);
  clearInterval(spawnInterval);
  clearInterval(timerInterval);

  gameRunning = true;
  setTimeout(spawnBee, 400);
  spawnInterval = setInterval(spawnBee, getSpawnDelay(level));
  startTimer();

  honeyPotTimeout = setTimeout(spawnHoneyPot, 10000 + Math.random() * 5000);
  chronoTimeout   = setTimeout(spawnChrono,   20000 + Math.random() * 10000);
  hiveTimeout     = setTimeout(spawnHive,     25000 + Math.random() * 15000);
}

function endGame() {
  gameRunning = false;
  stopBackgroundMusic();

  clearInterval(spawnInterval);
  clearInterval(timerInterval);

  [honeyPotTimeout, chronoTimeout, hiveTimeout, shieldTimer, lightningTimeout, slowMoTimer]
    .forEach(clearTimeout);

  document.querySelectorAll('.bee, .honeypot, .chrono, .hive, .lightning').forEach(e => e.remove());

  deactivateShield();
  deactivateSlowMo();
  resetCombo();

  const bestMulti = maxCombo >= 10 ? 5 : maxCombo >= 7 ? 4 : maxCombo >= 4 ? 3 : maxCombo >= 2 ? 2 : 1;

  document.getElementById('final-pseudo').textContent = playerName ? `🐻 Bravo ${playerName} !` : '';
  document.getElementById('final-score').textContent  = Math.floor(score) + ' pts';
  document.getElementById('final-stats').innerHTML =
    `Niveau atteint : <b>${level}</b><br>` +
    `Ennemis éliminés : <b>${totalKills}</b><br>` +
    `Guêpes vaincues : <b>${totalWasps} 🟡</b><br>` +
    (totalQueens ? `Reines vaincues : <b>${totalQueens} 👑</b><br>` : '') +
    `Meilleur combo : <b>${maxCombo > 1 ? 'x' + bestMulti + ' (' + maxCombo + ' kills)' : maxCombo + ' kill'}</b>`;

  document.getElementById('gameover-screen').style.display = 'flex';
}

/* ══════════════════════════════════════════════
   INITIALISATION
   ══════════════════════════════════════════════ */
makeClouds();
makeGrass();