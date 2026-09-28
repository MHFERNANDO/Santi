/* ---------- Portada: encender la vela ---------- */
const intro = document.getElementById('intro');
document.getElementById('vela-intro').addEventListener('click', () => {
  intro.classList.add('encendida');
  setTimeout(() => intro.classList.add('abierto'), 1600);
  setTimeout(() => { document.body.classList.remove('locked'); intro.remove(); }, 3400);
});

/* ---------- Luces flotantes (como luciérnagas) ---------- */
const cv = document.getElementById('luz'), cx = cv.getContext('2d');
let W, H, luces = [];
function ajustar() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
addEventListener('resize', ajustar); ajustar();
const N = matchMedia('(prefers-reduced-motion:reduce)').matches ? 0 : (innerWidth < 600 ? 16 : 38);
for (let i = 0; i < N; i++) luces.push({
  x: Math.random() * W, y: Math.random() * H, r: 1 + Math.random() * 2.4,
  v: .15 + Math.random() * .35, o: Math.random() * 6.28, f: .01 + Math.random() * .02
});
(function dibujar() {
  cx.clearRect(0, 0, W, H);
  for (const l of luces) {
    l.y -= l.v; l.o += l.f; l.x += Math.sin(l.o) * .4;
    if (l.y < -10) { l.y = H + 10; l.x = Math.random() * W; }
    const a = .25 + .35 * Math.sin(l.o * 2) ** 2;
    const g = cx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r * 6);
    g.addColorStop(0, `rgba(242,178,92,${a})`); g.addColorStop(1, 'rgba(242,178,92,0)');
    cx.fillStyle = g; cx.beginPath(); cx.arc(l.x, l.y, l.r * 6, 0, 6.28); cx.fill();
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
let total = 0;

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
  });
  velasEl.appendChild(b); total++; contar();
  if (v.m) {
    const d = document.createElement('div'); d.className = 'msg';
    const p = document.createElement('p'); p.textContent = v.m;
    const s = document.createElement('span'); s.textContent = v.n;
    d.append(p, s); mensajes.prepend(d);
  }
}
document.getElementById('cerrar').addEventListener('click', () => lectura.hidden = true);
addEventListener('keydown', e => { if (e.key === 'Escape') lectura.hidden = true; });

pintar({ n: 'Tu familia', m: 'Tu corazón siempre estuvo dispuesto a dar. Te llevamos con amor.' });

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