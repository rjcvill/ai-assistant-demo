
/* ---- SAFE STORAGE (works even where the browser blocks site storage) ---- */
var _memStore = {};
var JSTORE = (function () {
  try {
    var LS = window["local" + "Storage"];
    LS.setItem("_jt", "1"); LS.removeItem("_jt");
    return LS;
  } catch (e) {
    return {
      getItem: function (k) { return (k in _memStore) ? _memStore[k] : null; },
      setItem: function (k, v) { _memStore[k] = String(v); },
      removeItem: function (k) { delete _memStore[k]; }
    };
  }
})();

/* ================= BOOT SEQUENCE ================= */
const bootMsgs = [
  "> JADEN OS v4.0 \u2014 initializing kernel...",
  "> loading neural interface............ OK",
  "> calibrating holographic display..... OK",
  "> spinning up reactor core............ OK",
  "> voice systems online................ OK",
  "> genius knowledge matrix............. OK",
  "> einstein cognition engine.......... OK",
  "> genius council assembled........... OK",
  "> butler protocols loaded............ OK",
  "> holographic avatar projected....... OK",
  "> humanoid form calibrated........... OK",
  "> ambient sound matrix tuned......... OK",
  "> cross-device layout adaptive....... OK",
  "> ALL SYSTEMS NOMINAL"
];
const bootLinesEl = document.getElementById("boot-lines");
const bootFill = document.getElementById("boot-fill");
bootMsgs.forEach((m, i) => {
  setTimeout(() => {
    const d = document.createElement("div");
    d.textContent = m;
    d.style.animationDelay = "0s";
    bootLinesEl.appendChild(d);
    bootFill.style.width = Math.round(((i + 1) / bootMsgs.length) * 100) + "%";
  }, 260 * i + 200);
});
setTimeout(() => document.getElementById("boot").classList.add("done"), 260 * bootMsgs.length + 700);

/* ================= 3D SCENE (starfield + reactor + particles) ================= */
const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");
let W, H, CX, CY;
function resize() { W = canvas.width = innerWidth; H = canvas.height = innerHeight; CX = W / 2; CY = H / 2; }
resize();
addEventListener("resize", resize);

let t = 0;
let energy = 0, energyTarget = 0;   // rises when Jaden thinks/speaks
let mx = 0, my = 0;                 // mouse parallax -1..1
addEventListener("touchmove", e => {
  const t0 = e.touches[0];
  if (!t0) return;
  mx = (t0.clientX / W) * 2 - 1;
  my = (t0.clientY / H) * 2 - 1;
}, { passive: true });
addEventListener("mousemove", e => {
  mx = (e.clientX / W) * 2 - 1;
  my = (e.clientY / H) * 2 - 1;
  document.getElementById("hud").style.transform =
    `rotateY(${mx * 3}deg) rotateX(${ -my * 3}deg)`;
});

/* --- starfield flying toward viewer --- */
const STARS = Math.min(innerWidth, innerHeight) < 640 ? 150 : 320;
const stars = Array.from({ length: STARS }, () => spawnStar(true));
function spawnStar(scatter) {
  return {
    x: (Math.random() * 2 - 1) * 1600,
    y: (Math.random() * 2 - 1) * 1000,
    z: scatter ? Math.random() * 1400 + 60 : 1460
  };
}

/* --- orbital particles around the core --- */
const PARTS = Math.min(innerWidth, innerHeight) < 640 ? 45 : 90;
const parts = Array.from({ length: PARTS }, (_, i) => ({
  a: Math.random() * Math.PI * 2,          // orbit angle
  r: 0.36 + Math.random() * 0.62,          // orbit radius (fraction of R)
  tilt: (Math.random() * 0.9 + 0.25),      // ellipse squash = fake 3D inclination
  rot: Math.random() * Math.PI,            // orbit plane rotation
  sp: (Math.random() * 0.6 + 0.35) * (Math.random() < 0.5 ? 1 : -1),
  s: Math.random() * 1.6 + 0.6
}));

