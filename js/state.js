/* Global DOM references */
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

/* Game state */
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

/* Gameplay config */
function getSpeed(lvl)      { return 0.50 + (lvl - 1) * 0.14; }
function getSpawnDelay(lvl) { return Math.max(300, 2500 - (lvl - 1) * 220); }
function getMaxEnemies(lvl) { return Math.min(3 + lvl * 2, 26); }
function getWaspChance(lvl) {
  if (lvl < 3) return 0;
  return Math.min(0.12 + (lvl - 3) * 0.07, 0.55);
}

const LEVEL_THRESHOLDS = [0, 150, 350, 600, 950, 1400, 1950, 2600, 3400, 4350, 5500];

const LEVEL_MESSAGES = [
  '', 'Ca commence !', "Elles s'énervent", 'Les guêpes arrivent',
  'Invasion !', 'La Reine approche...', 'Orage en vue',
  'Légendaire !', 'Sans pitié...', "T'es encore là ?!", 'IMPOSSIBLE !!!'
];
