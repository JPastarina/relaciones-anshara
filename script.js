"use strict";

/* =====================================================================
   DATOS  ·  Aquí es donde editas todo
   ---------------------------------------------------------------------
   Cada elemento de PEOPLE es una fotografía del tablón (hay 10).
   - img:      enlace DIRECTO a la imagen (p. ej. https://i.imgur.com/abc123.png).
               Si lo dejas vacío, el marco queda vacío con un "?".
   - name:     nombre (si lo dejas vacío, el expediente dice "Sin identificar")
   - alias, age, bond (vínculo con Anshara), status (estado), place (nacimiento)
   - notes:    lista de párrafos para "Notas del agente"
   - hand:     nota a mano (en rojo) al final del expediente
   Los campos que dejes vacíos se muestran como una línea en blanco.
   ===================================================================== */

const BOARD = {
  title: "RELACIONES",
  subtitle: "Anshara Ziusudra · Jikogisei Kaizokudan"
};

const PEOPLE = [
  { // 1
    img: "https://imgur.com/mAQe8jR.jpg",
    name: "Noir", alias: "", age: "42",
    bond: "Agente instructor", status: "Fallecido", place: "Birka",
    notes: [
      "Agente de la organización estacionado en Birka. Entrenó a Anshara durante varios años, hasta que completó su formación a los 16 años.",
      "Co-autor de la ficha de Anshara.",
      "No sobrevivió a la destrucción de Birka."
    ],
    hand: ""
  },
  { // 2
    img: "https://imgur.com/w749Ftu.jpg",
    name: "Vittoria de Medici",
    alias: "",
    age: "20",
    bond: "Capitana",
    status: "Viva",
    place: "Dressrosa",
    notes: [
      "Descubrió pronto lo mucho que le gusta el dinero a Anshara.",
      "Suele estar seria y taparse la zona de la boca."
    ],
    hand: "¡Me hizo tesorera de la banda!"
  },
  { // 3
    img: "https://imgur.com/Gjy0Msq.jpg",
    name: "Subaraki Rigel",
    alias: "",
    age: "30",
    bond: "Compañero",
    status: "Vivo",
    place: "Desconocido",
    notes: [
      "Al principio pensaba que era un idiota por sus bromas constantes.",
      "Es perezoso, se la pasa mirando el cielo. ¿Habrá algo?"
    ],
    hand: "No hacer bromas de tu madre"
  },
  { img: "", name: "", alias: "", age: "", bond: "", status: "", place: "", notes: [], hand: "" }, // 4
  { img: "", name: "", alias: "", age: "", bond: "", status: "", place: "", notes: [], hand: "" }, // 5
  { img: "", name: "", alias: "", age: "", bond: "", status: "", place: "", notes: [], hand: "" }, // 6
  { img: "", name: "", alias: "", age: "", bond: "", status: "", place: "", notes: [], hand: "" }, // 7
  { img: "", name: "", alias: "", age: "", bond: "", status: "", place: "", notes: [], hand: "" }, // 8
  { img: "", name: "", alias: "", age: "", bond: "", status: "", place: "", notes: [], hand: "" }, // 9
  { img: "", name: "", alias: "", age: "", bond: "", status: "", place: "", notes: [], hand: "" }  // 10
];

/* Hilos rojos: pares de números de fotografía (1 a 10) que quieres unir.
   Añade o quita pares libremente. */
const LINKS = [
  [1, 2], [2, 3], [3, 4], [4, 5],
  [1, 7], [2, 7], [3, 8], [4, 9], [5, 10],
  [6, 7], [7, 8], [8, 9], [9, 10],
  [1, 6], [5, 9]
];

/* =====================================================================
   COLOCACIÓN EN EL TABLÓN (ajustes avanzados)
   x, y = posición de la esquina superior izquierda en % del tablón
   w = ancho en %   ·   ar = proporción (ancho/alto)   ·   r = giro en grados
   ===================================================================== */
