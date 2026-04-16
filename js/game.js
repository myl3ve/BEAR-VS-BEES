function spawnBee(forceQueen = false) {
  if (!gameRunning) return;
  const tier = getDifficultyTierByScore(score);
  if (document.querySelectorAll('.bee:not(.dying)').length >= getMaxEnemies(tier)) return;

  const isQueen = forceQueen || (!queenAlive && score >= QUEEN_SCORE_THRESHOLD && Math.random() < 0.07);
  const isWasp  = !isQueen && score >= WASP_SCORE_THRESHOLD && Math.random() < getWaspChance(tier);

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

  let baseSpeed = getSpeed(tier);
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
    const cx = parseFloat(pot.style.left);
    const cy = parseFloat(pot.style.top) || 150;

    // "Nothing is Safe" : 15% de chance que le pot soit maudit
    const isCursed = Math.random() < 0.25;

    if (isCursed) {
      // Pot maudit : fait perdre une vie
      sndHurt();
      showMsg(cx, cy, '💀 MAUDIT !', '#FF0000');
      showNotif('💀 Pot maudit ! -1 vie !');
      loseHeart();
      bear.classList.remove('hurt');
      void bear.offsetWidth;
      bear.classList.add('hurt');
      bear.addEventListener('animationend', () => bear.classList.remove('hurt'), { once: true });
    } else if (!shielded && (lives >= 3 || Math.random() < 0.4)) {
      sndHoney();
      activateShield();
      showMsg(cx, cy, '🛡️ BOUCLIER !', '#00BFFF');
      showNotif('🛡️ Bouclier activé ! (5 sec)');
    } else {
      sndHoney();
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
  if (!gameRunning || score < STORM_SCORE_THRESHOLD) return;

  const tier = getDifficultyTierByScore(score);

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

  const delay = tier >= 8 ? 1500 + Math.random() * 2000 : 3000 + Math.random() * 4000;
  lightningTimeout = setTimeout(spawnLightning, delay);
}

/* ══════════════════════════════════════════════
   SCORE ET DIFFICULTE
   ══════════════════════════════════════════════ */
function addScore(pts) {
  score += pts;
  scoreEl.textContent = Math.floor(score);
  scoreEl.style.transform = 'scale(1.4)';
  setTimeout(() => { scoreEl.style.transform = ''; }, 190);
  updateDifficultyFromScore();
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

function updateDifficultyFromScore() {
  const newTier = getDifficultyTierByScore(score);
  if (newTier > difficultyTier) {
    difficultyTier = newTier;
    scorePerBee = 10 + difficultyTier * 5;

    clearInterval(spawnInterval);
    spawnInterval = setInterval(spawnBee, getSpawnDelay(difficultyTier));
    sndLevel();
  }

  if (!stormStarted && score >= STORM_SCORE_THRESHOLD) {
    stormStarted = true;
    bg.classList.add('storm');
    setTimeout(spawnLightning, 500);
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
    updateDifficultyFromScore();

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
  scorePerBee = 10;
  difficultyTier = 1;
  stormStarted = false;
  queenAlive  = false;
  shielded    = false;
  slowMoActive = false;
  slowFactor   = 1;
  totalKills   = 0;
  totalQueens  = 0;
  totalWasps   = 0;
  maxCombo     = 0;

  scoreEl.textContent = '0';
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
  spawnInterval = setInterval(spawnBee, getSpawnDelay(difficultyTier));
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
