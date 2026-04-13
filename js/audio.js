/* Audio config */
const BGM_FILE_PATH = 'assets/audio/the_mountain-instrumental-513154.mp3';
const BGM_VOLUME = 0.12;
const SFX_VOLUME_MULTIPLIER = 1.35;

let audioCtx = null;
let bgMusic = null;

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