const WIDE = [
  { x: 4,  y: 19, w: 15, ar: "3/4", r: -3   },
  { x: 23, y: 23, w: 14, ar: "3/4", r: 2    },
  { x: 41, y: 19, w: 15, ar: "3/4", r: -1.5 },
  { x: 60, y: 24, w: 14, ar: "3/4", r: 3    },
  { x: 78, y: 20, w: 15, ar: "3/4", r: -2   },
  { x: 6,  y: 61, w: 14, ar: "3/4", r: 2.5  },
  { x: 24, y: 58, w: 15, ar: "3/4", r: -2.5 },
  { x: 43, y: 62, w: 14, ar: "3/4", r: 1.5  },
  { x: 61, y: 59, w: 15, ar: "3/4", r: -3   },
  { x: 80, y: 62, w: 14, ar: "3/4", r: 2    }
];

/* =====================================================================
   A partir de aquí no hace falta tocar nada
   ===================================================================== */
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g,
  c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pad = n => String(n).padStart(2, "0");
const NS = "http://www.w3.org/2000/svg";

const board = $("#board"), framesBox = $("#frames"), pinsBox = $("#pins"), svg = $("#strings");
const dossier = $("#dossier"), dBody = $("#dBody"), scrim = $("#scrim");
const mq = matchMedia("(max-width:700px)");

let frames = [], anchors = [], pins = [], links = [], current = -1, lastFocus = null;

/* Pone la imagen dentro de un contenedor; si no hay o falla, deja el marco vacío */
function fillPhoto(el, src, alt) {
  el.classList.remove("empty");
  el.textContent = "";
  if (!src) { el.classList.add("empty"); return; }
  const img = new Image();
  img.alt = alt;
  img.draggable = false;
  img.referrerPolicy = "no-referrer";
  img.addEventListener("error", () => { img.remove(); el.classList.add("empty"); });
  img.src = src;
  el.appendChild(img);
}

/* ---------- Construcción del tablón ---------- */
$("#boardTitle").textContent = BOARD.title;
$("#boardSub").textContent = BOARD.subtitle;

PEOPLE.forEach((p, i) => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "frame";
  b.setAttribute("aria-pressed", "false");
  b.setAttribute("aria-label", `Abrir expediente ${pad(i + 1)}: ${p.name || "sin identificar"}`);
  b.innerHTML = `<span class="photo"></span><i class="anchor"></i><span class="tag">${esc(p.name || "N.º " + pad(i + 1))}</span>`;
  fillPhoto(b.querySelector(".photo"), p.img, p.name ? `Fotografía de ${p.name}` : "Fotografía sin identificar");
  b.addEventListener("click", () => openDossier(i));
  framesBox.appendChild(b);
  frames.push(b);
  anchors.push(b.querySelector(".anchor"));

  const pin = document.createElement("span");
  pin.className = "pin";
  pinsBox.appendChild(pin);
  pins.push(pin);
});

LINKS.forEach(([a, b]) => {
  if (!PEOPLE[a - 1] || !PEOPLE[b - 1]) return;
  const g = document.createElementNS(NS, "g");
  g.setAttribute("class", "link");
  const paths = ["shadow", "main", "shine"].map(cls => {
    const pth = document.createElementNS(NS, "path");
    pth.setAttribute("class", cls);
    g.appendChild(pth);
    return pth;
  });
  svg.appendChild(g);
  links.push({ a: a - 1, b: b - 1, g, paths });
});

/* ---------- Colocación y dibujo de hilos ---------- */
function layout() {
  const narrow = mq.matches;
  board.classList.toggle("narrow", narrow);
  frames.forEach((f, i) => {
    let x, y, w, ar, r;
    if (narrow) {            // móvil: dos columnas en zigzag
      const row = Math.floor(i / 2), col = i % 2;
      x = col ? 56 : 8;
      y = 11.5 + row * 17.2 + (col ? 3.5 : 0);
      w = 36; ar = "1/1"; r = WIDE[i] ? WIDE[i].r : 0;
    } else {
      ({ x, y, w, ar, r } = WIDE[i] || { x: 5, y: 20, w: 14, ar: "3/4", r: 0 });
    }
    f.style.left = x + "%";
    f.style.top = y + "%";
    f.style.width = w + "%";
    f.style.setProperty("--ar", ar.replace("/", " / "));
    f.style.setProperty("--r", r + "deg");
  });
}

