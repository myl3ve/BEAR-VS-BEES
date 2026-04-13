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

function bindScreenEvents() {
  const pseudoInput = document.getElementById('pseudo-input');
  const playBtn = document.getElementById('play-btn');
  const rulesBtn = document.getElementById('rules-btn');
  const backFromRulesBtn = document.getElementById('back-from-rules-btn');
  const replayBtn = document.getElementById('replay-btn');
  const menuBtn = document.getElementById('menu-btn');

  if (pseudoInput) {
    pseudoInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') handlePlay();
    });
  }
  if (playBtn) playBtn.addEventListener('click', handlePlay);
  if (rulesBtn) rulesBtn.addEventListener('click', showRules);
  if (backFromRulesBtn) backFromRulesBtn.addEventListener('click', hideRules);
  if (replayBtn) replayBtn.addEventListener('click', () => startGame());
  if (menuBtn) menuBtn.addEventListener('click', backToMenu);
}

bindScreenEvents();

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
