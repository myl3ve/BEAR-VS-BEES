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