function draw() {
  const b = board.getBoundingClientRect();
  if (!b.width) return;
  svg.setAttribute("viewBox", `0 0 ${b.width} ${b.height}`);
  const pts = anchors.map(a => {
    const r = a.getBoundingClientRect();
    return [r.left + r.width / 2 - b.left, r.top + r.height / 2 - b.top];
  });
  pins.forEach((pin, i) => {
    pin.style.left = pts[i][0] + "px";
    pin.style.top = pts[i][1] + "px";
  });
  links.forEach(l => {
    const [x1, y1] = pts[l.a], [x2, y2] = pts[l.b];
    const sag = Math.min(Math.hypot(x2 - x1, y2 - y1) * 0.09, 34);   // el hilo cuelga un poco
    const d = `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${((x1 + x2) / 2).toFixed(1)} ${((y1 + y2) / 2 + sag).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
    l.paths.forEach(p => p.setAttribute("d", d));
  });
}

/* ---------- Expediente ---------- */
function renderDossier(i) {
  const p = PEOPLE[i];
  const status = (p.status || "").trim();
  const rows = [
    ["Nombre", p.name], ["Epíteto", p.alias], ["Edad", p.age],
    ["Vínculo", p.bond], ["Estado", p.status], ["Nacimiento", p.place]
  ].map(([k, v]) => `<dt>${k}</dt><dd class="${v ? "" : "none"}">${v ? esc(v) : "—"}</dd>`).join("");

  const notes = (p.notes && p.notes.length)
    ? p.notes.map(t => `<p>${esc(t)}</p>`).join("")
    : `<p class="none">Sin anotaciones.</p>`;

  dBody.innerHTML = `
    <p class="d-case">Expediente N.º ${pad(i + 1)} de ${pad(PEOPLE.length)}</p>
    <h2 id="dTitle">${esc(p.name || "Sin identificar")}</h2>
    <p class="d-sub">Relación con Anshara${p.bond ? ": " + esc(p.bond) : " sin determinar"}</p>
    <figure class="shot" style="margin-left:auto;margin-right:auto">
      <div class="ph"></div>
      <figcaption class="stamp ${status ? "" : "neutral"}">${esc(status || "Sin verificar")}</figcaption>
    </figure>
    <dl class="fields">${rows}</dl>
    <section class="notes">
      <h3>Notas del agente</h3>
      ${notes}
      ${p.hand ? `<p class="hand">${esc(p.hand)}</p>` : ""}
    </section>`;
  fillPhoto(dBody.querySelector(".ph"), p.img, p.name ? `Fotografía de ${p.name}` : "Fotografía sin identificar");
  $("#dCount").textContent = `${pad(i + 1)} / ${pad(PEOPLE.length)}`;
}

function openDossier(i, moveFocus = true) {
  current = i;
  if (moveFocus) lastFocus = frames[i];
  renderDossier(i);
  frames.forEach((f, k) => f.setAttribute("aria-pressed", String(k === i)));
  links.forEach(l => l.g.classList.toggle("hl", l.a === i || l.b === i));
  dossier.inert = false;
  dossier.setAttribute("aria-hidden", "false");
  dossier.classList.add("open");
  scrim.classList.add("show");
  dBody.scrollTop = 0;
  if (moveFocus) $("#dClose").focus({ preventScroll: true });
}

function closeDossier() {
  if (current < 0) return;
  dossier.classList.remove("open");
  scrim.classList.remove("show");
  dossier.setAttribute("aria-hidden", "true");
  if (lastFocus) lastFocus.focus({ preventScroll: true });
  dossier.inert = true;
  frames.forEach(f => f.setAttribute("aria-pressed", "false"));
  links.forEach(l => l.g.classList.remove("hl"));
  current = -1;
}

const go = d => openDossier((current + d + PEOPLE.length) % PEOPLE.length, false);

/* ---------- Eventos ---------- */
$("#dClose").addEventListener("click", closeDossier);
scrim.addEventListener("click", closeDossier);
$("#dPrev").addEventListener("click", () => go(-1));
$("#dNext").addEventListener("click", () => go(1));
document.addEventListener("keydown", e => {
  if (current < 0) return;
  if (e.key === "Escape") closeDossier();
  if (e.key === "ArrowRight") go(1);
  if (e.key === "ArrowLeft") go(-1);
});

mq.addEventListener("change", () => { layout(); draw(); });
new ResizeObserver(draw).observe(board);
window.addEventListener("resize", draw);
window.addEventListener("load", draw);

layout();
draw();
