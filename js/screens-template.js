(function renderScreens() {
  const root = document.getElementById('screens-root');
  if (!root) return;

  root.innerHTML = `
    <div class="screen" id="menu-screen">
      <div class="menu-card">
        <div class="bear-icon">🐻</div>
        <div class="menu-title">Bear vs Bees</div>
        <div class="menu-sub">Aide Malo l'ours à survivre à l'invasion !</div>
        <label class="pseudo-label">👤 Ton pseudo :</label>
        <input class="pseudo-input" id="pseudo-input" type="text" maxlength="18"
               placeholder="Entre ton prénom…" autocomplete="off" spellcheck="false"/>
        <div class="menu-btns">
          <button class="btn" id="play-btn">🍯 JOUER !</button>
          <button class="btn secondary" id="rules-btn">📖 Règles du jeu</button>
        </div>
      </div>
    </div>

    <div class="screen" id="rules-screen">
      <div class="rules-card">
        <div class="rules-title">📖 Règles du jeu</div>
        <div class="rules-grid">
          <div class="rule-item"><span class="rule-emoji">🐝</span><div class="rule-name">Abeille</div><div class="rule-desc">+10 pts · 1 clic pour tuer</div></div>
          <div class="rule-item"><span class="rule-emoji">🟡</span><div class="rule-name">Guêpe</div><div class="rule-desc">+20 pts · Plus rapide !</div></div>
          <div class="rule-item"><span class="rule-emoji">👑</span><div class="rule-name">Reine</div><div class="rule-desc">+150 pts · Redoutable !</div></div>
          <div class="rule-item"><span class="rule-emoji">🍯</span><div class="rule-name">Pot de miel</div><div class="rule-desc">Bouclier ou +1 vie !</div></div>
          <div class="rule-item"><span class="rule-emoji">⏱</span><div class="rule-name">Chrono</div><div class="rule-desc">Ralentit tout 6 sec !</div></div>
          <div class="rule-item"><span class="rule-emoji">🪵</span><div class="rule-name">Ruche</div><div class="rule-desc">⚠️ Cliquer = -1 vie !</div></div>
          <div class="rule-item"><span class="rule-emoji">⚡</span><div class="rule-name">Combo</div><div class="rule-desc">x2 x3 x4 x5 !</div></div>
          <div class="rule-item"><span class="rule-emoji">🛡️</span><div class="rule-name">Bouclier</div><div class="rule-desc">Bloque 1 attaque · 5 sec</div></div>
        </div>
        <div class="rules-section">
          <h3>🎯 Comment jouer</h3>
          <div class="rules-tip"><span class="tip-icon">👆</span><span>Clique sur les abeilles et guêpes — <b>1 seul clic</b> suffit !</span></div>
          <div class="rules-tip"><span class="tip-icon">🪵</span><span><b>Attention aux ruches !</b> Ne clique PAS dessus. Si tu les ignores, elles disparaissent seules.</span></div>
          <div class="rules-tip"><span class="tip-icon">⏱</span><span>Clique sur le <b>chrono bleu</b> pour ralentir tous les ennemis 6 secondes !</span></div>
          <div class="rules-tip"><span class="tip-icon">❤️</span><span>Tu as <b>3 vies</b>. Une abeille qui touche l'ours = -1 vie.</span></div>
        </div>
        <div class="rules-section">
          <h3>⚡ Paliers de score</h3>
          <div class="rules-tip"><span class="tip-icon">🐝</span><span>A <b>350 pts</b> : Les guêpes arrivent !</span></div>
          <div class="rules-tip"><span class="tip-icon">👑</span><span>A <b>950 pts</b> : La Reine peut surgir !</span></div>
          <div class="rules-tip"><span class="tip-icon">⛈️</span><span>A <b>1400 pts</b> : Tempête, ciel sombre et éclairs !</span></div>
        </div>
        <button class="btn secondary" id="back-from-rules-btn" style="margin-top:4px">← Retour au menu</button>
      </div>
    </div>

    <div class="screen" id="gameover-screen">
      <div class="gameover-card">
        <h1>💀 Game Over !</h1>
        <div id="final-pseudo"></div>
        <div id="final-score">0 pts</div>
        <div id="final-stats"></div>
        <div class="go-btns">
          <button class="btn" id="replay-btn">🐻 REJOUER !</button>
          <button class="btn menu-back" id="menu-btn">🏠 Menu principal</button>
        </div>
      </div>
    </div>
  `;
})();
