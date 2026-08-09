function draw() {
  t += 0.008 + energy * 0.022;
  energy += (energyTarget - energy) * 0.05;

  ctx.fillStyle = "rgba(1, 4, 12, 0.5)";
  ctx.fillRect(0, 0, W, H);

  nebula();
  circuits();

  /* starfield */
  const speed = 3.2 + energy * 9;
  for (const s of stars) {
    s.z -= speed;
    if (s.z <= 8) Object.assign(s, spawnStar(false));
    const k = 420 / s.z;
    const sx = CX + (s.x - mx * 240) * k / 4;
    const sy = CY + (s.y - my * 160) * k / 4;
    if (sx < 0 || sx > W || sy < 0 || sy > H) continue;
    const size = Math.min(2.4, k * 0.5);
    const a = Math.min(1, (1500 - s.z) / 900);
    ctx.fillStyle = "rgba(160, 215, 255, " + (a * 0.8) + ")";
    ctx.fillRect(sx, sy, size, size);
  }

  const R = Math.min(W, H) * 0.30;
  const cx = CX + mx * 14;
  const cyh = CY - R * 0.42 + my * 10;   // head center
  const S = R * 0.60;                    // head scale
  const pyP = cyh + S * 2.85;            // platform level

  /* ---- projection platform ---- */
  ctx.save();
  ctx.translate(cx, pyP);
  ctx.scale(1, 0.30);
  const pg = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 0.95);
  pg.addColorStop(0, "rgba(150,225,255," + (0.5 + energy * 0.3) + ")");
  pg.addColorStop(0.4, "rgba(56,150,255,0.16)");
  pg.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = pg;
  ctx.beginPath(); ctx.arc(0, 0, R * 0.95, 0, Math.PI * 2); ctx.fill();

  const ringDefs = [[0.34, 0.55, -1], [0.52, 0.4, 1], [0.72, 0.32, -0.6], [0.92, 0.24, 0.8]];
  for (const rd of ringDefs) {
    ctx.strokeStyle = "rgba(120,200,255," + (rd[1] + energy * 0.2) + ")";
    ctx.lineWidth = 1.4;
    ctx.setLineDash([26, 14]);
    ctx.lineDashOffset = t * 40 * rd[2];
    ctx.beginPath(); ctx.arc(0, 0, R * rd[0], 0, Math.PI * 2); ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.rotate(t * 0.9);
  ctx.fillStyle = "rgba(85,200,255," + (0.06 + energy * 0.06) + ")";
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R * 0.92, 0, 0.6); ctx.closePath(); ctx.fill();
  ctx.restore();

  /* ---- light beam ---- */
  const bg = ctx.createLinearGradient(0, pyP, 0, cyh + S * 0.6);
  bg.addColorStop(0, "rgba(120,210,255," + (0.28 + energy * 0.25) + ")");
  bg.addColorStop(1, "rgba(120,210,255,0)");
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.moveTo(cx - R * 0.30, pyP);
  ctx.lineTo(cx - R * 0.10, cyh + S * 0.7);
  ctx.lineTo(cx + R * 0.10, cyh + S * 0.7);
  ctx.lineTo(cx + R * 0.30, pyP);
  ctx.closePath(); ctx.fill();

  /* ---- rising data motes ---- */
  for (const p of parts) {
    const frac = ((t * 0.10 * (0.5 + p.tilt) + p.rot) % 1 + 1) % 1;
    const yy = pyP - frac * (pyP - (cyh + S * 0.5));
    const xx = cx + Math.cos(p.a + t * p.sp * 2) * R * 0.16 * (1 - frac * 0.55);
    const a = Math.sin(frac * Math.PI) * (0.35 + energy * 0.45);
    ctx.fillStyle = "rgba(150,225,255," + a + ")";
    ctx.fillRect(xx, yy, p.s, p.s);
  }

  /* ---- holographic wireframe head ---- */
  const yaw = Math.sin(t * 0.35) * 0.45 + mx * 0.35;
  const pts = new Array(HEAD_PTS.length);
  for (let i = 0; i < HEAD_PTS.length; i++) pts[i] = headPoint(HEAD_PTS[i], yaw, S, cx, cyh);

  /* ---- holographic torso (body turns less than the head) ---- */
  const byaw = yaw * 0.35;
  const bpts = new Array(BUST_PTS.length);
  for (let i = 0; i < BUST_PTS.length; i++) bpts[i] = headPoint(BUST_PTS[i], byaw, S, cx, cyh);
  const NR = BUST_ROWS.length;
  ctx.lineWidth = 1;
  for (let i = 0; i < NR; i++) {
    const fade = 1 - Math.max(0, (i - 3) / (NR - 3)) * 0.75;
    for (let j = 0; j < BUST_LON; j++) {
      const a1 = bpts[i * BUST_LON + j];
      const a2 = bpts[i * BUST_LON + ((j + 1) % BUST_LON)];
      const d = (a1.d + a2.d) / 2;
      ctx.strokeStyle = "rgba(90,190,255," + ((0.04 + d * d * 0.30) * fade * (1 + energy * 0.6)) + ")";
      ctx.beginPath(); ctx.moveTo(a1.x, a1.y); ctx.lineTo(a2.x, a2.y); ctx.stroke();
    }
  }
  for (let j = 0; j < BUST_LON; j += 2) {
    for (let i = 0; i < NR - 1; i++) {
      const a1 = bpts[i * BUST_LON + j];
      const a2 = bpts[(i + 1) * BUST_LON + j];
      const d = (a1.d + a2.d) / 2;
      const fade = 1 - Math.max(0, (i - 3) / (NR - 3)) * 0.7;
      ctx.strokeStyle = "rgba(90,190,255," + ((0.035 + d * d * 0.26) * fade * (1 + energy * 0.6)) + ")";
      ctx.beginPath(); ctx.moveTo(a1.x, a1.y); ctx.lineTo(a2.x, a2.y); ctx.stroke();
    }
  }
  for (let i = 0; i < bpts.length; i += 4) {
    const p = bpts[i];
    if (p.d < 0.62) continue;
    ctx.fillStyle = "rgba(170,230,255," + ((p.d - 0.6) * 1.1) + ")";
    ctx.fillRect(p.x, p.y, 1.5, 1.5);
  }
  /* energy pulse rising through the spine into the head */
  const spFrac = (t * 0.6) % 1;
  const spY = cyh + S * (2.4 - spFrac * 3.3);
  if (spY > cyh - S) {
    const g2 = ctx.createRadialGradient(cx, spY, 0, cx, spY, S * 0.18);
    g2.addColorStop(0, "rgba(190,240,255," + (0.45 + energy * 0.4) + ")");
    g2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g2;
    ctx.beginPath(); ctx.arc(cx, spY, S * 0.18, 0, Math.PI * 2); ctx.fill();
  }

  ctx.lineWidth = 1;
  for (let i = 0; i <= HEAD_LAT; i++) {
    for (let j = 0; j < HEAD_LON; j++) {
      const a1 = pts[i * HEAD_LON + j];
      const a2 = pts[i * HEAD_LON + ((j + 1) % HEAD_LON)];
      const d = (a1.d + a2.d) / 2;
      ctx.strokeStyle = "rgba(90,190,255," + ((0.05 + d * d * 0.35) * (1 + energy * 0.6)) + ")";
      ctx.beginPath(); ctx.moveTo(a1.x, a1.y); ctx.lineTo(a2.x, a2.y); ctx.stroke();
    }
  }
  for (let j = 0; j < HEAD_LON; j += 2) {
    for (let i = 0; i < HEAD_LAT; i++) {
      const a1 = pts[i * HEAD_LON + j];
      const a2 = pts[(i + 1) * HEAD_LON + j];
      const d = (a1.d + a2.d) / 2;
      ctx.strokeStyle = "rgba(90,190,255," + ((0.04 + d * d * 0.30) * (1 + energy * 0.6)) + ")";
      ctx.beginPath(); ctx.moveTo(a1.x, a1.y); ctx.lineTo(a2.x, a2.y); ctx.stroke();
    }
  }
  for (let i = 0; i < pts.length; i += 3) {
    const p = pts[i];
    if (p.d < 0.62) continue;
    ctx.fillStyle = "rgba(170,230,255," + ((p.d - 0.6) * 1.4) + ")";
    ctx.fillRect(p.x, p.y, 1.6, 1.6);
  }

  /* glowing eyes */
  for (const ex of [-0.30, 0.30]) {
    const e = headPoint({ x: ex, y: 0.16, z: 0.62 }, yaw, S, cx, cyh);
    if (e.d > 0.35) {
      const ea = (0.5 + 0.3 * Math.sin(t * 6 + ex)) * (0.5 + e.d * 0.5) + energy * 0.25;
      const eg = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, S * 0.13);
      eg.addColorStop(0, "rgba(225,250,255," + Math.min(1, ea) + ")");
      eg.addColorStop(0.35, "rgba(90,200,255," + (ea * 0.6) + ")");
      eg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = eg;
      ctx.beginPath(); ctx.arc(e.x, e.y, S * 0.13, 0, Math.PI * 2); ctx.fill();
    }
  }

  glyphs(cx, cyh, R * 0.62);
  lightning(cx, cyh, R * 0.9);

  /* ---- always-on listening waveform ---- */
  const base = H - 150;
  ctx.strokeStyle = "rgba(139, 233, 253, " + (0.35 + energy * 0.55) + ")";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  const wW = Math.min(W * 0.6, R * 3.2);
  for (let i = 0; i <= 120; i++) {
    const x = cx - wW / 2 + (wW / 120) * i;
    const amp = (2.5 + 14 * energy) * Math.sin(i * 0.55 + t * 22) * Math.sin(i * 0.13 + t * 9);
    i === 0 ? ctx.moveTo(x, base + amp) : ctx.lineTo(x, base + amp);
  }
  ctx.stroke();

  requestAnimationFrame(draw);
}
draw();

