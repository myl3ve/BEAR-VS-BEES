# 🐻 BEAR vs BEES — Présentation Complète du Code

**Jeu de survie en arcade — Développé pour un Game Jam**
*Version: 1.0.1-beta.1 | Technologie: HTML5 + CSS3 + Vanilla JavaScript*

---

## 📋 Table des Matières

1. [Vue d'ensemble du projet](#vue-densemble)
2. [Architecture générale](#architecture-générale)
3. [Fichiers HTML](#index-html)
4. [Fichiers CSS](#fichiers-css)
5. [Fichiers JavaScript](#fichiers-javascript)
6. [Système de jeu](#système-de-jeu)
7. [Mécaniques principales](#mécaniques-principales)

---

## 🎯 Vue d'Ensemble

**Bear vs Bees** est un jeu de survie en arcade où le joueur doit protéger un ours contre une invasion croissante d'ennemis. Le concept principal est simple mais progressif: **eliminer les abeilles et guêpes pour scorer** tout en évitant les pièges et les dégâts.

### Objectifs du Jeu
- ✅ Survivre aussi longtemps que possible
- ✅ Obtenir le score le plus élevé possible
- ✅ Collectionner les power-ups stratégiquement
- ✅ Progresser à travers les paliers de difficulté

### Conditions de Défaite
- ❌ Perdre les 3 vies (cœurs)
- ❌ Timer de survie atteint zéro

---

## 🏗️ Architecture Générale

```
BEAR-VS-BEES/
├── index.html                 ← Point d'entrée HTML
├── README.md                  ← Documentation du projet
├── assets/
│   ├── audio/               ← Fichiers audio (musique de fond)
│   └── svg/                 ← Graphismes vectoriels (ours, abeilles, puissances)
├── css/
│   ├── base.css             ← Styles fondamentaux et environnement
│   ├── ui.css               ← Interface utilisateur et effets
│   └── screens.css          ← Écrans (menu, règles, game over)
└── js/
    ├── screens-template.js  ← Génération des écrans HTML
    ├── state.js             ← État global du jeu
    ├── audio.js             ← Gestion audio et synthèse sonore
    ├── assets.js            ← Fonctions de rendu SVG
    ├── environment.js       ← Environnement visuel
    ├── ui.js                ← Événements UI et logique d'écran
    └── game.js              ← Boucle de jeu et mécaniques principales
```

---

# 📄 FICHIERS DÉTAILLÉS

---

## 📄 index.html

### 🎯 Rôle Principal
Point d'entrée HTML du jeu. Structure le DOM et charge tous les assets et scripts.

### 📦 Contenu Structurel

**1. En-tête (Head)**
- Meta tags pour charset UTF-8 et responsive design
- Importe 3 polices Google Fonts:
  - `Baloo 2` (poids 400-900) — Titre principal, énergique
  - `Nunito` (poids 400, 700, 900) — Corps de texte principal
  - `Fredoka One` — Étiquettes spéciales
- 3 fichiers CSS liés (base, ui, screens)

**2. Corps (Body) — Organisation par Zones**

```html
<!-- ENVIRONNEMENT -->
#bg          → Fond dégradé animé (ciel, nuages)
#ground      → Sol avec herbe et fleurs
```

```html
<!-- ZONE DE JEU -->
#game        → Conteneur principal pour les ennemis et éléments
#shield-bubble → Bulle de protection visuelle
#slowmo-overlay → Overlay de ralentissement du temps
```

```html
<!-- PERSONNAGE -->
#bear        → Ours principal (SVG)
```

```html
<!-- HUD (Interface de Jeu) -->
#hud         → Affichage du pseudo et des cœurs/vies
#hearts      → 3 cœurs (❤️) pour la vie
#score-display → Affichage du score
#shield-hud  → Indicateur de bouclier (🛡️)

#combo-display → Barre et texte de combo
#combo-text  → "Bien visé!" ou "x4 COMBO!"
#combo-bar   → Barre de progression du combo

#queen-alert → Alerte "👑 REINE DES ABEILLES!"
#wasp-alert  → Alerte "🐝 GUÊPES EN APPROCHE!"

#timer-wrap  → Barre de temps/survie
#timer-bar   → Barre de progression du temps
```

```html
<!-- ÉCRANS -->
#screens-root → Conteneur pour les écrans (menu, règles, game over)
```

### 🔗 Ordre de Chargement des Scripts
```javascript
1. screens-template.js → Génère les écrans
2. state.js            → Initialise l'état global
3. audio.js            → Setup audio
4. assets.js           → Prépare les SVG
5. environment.js      → Crée nuages et herbe
6. ui.js               → Lie les événements
7. game.js             → Lance la boucle de jeu
```

**Importance de l'ordre:** Chaque fichier dépend des précédents. Les écrans doivent être générés avant que l'UI les utilise.

---

## 🎨 Fichiers CSS

### 1️⃣ base.css — Fondations Visuelles

#### Variables CSS (Palette de couleurs)
```css
--honey:       #F5A623;     (Orange miel principal)
--dark-honey:  #C07A10;     (Orange foncé)
--sky:         #87CEEB;     (Bleu ciel)
--bark:        #6B3E26;     (Brun écorce)
--danger:      #E74C3C;     (Rouge danger)
--safe:        #27AE60;     (Vert sécurité)
--bee-yellow:  #F5C518;     (Jaune abeille)
--queen-red:   #FF4500;     (Orange reine)
```

#### Reset Global
- `* { margin: 0; padding: 0; box-sizing: border-box; }`
- Body: `overflow: hidden`, cursor crosshair

#### Fond (#bg)
- **Dégradé par défaut:**
  ```
  Haut:    Bleu clair (#B8E4F7)
  Milieu1: Bleu ciel  (#87CEEB)
  Milieu2: Vert pâle  (#D4EAB0)
  Bas:     Vert foncé (#5C8A2A)
  ```
- **En mode "storm":**
  ```
  Transformation: Dégradé sombre gris/noir/vert foncé
  Activation: Au score ≥ 1400 points
  ```
- **Transition:** 2.5s en douceur
- **Pseudo-élément ::before:** Adds subtle radial gradients for depth

#### Nuages (.cloud)
- SVG/div avec border-radius 50px
- Animation `drift` linéaire infinie
- Opacité 0.88 par défaut, 0.75 en storm
- Durée d'animation: 16-44s (aléatoire)
- **En storm:** Vitesse accélérée (7s), apparence grise

#### Sol (#ground)
- Position: fixed au bas
- Hauteur: 130px
- **Gradient par défaut:**
  ```
  Bas (front):   Vert très foncé (#3A6B1A)
  Milieu:        Vert (#5C8A2A) 60%
  Top (arrière): Vert clair (#7AB535)
  ```
- **En storm:** Tonalité plus sombre
- Pseudo-élément ::before: Ombre en haut

#### Éléments du Sol
**Brins d'herbe (.grass-blade)**
- Position: absolute au-dessus du sol
- Largeur: 8px, hauteur: aléatoire (8-28px)
- Gradient vert du plus foncé au plus clair
- Rotation aléatoire (-18° à +18°)
- Opacité variable (0.68-1)

**Fleurs (.flower)**
- Émojis aléatoires: 🌸🌼🌻🌺🌷💐
- Animation: `flowerSway` (3s, ease-in-out, infini)
- Mouvements aléatoires en tangage léger

---

### 2️⃣ screens.css — Écrans et Modales

#### Écrans Généraux (.screen)
- Position: fixed plein écran (inset: 0)
- z-index: 300 (au-dessus du jeu)
- Flex: colonne centrée
- Fond: Dégradé sombre avec backdrop-filter blur 8px

#### Écrans Spécifiques
```css
#menu-screen        { display: flex; }      ← Visible par défaut
#rules-screen       { display: none; }      ← Caché
#gameover-screen    { display: none; }      ← Caché
```

#### Carte Menu (.menu-card)
- Fond: Gradient brun/orange avec bordure miel
- Padding: 42px 52px
- Max-width: 520px
- Ombre: 80px blur + éclat miel 35% d'opacité
- **Animation d'entrée (.cardIn):** 0.7s cubic-bezier
  - Commence: translateY(60px) scale(0.85) opacity(0)
  - Finit: position normale, scale 1, opacity 1

#### Icône Ours (.bear-icon)
- FontSize: 5rem
- Animation **bearBob**: 1.3s ease-in-out infini
- Effet de rebond léger haut-bas

#### Titres
**Menu Title (.menu-title)**
- Font: Baloo 2, 900, 3rem
- Color: var(--honey) #F5A623
- Text-shadow: 3px 3px noir (50%) + glow miel (40%)

**Menu Sub (.menu-sub)**
- Color: rgba(255,220,130,0.78) (beige pâle)
- Font-weight: 700
- Font-size: 1rem

#### Input de Pseudo
**Pseudo Input (.pseudo-input)**
- Width: 100%
- Padding: 14px 20px
- Border: 2.5px solid rgba(245,166,35,0.5) miel semi-transparent
- Background: rgba(255,255,255,0.07) blanc très transparent
- Color: blanc
- Font: Baloo 2, 700, 1.2rem
- Border-radius: 16px
- **Au focus:** Border miel solide + box-shadow bleu ciel

#### Boutons (.btn)
- Font: Baloo 2 Bold, 1.35rem
- Gradient: Miel → Orange (#FF8C00)
- Text-shadow: 1px 1px gris
- Border-radius: 55px
- Padding: 14px 40px
- **Ombre:** 7px décalage + 35px blur
- **Au hover:** translateY(-4px) + ombre plussaillante
- Transition: 0.1s

#### Grille de Règles
- Display: grid avec gap
- 8 items avec emoji + nom + description
- Design compact et lisible

---

### 3️⃣ ui.css — Interface de Jeu et Effets

#### Combo Display (#combo-display)
```
Position: Fixed, top 88px, centered
- #combo-text: 2.1rem, Baloo 2 900, text-shadow glow
- #combo-bar-bg: 170px × 10px, arrière-plan gris
- #combo-bar: Barre jaune #FFD700 (transition 0.05s linear)
```

#### Particules Animées
**Particules générales (.particle)**
- Position: absolute
- Border-radius: 50% (rond)
- Animation: `particleFly` (0.75s ease-out)
  - Transformation: translate(var(--tx), var(--ty)) scale(0)
  - Opacité: 0 à la fin

**Pop Score (.score-pop)**
- Font: Baloo 2 800
- Font-size: 1.65rem
- Animation: `popUp` (0.8s ease-out)
  - 0%: Y=0, scale 0.4, opacity 1
  - 60%: Y=-55px, scale 1.25
  - 100%: Y=-90px, opacity 0

**Splashs au Miel/Guêpe**
```
.honey-splash    → Gradient jaune-orange
.wasp-splash     → Gradient marron-orange
Animation: scale 0 → 1 → 1.6 (0.55s)
Opacity: 1 → 0.8 → 0
```

**Étincelles (.sparkle)**
- Font-size: 1.2rem
- Animation: `sparklePop` (0.6s ease-out)
  - Rotation 360°, scale 0 → 1.5 → 0

#### HUD Principal (#hud)
```
Position: Fixed, top-left
Display: flex, 3 colonnes
- Colonne 1: #hud-title + #hud-pseudo
- Colonne 2: #hearts (3 cœurs ❤️)
- Colonne 3: #score-display
```

**Cœurs animés (.heart)**
- Taille: aléatoire 0.8-1.2x
- Animation pop: 0.3s élastique

#### Alertes Spéciales
**#queen-alert** et **#wasp-alert**
- Position fixed, z-index: 400
- Font: Fredoka One 2.5rem en uppercase
- Animation d'apparition: 0.5s slide-in + glow
- Auto-hide après 1.8s

---

## 💻 Fichiers JavaScript

### 1️⃣ assets.js — Rendu des Ressources SVG

**Rôle:** Fournit des fonctions de rendu pour tous les graphismes du jeu

#### Fonctions de Rendu
```javascript
beeSVG()          → <img> d'abeille normale
waspSVG()         → <img> de guêpe
queenSVG()        → <img> de reine abeille
honeyPotSVG()     → <img> de pot de miel
hiveSVG()         → <img> de ruche
chronoSVG()       → <img> de chronomètre
```

**Structure commune:**
```javascript
return '<img src="assets/svg/[nom].svg" alt="..." draggable="false"/>';
```

- **draggable="false":** Empêche le drag sur les SVG
- **alt:** Description pour accessibilité

**Avantage:** Centraliser les SVG permet de les modifier à un seul endroit.

---

### 2️⃣ audio.js — Gestion Audio et Synthèse Sonore

**Rôle:** Gère la musique de fond et les effets sonores via Web Audio API

#### Configuration
```javascript
BGM_FILE_PATH = 'assets/audio/the_mountain-instrumental-513154.mp3'
BGM_VOLUME = 0.12
SFX_VOLUME_MULTIPLIER = 1.35  (Boost les SFX de 35%)
```

#### Initialisation Audio
```javascript
initAudio()
```
- Crée AudioContext (web audio standard)
- Vérifie si contexte est suspendu (navigateur)
- Reprend si nécessaire

#### Synthèse Sonore: playTone()
```javascript
playTone(freq, type, dur, vol=0.3, delay=0)
```

**Paramètres:**
- `freq`: Fréquence Hz (ex: 440 = La4)
- `type`: oscillator type ('sine', 'square', 'sawtooth', 'triangle')
- `dur`: Durée en secondes
- `vol`: Volume 0-1
- `delay`: Retard avant play en secondes

**Processus:**
1. Crée oscillateur + gain node
2. Connecte chaîne audio → destination
3. Configure fréquence et volume initial
4. Ramp exponential vers silence
5. Start / Stop

#### Effets Sonores Prédéfinis

| Fonction | Description | Composition |
|----------|-------------|-------------|
| `sndKill()` | Abeille tuée | 880Hz square 0.08s + 660Hz 0.12s |
| `sndWasp()` | Guêpe | 440Hz sawtooth + 330Hz staggeré |
| `sndHurt()` | Dégât reçu | 110Hz sawtooth grave (son douleur) |
| `sndCombo()` | Combo obtenu | Série 4 notes montantes (523-1047Hz) |
| `sndHoney()` | Pot miel | Accord miel (523-659-784Hz) |
| `sndQueen()` | Reine appear | 5 notes dégressive (1047→330Hz) |
| `sndLevel()` | Difficulté ↑ | Gamme montante (330-880Hz) |
| `sndBolt()` | Éclair storm | Sons graves et durs (40-80Hz) |
| `sndChrono()` | Ralentissement | 4 notes aiguës montantes (800-1500Hz) |
| `sndHive()` | Ruche | Tons graves bruités (200-150Hz) |

#### Musique de Fond
```javascript
startBackgroundMusic()
```
- Crée Audio object avec boucle
- Volume 0.12 (discret)
- Auto-retry si navigateur bloque autoplay

```javascript
stopBackgroundMusic()
```
- Pause et réinitialise à 0

---

### 3️⃣ environment.js — Environnement Visuel

**Rôle:** Génère les éléments décorativement visuels (nuages, herbe, fleurs)

#### makeClouds()
```javascript
makeClouds() → Crée 7 nuages aléatoires
```

**Chaque nuage:**
- Largeur aléatoire: 70-210px
- Hauteur proportionnelle: w × 0.44
- Position Y: 4-26% de la hauteur
- Durée animation: 16-44s
- Délai: 0 à -40s (pré-positionnement)
- Opacité aléatoire: 0.48-0.9

**Effet:** Nuages qui défilent continuellement, avec profondeur visuelle

#### makeGrass()
```javascript
makeGrass() → Crée 65 brins + 12 fleurs
```

**Brins d'herbe:**
- Position: aléatoire horizontal
- Hauteur: 8-28px
- Rotation: -18° à +18°
- Opacité: 0.68-1
- Crée un champ d'herbe dense et naturel

**Fleurs:**
- Sélection aléatoire de 6 émojis (🌸🌼🌻🌺🌷💐)
- Animation sway: 2.5-4.5s
- Crée un décor bucolique

**Appelée:** Au chargement et retour au menu

---

### 4️⃣ state.js — État Mondial du Jeu

**Rôle:** Centraliser tous les variables d'état pour éviter les globals

#### Références DOM
```javascript
gameEl, scoreEl, hearts[], timerBar, bear,
shieldBubble, shieldHud, comboDisplay,
queenAlert, waspAlert, bg, hudPseudo,
slowmoOv, slowmoHud
```

#### État du Jeu Principal
```javascript
score = 0                    // Points actuels
lives = 3                    // Cœurs restants
gameRunning = false          // Jeu actif?
scorePerBee = 10             // Points par abeille de base
difficultyTier = 1           // Niveau de difficulté (1-11)
stormStarted = false         // Tempête activée?
```

#### Timers et Intervals
```javascript
spawnInterval = null         // Spawn d'ennemis
timerInterval = null         // Temps survie
gameTimer = 0                // Secondes en jeu
```

#### État Bouclier
```javascript
shielded = false             // Bouclier actif?
shieldTimer = null           // Timeout bouclier
```

#### État Combo
```javascript
comboCount = 0               // Combo actuel (0-∞)
comboTimeout = null          // Timeout réinitialisation
comboDecayInterval = null    // Interval decay barre
comboPct = 100               // % barre combo (100→0)
maxCombo = 0                 // Record combo partie
```

#### État Ennemis
```javascript
queenAlive = false           // Reine au jeu?
honeyPotTimeout = null
chronoTimeout = null
hiveTimeout = null
lightningTimeout = null
```

#### Statistiques
```javascript
totalKills = 0               // Total ennemi tués
totalQueens = 0              // Total reines tuées
totalWasps = 0               // Total guêpes tuées
```

#### État Ralentissement
```javascript
slowFactor = 1               // 1 = normal, 0.22 = ralenti 78%
slowMoActive = false         // Ralenti actif?
slowMoTimer = null
```

#### Joueur
```javascript
playerName = ''              // Pseudo du joueur
```

#### Fonctions de Configuration

**getSpeed(lvl)** → Vitesse ennemis décroissante
- Base: 0.50 + (lvl - 1) × 0.14
- Exemple: Lvl 1 = 0.50, Lvl 5 = 1.06

**getSpawnDelay(lvl)** → Délai délai entre spawn
- Base: 2500ms - (lvl - 1) × 220
- Min: 300ms
- Exemple: Lvl 1 = 2500ms, Lvl 10 = 2500-1980 = 520ms

**getMaxEnemies(lvl)** → Max ennemis simultanés
- Base: 3 + lvl × 2
- Min: 3, Max: 26
- Exemple: Lvl 1 = 5, Lvl 10 = 23

**getWaspChance(lvl)** → % de chance guêpe
- Si lvl < 3: 0%
- Base: 0.12 + (lvl - 3) × 0.07
- Max: 55%

**Paliers de Difficulté**
```javascript
DIFFICULTY_THRESHOLDS = [0, 150, 350, 600, 950, 1400, 1950, 2600, 3400, 4350, 5500]
// Tier 1 dès 0 pts, Tier 2 à 150 pts, etc.
```

**Seuils de Score**
- WASP_SCORE_THRESHOLD = 350
- QUEEN_SCORE_THRESHOLD = 950
- STORM_SCORE_THRESHOLD = 1400

**getDifficultyTierByScore(score)**
```javascript
return DIFFICULTY_THRESHOLDS.filter(t => score >= t).length
// Compte le nombre de seuils franchis
// Exemple: 500 pts → franchit [0, 150, 350] → tier 3
```

---

### 5️⃣ screens-template.js — Génération des Écrans

**Rôle:** Créer le HTML des trois écrans (menu, règles, game over) via template

#### Écran Menu (#menu-screen)
```html
<div class="screen" id="menu-screen">
  <div class="menu-card">
    <div class="bear-icon">🐻</div>
    <div class="menu-title">Bear vs Bees</div>
    <div class="menu-sub">Aide Malo l'ours à survivre à l'invasion !</div>
    <label class="pseudo-label">👤 Ton pseudo :</label>
    <input id="pseudo-input" maxlength="18" placeholder="Entre ton prénom…"/>
    <button id="play-btn">🍯 JOUER !</button>
    <button id="rules-btn">📖 Règles du jeu</button>
  </div>
</div>
```

**Fonctionnalité:**
- Input pseudo avec max 18 caractères
- 2 boutons: Jouer + Règles

#### Écran Règles (#rules-screen)
```html
<div class="screen" id="rules-screen">
  <div class="rules-card">
    <div class="rules-title">📖 Règles du jeu</div>
    
    <!-- Grille 2×4 des éléments du jeu -->
    <div class="rules-grid">
      <div class="rule-item">
        <span class="rule-emoji">🐝</span>
        <div class="rule-name">Abeille</div>
        <div class="rule-desc">+10 pts · 1 clic pour tuer</div>
      </div>
      <!-- ... 7 autres items (Guêpe, Reine, Miel, Chrono, Ruche, Combo, Bouclier) -->
    </div>
    
    <!-- Sections d'instructions -->
    <h3>🎯 Comment jouer</h3>
    <div class="rules-tip">👆 Clique sur les abeilles...</div>
    
    <h3>⚡ Paliers de score</h3>
    <div class="rules-tip">🐝 A 350 pts: Les guêpes arrivent !</div>
    
    <button id="back-from-rules-btn">← Retour au menu</button>
  </div>
</div>
```

**Contenu:** 8 éléments du jeu avec descriptions, conseils gameplay, paliers de score

#### Écran Game Over (#gameover-screen)
```html
<div class="screen" id="gameover-screen">
  <div class="gameover-card">
    <h1>💀 Game Over !</h1>
    <div id="final-pseudo"></div>      <!-- Nom joueur -->
    <div id="final-score">0 pts</div>  <!-- Score final -->
    <div id="final-stats"></div>       <!-- Stats: kills, reines, guêpes -->
    <button id="replay-btn">🐻 REJOUER !</button>
    <button id="menu-btn">🏠 Menu principal</button>
  </div>
</div>
```

**Affichage:** Pseudo, score, stats (kills/reines/guêpes), boutons action

---

### 6️⃣ ui.js — Gestion UI et Événements d'Écran

**Rôle:** Lier les événements des boutons et gérer les transitions d'écran

#### Événements Boutons
```javascript
bindScreenEvents()
```

Lie les écouteurs à:
- **Play Button**: Appelle `handlePlay()`
- **Rules Button**: Appelle `showRules()`
- **Back Button**: Appelle `hideRules()`
- **Replay Button**: Appelle `startGame()`
- **Menu Button**: Appelle `backToMenu()`
- **Pseudo Input (Enter)**: Appelle `handlePlay()`

#### Navigation d'Écrans

**handlePlay()**
```javascript
playerName = (input.value.trim() || 'Joueur')
startGame()
```
Récupère le pseudo et lance le jeu

**showRules() / hideRules()**
```javascript
Bascule display: none ↔ flex entre menu et règles
```

**backToMenu()**
```javascript
Active gameover-screen → menu-screen
Désactive classe 'storm' du fond
Régénère nuages
```

#### Ralentissement du Temps
```javascript
activateSlowMo()
  slowFactor = 0.22           (78% slower)
  slowmoOv.classList.add('active')     (Overlay cyan)
  Toutes abeilles: classe 'slowed'     (Opacité réduite)
  Timeout 6s de désactivation

deactivateSlowMo()
  Inverse tous les changements
  slowFactor = 1 (normal)
```

---

### 7️⃣ game.js — Moteur de Jeu et Mécaniques

**Rôle:** Cœur du jeu - gère la boucle, spawn d'ennemis, collisions, combat

#### Spawn d'Ennemis: spawnBee()

**Logique de Création:**
1. Vérifie si jeu actif
2. Compte ennemis sans animation death
3. Compare à limite par tier
4. Détermine type (normal/guêpe/reine)

**Types d'Ennemis:**
```javascript
const isQueen = forceQueen || 
                (!queenAlive && score >= 950 && Math.random() < 0.07)
const isWasp = !isQueen && score >= 350 && Math.random() < getWaspChance()
// sinon Normal bee
```

**Spawn Position:**
- Si fromLeft: x = -90 (hors écran gauche)
- Sinon: x = window.innerWidth + 10 (hors écran droit)
- Y: 80 à window.innerHeight - 320 (aléatoire)

**Calcul Angle Vers Ours:**
```javascript
const angle = Math.atan2(bearY - startY, bearCX - startX)
const baseVx = Math.cos(angle) * baseSpeed * 2
const baseVy = Math.sin(angle) * baseSpeed * 2
```
Ennemis se dirigent toujours vers l'ours

**Vitesses par Type:**
```
Normal Bee: baseSpeed
Wasp:       baseSpeed × 1.5 (+ 50%)
Queen:      baseSpeed × 0.7 (- 30%)
```

**Mouvement: moveBee() (RAF loop)**
```javascript
Chaque frame:
1. Ajoute waveTick (oscillation sinusoïdale)
2. Met à jour x et y avec vx/vy
3. Ajoute ondulation sine pour effet vague
4. Détecte collision avec ours
5. Dessine à nouvelle position
6. Requête frame suivant si vivant
```

**Vitesse Ondulation par Type:**
- Normal: 0.085 × slowFactor
- Wasp: 0.12 × slowFactor (plus rapide)
- Queen: 0.042 × slowFactor (plus lente)

#### Collision avec Ours: hitBear()

**Effets:**
1. Supprime l'ennemi du DOM
2. Marque reine comme morte si c'est une reine
3. **Si bouclier actif:**
   - Affiche "🛡️ BLOQUÉ!"
   - Relance animation bouclier
   - Son protection
4. **Sinon:**
   - Perd 1 cœur (`loseHeart()`)
   - Joue son d'impact (guêpe ou douleur)
   - Animation "shake" courte (140ms)
   - Classe "hurt" à l'ours
   - Réinitialise combo

#### Tuer un Ennemi: killBee()

**1. Événement Rare: 10% de chance fuite**
```javascript
Si !stun: affiche message de peur (😱🏃Nooon!Peur!)
Abeille sort du champ avec fade-out
Pas de points, pas de combo
```

**2. Normale Mort:**
```javascript
bee.classList.add('dying')  // Trigger animation CSS
Reine: queenAlive = false
```

**3. Effets Visuels:**
- **Splash:** Dégradé miel/guêpe radiaire qui s'agrandit
- **Étincelles:** 2 à 5 émojis ✨💫⭐🌟 qui tournent et disparaissent
- **Particules:** 10-22 petites boules de couleur qui s'envolent

**4. Calcul Points:**
```javascript
multiplier = getComboMultiplier()  (1, 2, 3, 4, ou 5)
points = Math.round(pointsBase * multiplier)

Normal Bee:   10 × multiplier
Wasp:         20 × multiplier
Queen:       150 × multiplier

Affiche popup: "+10", "x2 +20", "x5 +150", etc.
```

**5. Son:**
- Normal: Ton 880Hz puis 660Hz
- Wasp: Tons 440Hz et 330Hz
- Queen: Gamme descendante 5 notes

**6. Statistiques:**
```javascript
totalKills++
if (isQueen) totalQueens++
if (isWasp)  totalWasps++
```

#### Système Combo: addCombo() et resetCombo()

**addCombo():**
```javascript
comboCount++
comboPct = 100              // Reset barre
comboDisplay.classList.add('active')

Si comboCount >= 2:
  comboText = "x[multiplier] COMBO! 🔥🔥🔥"
  Font-size augmente avec combo (1.4rem → 2.3rem)
Sinon:
  comboText = "🐝 Bien visé!"
  Font-size normal

Color gradient par multiplier:
  x1: #FFD700 (or)
  x2: #FFD700
  x3: #FF8C00 (orange)
  x4: #FF4500 (orange-rouge)
  x5: #FF0080 (magenta)

Si comboCount >= 3: playsndCombo()

Interval decay: -2% comboPct tous les 60ms
Timeout: resetCombo() après 3 secondes
```

**getComboMultiplier():**
```
10+ = 5×
7-9 = 4×
4-6 = 3×
2-3 = 2×
0-1 = 1×
```

**resetCombo():**
```
comboCount = 0
comboPct = 0
Retire classe 'active' → combo disparaît
Clear tous les timers
```

#### Power-ups: Pot de Miel (spawnHoneyPot)

**Spawn:**
- Tous les 8-18 secondes (aléatoire)
- Position X aléatoire (80 à window.innerWidth-190)
- Position Y: ~150px (haut champ)
- Reste 4.5 secondes avant auto-disparition

**Au Clic:**
```javascript
Ajoute classe 'collecting' → animation collecte
Son: accord miel 3 notes
Choix logique:
  Si pas bouclier ET (vies=3 OU 40% chance):
    activateShield()
    Message: "🛡️ BOUCLIER!"
  Sinon:
    gainHeart()        (+1 vie, max 3)
    Message: "❤️ +1 VIE!"
Notification: affichée dans HUD
```

#### Power-up: Chronomètre Ralenti (dans le reste du file game.js)

**Spawn:** Aléatoire toutes les 12-20s
**Durée:** 5 secondes de ralentissement
**Effet:** slowFactor = 0.22 (78% plus lent)
**Visuels:** Overlay cyan activé, HUD "⏳ RALENTI!"
**Abeilles:** Classe 'slowed' appliquée (opacité 0.4, animation ralentie)

#### Ruche: Piège Damage

```javascript
spawnHive()
```

- Spawn aléatoire toutes les 20-30s
- Position X et Y aléatoires
- Click sur ruche = DANGER! -1 vie
- Si click accidentel: animation saut et sound basse
- Message "😱 -1 VIE!" en rouge
- Auto-disparition après 6s si non clickée

#### Orage: Storm Mode (após 1400 pts)

```javascript
bg.classList.add('storm')
```

**Visuels:**
- Fond dégradé sombre gris/noir/vert
- Nuages gris foncé
- Sol plus sombre
- Éclair: lueur blanche courte

**Sons:**
- Tonnerre grave (40Hz sawtooth dure)
- Ambiance sinistre

**Impact gameplay:** Aucun (cosmétique), mais augmente tension

---

## 🎮 Système de Jeu Complet

### Boucle Principale: startGame()
```javascript
1. Reset tous états (score, lives, combos, etc.)
2. Initialise audit
3. makeGrass(), makeClouds()
4. startBackgroundMusic()
5. Affiche #game, cache menu/gameover
6. Lance spawnInterval: spawnBee() toutes les getSpawnDelay(tier)
7. Lance timerInterval: incrementTimer() tous les 1000ms
```

### Barre de Temps
```javascript
gameTimer augmente de 1 chaque seconde
Durée max: 180 secondes (3 minutes)
Si gameTimer >= 180: endGame() (victoire par temps)
```

### Détection Fin de Jeu
```javascript
if (lives <= 0 || gameTimer >= 180):
  endGame()
  Affiche score final, stats, messages
```

### Multiplication Difficulté
```
Score | Tier | Speed | SpawnDelay | MaxEnemies | WaspChance
0     | 1    | 0.50  | 2500ms     | 5          | 0%
150   | 2    | 0.64  | 2280ms     | 7          | 0%
350   | 3    | 0.78  | 2060ms     | 9          | 12%
600   | 4    | 0.92  | 1840ms     | 11         | 19%
950   | 5    | 1.06  | 1620ms     | 13         | 26%
... jusqu'au tier 11 à 5500 pts
```

---

## 📊 Paliers De Score

| Score | Événement | Impact |
|-------|-----------|--------|
| 350 | Guêpes arrivent! | Spawn %guêpes = 12% min, texture jaune, +50% vitesse |
| 950 | Reine des Abeilles! | 7% chance spawn reine unique, 150 pts, -30% vitesse |
| 1400 | TEMPÊTE! | Fond sombre, nuages gris, éclairs, son tonnerre |

---

## 🎨 Palette Visuelle

```
Miel:           #F5A623  (Orange chaud principal)
Dark Honey:     #C07A10  (Orange ombre)
Sky Blue:       #87CEEB  (Bleu ciel par défaut)
Dark Sky Storm: #1A2230  (Gris-bleu tempête)
Bee Yellow:     #F5C518  (Jaune abeille vif)
Queen Red:      #FF4500  (Orange-rouge reine)
Danger:         #E74C3C  (Rouge danger)
Safe/Shield:    #00BFFF  (Bleu cyan)
Green Ground:   #5C8A2A  (Vert gazon)
```

---

## 🔊 Architecture Audio

**Web Audio API**
- **AudioContext:** Contexte global pour synthèse sonore
- **Oscillateurs:** Génèrent tones par fréquence Hz
- **Gain Nodes:** Contrôlent volume et enveloppe
- **Exponential Ramps:** Fade-out naturel

**Musique:** MP3 fichier externe en boucle (0.12 volume)
**SFX:** Synthétisés en-temps-réel (multiplier 1.35x volume)

---

## 🏆 Statistiques de Partie

```
Final Score:    Somme points combo-multiplié
Total Kills:    # abeilles normales tuées
Total Wasps:    # guêpes tuées
Total Queens:   # reines tuées
Time Survived:  secondes
```

Affichées à l'écran Game Over

---

## 💡 Concepts Clés de Programmation

### Patterns Utilisés

**1. Centralized State (state.js)**
- Un seul endroit pour toutes les variables globales
- Évite les bugs de synchronisation
- Facile à debugger

**2. Separation of Concerns**
- assets.js: SVG rendering
- audio.js: Son
- environment.js: Visuel décor
- ui.js: Interface
- game.js: Logique jeu

**3. RequestAnimationFrame (RAF)**
- Chaque ennemi a sa propre boucle RAF (`moveBee`)
- Sync avec refresh rate écran (~60fps)
- Meilleure perf que setTimeout

**4. Event Delegation**
- Clic sur ennemi capture et arrête propagation
- Évite les clics accidentels sur le sol

**5. DOM Manipulation Efficace**
- Crée éléments une fois, modifie classes CSS
- Animations via CSS Keyframes (GPU-accéléré)
- Remove() optimisé avec `animationend` listener

**6. Synthèse Audio Créative**
- Pas de fichiers d'effets sonores
- Génère sons en temps-réel par oscillateurs
- Réduit taille téléchargement

---

## 🚀 Pipeline Lancement du Jeu

```
1. index.html charge
2. <head> importe CSS (base, ui, screens)
3. <body> crée DOM structure
4. Assure ordre script chargement:
   a) screens-template.js → DOM #screens-root
   b) state.js → Variables globales
   c) audio.js → AudioContext
   d) assets.js → Fonctions SVG
   e) environment.js → Nuages/herbe
   f) ui.js → Event listeners menu/écrans
   g) game.js → RAF loops, spawn, logique complète
5. Menu s'affiche, prêt pour interaction
```

---

## 🎯 Flux Utilisateur Principal

```
Menu
  ↓ (Entre pseudo, clique Jouer)
Jeu Démarre
  ├─ Spawn abeilles progressif
  ├─ Joue musique fond
  ├─ Affiche HUD (cœurs, score, timer)
  └─ Joueur clique sur ennemis
     ├─ Tuées → +Points, +Combo, Effets
     └─ Lui touchent → -1 vie ou bloquet si shield
Fin Jeu (T=180s OU vies=0)
  ├─ Game Over écran
  ├─ Affiche stats finale
  └─ Rejouer ou Menu
```

---

## 📚 Conclusion

**Bear vs Bees** est une démonstration complète d'un jeu arcade moderne en web:

✅ **Architecture Modulaire:** Chaque fichier responsabilité claire
✅ **Performance:** RAF loops, CSS animations, audio synthèse
✅ **UX Polish:** Menus, règles, feedbacks visuels/sonores
✅ **Gameplay Progressive:** Difficulté croissante, paliers clairs
✅ **Créatif:** Audio synthétisé, SVG graphics, effets particles

**Stack Technologique:**
- 0 dépendances externes (sauf fonts Google)
- HTML5 sémantique
- CSS3 animations + gradients
- Vanilla JavaScript (pas de framework)
- Web Audio API (synthèse sonore)
- SVG assets vectoriels

**Scalabilité Potentielle:**
- Ajouter niveaux/boss
- Power-ups additionnels
- Leaderboard local/cloud
- Mobile touch support
- Son 3D spatializé

---

**📝 Fin de la présentation du code**

*Document généré pour présentation diaporama complète du jeu Bear vs Bees*
