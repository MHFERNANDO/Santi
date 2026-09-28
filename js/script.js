/* ---------- Portada: encender la vela ---------- */
const intro = document.getElementById('intro');
document.getElementById('vela-intro').addEventListener('click', () => {
  if (intro.classList.contains('encendida')) return;
  intro.classList.add('encendida');
  setTimeout(() => { intro.classList.add('abierto'); document.body.classList.remove('locked'); }, 3200);
  setTimeout(() => intro.remove(), 6400);
});

/* ---------- Nombre que se escribe letra por letra ---------- */
const h1 = document.querySelector('h1');
h1.setAttribute('aria-label', 'Jorge Santiago Jaramillo Hervas');
let n = 0;
h1.innerHTML = h1.innerHTML.split(/<br\s*\/?>/i).map(linea =>
  linea.trim().split(' ').map(w => '<span class="w">' + [...w].map(ch =>
    '<span class="l" aria-hidden="true" style="--i:' + (n++) + '">' + ch + '</span>').join('') + '</span>').join(' ')
).join('<br>');

/* ---------- Aparecer al hacer scroll ---------- */
document.querySelectorAll('.dia,.lugar-txt,.mapa,.muro h2,.sub,#form-vela').forEach(el => el.classList.add('rev'));
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); }
}), { threshold: .2 });
document.querySelectorAll('.rev').forEach(el => io.observe(el));

/* ---------- Hojas de olivo, chispas y viento ---------- */
const cv = document.getElementById('luz'), cx = cv.getContext('2d');
const reducir = matchMedia('(prefers-reduced-motion:reduce)').matches;
let W, H, hojas = [], chispas = [], viento = 0, ultimo = scrollY;
function ajustar() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
addEventListener('resize', ajustar); ajustar();
const N = reducir ? 0 : (innerWidth < 600 ? 9 : 18);
const colores = ['138,116,102', '176,150,110', '120,130,100'];
const nueva = arriba => ({
  x: Math.random() * W, y: arriba ? -20 : Math.random() * H, s: 7 + Math.random() * 8,
  v: .3 + Math.random() * .4, a: Math.random() * 6.28, va: (Math.random() - .5) * .02,
  o: Math.random() * 6.28, f: .008 + Math.random() * .01, c: colores[Math.floor(Math.random() * 3)],
  al: .25 + Math.random() * .25
});
for (let i = 0; i < N; i++) hojas.push(nueva(false));
function burst(x, y, k) {
  if (reducir) return;
  for (let i = 0; i < k; i++) chispas.push({ x, y, vx: (Math.random() - .5) * 1.4, vy: -.5 - Math.random() * 1.5,
    life: 1, d: .014 + Math.random() * .016, r: .6 + Math.random() * .9 });
}
addEventListener('scroll', () => {
  viento = Math.max(-6, Math.min(6, viento + (scrollY - ultimo) * .05)); ultimo = scrollY;
  const m = document.querySelector('.marco');
  if (m && !reducir && scrollY < innerHeight) m.style.translate = '0 ' + (scrollY * .12) + 'px';
}, { passive: true });
(function dibujar() {
  cx.clearRect(0, 0, W, H);
  for (let i = 0; i < hojas.length; i++) {
    const l = hojas[i];
    l.y += l.v; l.o += l.f; l.a += l.va; l.x += Math.sin(l.o) * .6 + viento * l.s * .08;
    if (l.y > H + 20) hojas[i] = nueva(true);
    cx.save(); cx.translate(l.x, l.y); cx.rotate(l.a + Math.sin(l.o) * .5);
    cx.fillStyle = `rgba(${l.c},${l.al})`; cx.strokeStyle = `rgba(${l.c},${l.al + .15})`; cx.lineWidth = .8;
    cx.beginPath(); cx.moveTo(0, -l.s * 1.6);
    cx.quadraticCurveTo(l.s * .8, 0, 0, l.s * 1.6);
    cx.quadraticCurveTo(-l.s * .8, 0, 0, -l.s * 1.6);
    cx.fill(); cx.moveTo(0, -l.s * 1.4); cx.lineTo(0, l.s * 1.4); cx.stroke();
    cx.restore();
  }
  viento *= .95;
  for (let i = chispas.length - 1; i >= 0; i--) {
    const c = chispas[i]; c.x += c.vx; c.y += c.vy; c.vx += (Math.random() - .5) * .1; c.vy *= .99; c.life -= c.d;
    if (c.life <= 0) { chispas.splice(i, 1); continue; }
    cx.fillStyle = `rgba(255,${190 + Math.floor(c.life * 50)},110,${c.life})`;
    cx.beginPath(); cx.arc(c.x, c.y, c.r, 0, 6.28); cx.fill();
  }
  requestAnimationFrame(dibujar);
})();