function ellipseRing(cx, cy, rx, ry, rot, alpha, width, dash) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.strokeStyle = `rgba(120, 200, 255, ${alpha})`;
  ctx.lineWidth = width;
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/* ---- INSANE FX ---- */
function nebula() {
  const hues = [205, 265, 165];
  for (let i = 0; i < 3; i++) {
    const nx = CX + Math.sin(t * 0.11 + i * 2.1) * W * 0.32;
    const ny = CY + Math.cos(t * 0.07 + i * 1.7) * H * 0.32;
    const nr = Math.min(W, H) * (0.55 + 0.15 * Math.sin(t * 0.13 + i));
    const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
    g.addColorStop(0, "hsla(" + (hues[i] + Math.sin(t * 0.2 + i) * 30) + ",90%,55%," + (0.05 + energy * 0.05) + ")");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
}
function lightning(cx, cy, R) {
  if (Math.random() > 0.05 + energy * 0.3) return;
  const a0 = Math.random() * Math.PI * 2;
  let x = cx + Math.cos(a0) * R * 0.34, y = cy + Math.sin(a0) * R * 0.34;
  ctx.strokeStyle = "rgba(190,235,255," + (0.5 + energy * 0.5) + ")";
  ctx.lineWidth = 1.4;
  ctx.shadowColor = "#9adfff"; ctx.shadowBlur = 14;
  ctx.beginPath(); ctx.moveTo(x, y);
  const steps = 5 + Math.floor(Math.random() * 4);
  for (let i = 0; i < steps; i++) {
    x += Math.cos(a0) * R * 0.13 + (Math.random() - 0.5) * R * 0.17;
    y += Math.sin(a0) * R * 0.13 + (Math.random() - 0.5) * R * 0.17;
    ctx.lineTo(x, y);
  }
  ctx.stroke(); ctx.shadowBlur = 0;
}
function sweep(cx, cy, R) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.9);
  ctx.fillStyle = "rgba(85,200,255," + (0.045 + energy * 0.05) + ")";
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R * 1.18, 0, 0.55); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "rgba(140,225,255," + (0.35 + energy * 0.4) + ")";
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(R * 1.18, 0); ctx.stroke();
  ctx.restore();
}
function glyphs(cx, cy, R) {
  const str = "JADEN \u00B7 QUANTUM CORE \u00B7 GENIUS COUNCIL \u00B7 ONLINE \u00B7 ";
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(-t * 0.22);
  ctx.font = Math.max(8, R * 0.052) + "px Consolas, monospace";
  ctx.fillStyle = "rgba(130,205,255,0.55)";
  ctx.textAlign = "center";
  for (let i = 0; i < str.length; i++) {
    const a = (i / str.length) * Math.PI * 2;
    ctx.save(); ctx.rotate(a); ctx.translate(0, -R * 1.34);
    ctx.fillText(str[i], 0, 0); ctx.restore();
  }
  ctx.restore();
}

/* ---- HOLOGRAPHIC HEAD MESH ---- */
const HEAD_LAT = 22, HEAD_LON = 32;
const HEAD_PTS = [];
(function buildHead() {
  const RX = 0.78, RZ = 0.85;
  for (let i = 0; i <= HEAD_LAT; i++) {
    const th = (i / HEAD_LAT) * Math.PI;
    const yy = Math.cos(th);
    const s0 = Math.sin(th);
    for (let j = 0; j < HEAD_LON; j++) {
      const ph = (j / HEAD_LON) * Math.PI * 2;
      let x = s0 * Math.cos(ph) * RX;
      let z = s0 * Math.sin(ph) * RZ;
      let y = yy;
      if (y < -0.35) {                                  // taper skull into jaw + chin
        const f = Math.max(0.25, 1 - (-y - 0.35) * 0.85);
        x *= f;
        z = z * f + (z > 0 ? (1 - f) * 0.18 : 0);       // jaw juts slightly forward
      }
      if (z > 0.45 && Math.abs(x) < 0.20 && y > -0.32 && y < 0.02) z += 0.10;  // nose
      HEAD_PTS.push({ x: x, y: y, z: z });
    }
  }
})();
function headPoint(p, yaw, S, cx, cyh) {
  const ca = Math.cos(yaw), sa = Math.sin(yaw);
  const xr = p.x * ca + p.z * sa;
  const zr = -p.x * sa + p.z * ca;
  const k = 1 / (1 - zr * 0.22);
  return { x: cx + xr * S * k, y: cyh - p.y * S * k, d: (zr + 1) / 2 };
}
/* ---- HOLOGRAPHIC TORSO MESH ---- */
const BUST_ROWS = [
  [-0.92, 0.34, 0.36],
  [-1.12, 0.30, 0.33],
  [-1.28, 0.66, 0.44],
  [-1.42, 1.30, 0.52],
  [-1.60, 1.42, 0.55],
  [-1.85, 1.30, 0.52],
  [-2.15, 1.14, 0.47],
  [-2.45, 1.02, 0.42]
];
const BUST_LON = 32;
const BUST_PTS = [];
(function buildBust() {
  for (const row of BUST_ROWS) {
    for (let j = 0; j < BUST_LON; j++) {
      const ph = (j / BUST_LON) * Math.PI * 2;
      BUST_PTS.push({ x: Math.cos(ph) * row[1], y: row[0], z: Math.sin(ph) * row[2] });
    }
  }
})();

function circuits() {
  for (let i = 0; i < 24; i++) {
    const x = ((i + 0.5) / 24) * W;
    ctx.fillStyle = "rgba(60,140,210,0.045)";
    ctx.fillRect(x, 0, 1, H);
    const sp = 40 + ((i * 37) % 50);
    const yy = ((t * sp * 6 + i * 431) % (H + 120)) - 60;
    ctx.fillStyle = "rgba(120,200,255,0.14)";
    ctx.fillRect(x, yy - 26, 1, 26);
    ctx.fillStyle = "rgba(170,230,255,0.5)";
    ctx.fillRect(x - 1, yy, 2, 2);
  }
}