/* ---------- Muro de velas ----------
   Con Firebase: las velas las ve TODO el mundo.
   Sin configurar Firebase: se guardan solo en el navegador de cada persona. */
const FIREBASE = {
  apiKey: 'AIzaSyDqcBMM7vlv5uvUlODqpTTg586vKbPBRwo',
  authDomain: 'santi-a80ac.firebaseapp.com',
  projectId: 'santi-a80ac',
  storageBucket: 'santi-a80ac.firebasestorage.app',
  messagingSenderId: '151125043329',
  appId: '1:151125043329:web:26ca79c814076af24ac580'
};
const usaNube = !String(FIREBASE.projectId).startsWith('PEGA');

const velasEl = document.getElementById('velas'), lectura = document.getElementById('lectura');
const mensajes = document.getElementById('mensajes'), estado = document.getElementById('estado'), btn = document.querySelector('#form-vela button');
let total = 0, muroVisible = false, pend = [];
function encender(b, delay) {
  setTimeout(() => {
    b.classList.add('on');
    const r = b.querySelector('.llama').getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height * .6, 7);
  }, delay);
}
new IntersectionObserver((es, o) => {
  if (es[0].isIntersecting) { muroVisible = true; pend.forEach((b, i) => encender(b, 500 + i * 180)); pend = []; o.disconnect(); }
}, { threshold: .3 }).observe(velasEl);

function contar() {
  document.getElementById('contador').textContent =
    total + (total === 1 ? ' luz encendida' : ' luces encendidas') + ' en su memoria';
}
function pintar(v) {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'vela'; b.style.setProperty('--d', (total % 7) / 7);
  b.setAttribute('aria-label', 'Vela de ' + v.n);
  b.innerHTML = '<span class="llama"></span><span class="mecha"></span><span class="cera"></span>';
  b.addEventListener('click', () => {
    document.getElementById('lectura-msg').textContent = v.m ? '\u201C' + v.m + '\u201D' : 'Una luz encendida en tu memoria.';
    document.getElementById('lectura-nom').textContent = v.n;
    lectura.hidden = false;
    b.classList.add('avivar'); setTimeout(() => b.classList.remove('avivar'), 700);
    const r = b.querySelector('.llama').getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height * .5, 9);
  });
  velasEl.appendChild(b); total++; contar();
  if (muroVisible) encender(b, 700); else pend.push(b);
  if (v.m) {
    const d = document.createElement('div'); d.className = 'msg';
    const p = document.createElement('p'); p.textContent = v.m;
    const s = document.createElement('span'); s.textContent = v.n;
    d.append(p, s); mensajes.prepend(d);
  }
}
document.getElementById('cerrar').addEventListener('click', () => lectura.hidden = true);
addEventListener('keydown', e => { if (e.key === 'Escape') lectura.hidden = true; });


let guardar = null;
if (usaNube) {
  const V = '12.19.0', B = 'https://www.gstatic.com/firebasejs/' + V + '/';
  Promise.all([import(B + 'firebase-app.js'), import(B + 'firebase-firestore.js')]).then(([app, fs]) => {
    const col = fs.collection(fs.getFirestore(app.initializeApp(FIREBASE)), 'velas');
    fs.onSnapshot(fs.query(col, fs.orderBy('t', 'asc'), fs.limit(150)), snap =>
      snap.docChanges().forEach(ch => { if (ch.type === 'added') pintar(ch.doc.data()); }));
    guardar = v => fs.addDoc(col, { n: v.n, m: v.m, t: fs.serverTimestamp() });
  }).catch(() => { estado.textContent = 'No se pudo conectar. Revisa tu internet.'; });
} else {
  const KEY = 'velas-jorge-santiago';
  try { (JSON.parse(localStorage.getItem(KEY)) || []).forEach(pintar); } catch {}
  guardar = v => { const l = JSON.parse(localStorage.getItem(KEY) || '[]'); l.push(v); localStorage.setItem(KEY, JSON.stringify(l)); pintar(v); return Promise.resolve(); };
}

document.getElementById('form-vela').addEventListener('submit', async e => {
  e.preventDefault();
  const v = { n: nombre.value.trim().slice(0, 40), m: mensaje.value.trim().slice(0, 200) };
  if (!v.n) return;
  if (!guardar) { estado.textContent = 'Un momento, conectando\u2026'; return; }
  btn.disabled = true;
  try {
    await guardar(v);
    e.target.reset(); estado.textContent = 'Tu vela ya está encendida.';
    setTimeout(() => velasEl.lastChild && velasEl.lastChild.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
  } catch { estado.textContent = 'No se pudo encender la vela. Inténtalo otra vez.'; }
  btn.disabled = false;
});