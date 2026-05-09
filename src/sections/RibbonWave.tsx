import { useEffect, useRef } from 'react';

interface PipelineNode {
  label: string;
  x: number; y: number;
  icon: string;
}

interface Particle {
  pipeIndex: number; t: number; speed: number; size: number; hue: number;
}

const NODES: PipelineNode[] = [
  { label: 'Source',     x: 0.07, y: 0.20, icon: 'cloud' },
  { label: 'Ingest',    x: 0.21, y: 0.20, icon: 'arrows' },
  { label: 'Database',  x: 0.36, y: 0.20, icon: 'database' },
  { label: 'Clean',     x: 0.44, y: 0.52, icon: 'sparkle' },
  { label: 'Transform', x: 0.57, y: 0.52, icon: 'gear' },
  { label: 'Validate',  x: 0.70, y: 0.52, icon: 'check' },
  { label: 'Reporting',  x: 0.84, y: 0.52, icon: 'database' },
  { label: 'Dashboard', x: 0.78, y: 0.84, icon: 'chart' },
  { label: 'Report',    x: 0.92, y: 0.84, icon: 'document' },
];

const PIPES = [
  [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[6,8],
];

// ── Icon helpers ─────────────────────────────────────────

function drawCloud(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const s = r * 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - s, cy + s * 0.3);
  ctx.quadraticCurveTo(cx - s * 1.2, cy - s * 0.2, cx - s * 0.5, cy - s * 0.55);
  ctx.quadraticCurveTo(cx - s * 0.1, cy - s * 1.0, cx + s * 0.2, cy - s * 0.5);
  ctx.quadraticCurveTo(cx + s * 0.6, cy - s * 0.85, cx + s * 0.85, cy - s * 0.15);
  ctx.quadraticCurveTo(cx + s * 1.1, cy + s * 0.15, cx + s, cy + s * 0.3);
  ctx.closePath();
}

function drawArrows(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.lineWidth = 1.5;
  for (let i = -1; i <= 1; i++) {
    const y = cy + i * r * 0.4;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.4, y);
    ctx.lineTo(cx + r * 0.3, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + r * 0.3, y);
    ctx.lineTo(cx + r * 0.15, y - 3.5);
    ctx.moveTo(cx + r * 0.3, y);
    ctx.lineTo(cx + r * 0.15, y + 3.5);
    ctx.stroke();
  }
}

function drawDatabase(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const w = r * 0.5, h = r * 0.6, ey = r * 0.18;
  ctx.beginPath();
  ctx.moveTo(cx - w, cy - h + ey);
  ctx.lineTo(cx - w, cy + h - ey);
  ctx.ellipse(cx, cy + h - ey, w, ey, 0, Math.PI, 0, true);
  ctx.lineTo(cx + w, cy - h + ey);
  ctx.ellipse(cx, cy - h + ey, w, ey, 0, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, cy - h + ey, w, ey, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, cy - h * 0.1 + ey, w, ey, 0, 0, Math.PI);
  ctx.stroke();
}

function drawSparkle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, time: number) {
  const positions = [
    { x: 0, y: 0, s: 1.0 },
    { x: -0.3, y: -0.25, s: 0.65 },
    { x: 0.32, y: -0.2, s: 0.7 },
    { x: -0.2, y: 0.3, s: 0.55 },
    { x: 0.25, y: 0.28, s: 0.6 },
  ];
  for (const p of positions) {
    const px = cx + p.x * r;
    const py = cy + p.y * r;
    const pulse = 0.6 + 0.4 * Math.sin(time * 3 + p.x * 10 + p.y * 7);
    const sparkSize = r * 0.18 * p.s * pulse;
    ctx.save();
    ctx.shadowColor = `rgba(91, 180, 255, ${0.6 * pulse})`;
    ctx.shadowBlur = 6;
    ctx.fillStyle = `rgba(91, 180, 255, ${0.6 + 0.35 * pulse})`;
    // 4-pointed star
    ctx.beginPath();
    ctx.moveTo(px, py - sparkSize);
    ctx.quadraticCurveTo(px + sparkSize * 0.15, py - sparkSize * 0.15, px + sparkSize, py);
    ctx.quadraticCurveTo(px + sparkSize * 0.15, py + sparkSize * 0.15, px, py + sparkSize);
    ctx.quadraticCurveTo(px - sparkSize * 0.15, py + sparkSize * 0.15, px - sparkSize, py);
    ctx.quadraticCurveTo(px - sparkSize * 0.15, py - sparkSize * 0.15, px, py - sparkSize);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function drawGear(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, time: number) {
  const teeth = 7;
  const outerR = r * 0.5, innerR = r * 0.35;
  const rot = time * 0.5;
  ctx.beginPath();
  for (let i = 0; i < teeth * 2; i++) {
    const angle = (i / (teeth * 2)) * Math.PI * 2 + rot;
    const radius = i % 2 === 0 ? outerR : innerR;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.14, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(91, 141, 239, 0.5)';
  ctx.fill();
}

function drawCheck(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // Shield outline
  const s = r * 0.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy - s * 0.9);
  ctx.quadraticCurveTo(cx + s * 0.9, cy - s * 0.7, cx + s * 0.8, cy + s * 0.1);
  ctx.quadraticCurveTo(cx + s * 0.4, cy + s * 0.7, cx, cy + s * 0.95);
  ctx.quadraticCurveTo(cx - s * 0.4, cy + s * 0.7, cx - s * 0.8, cy + s * 0.1);
  ctx.quadraticCurveTo(cx - s * 0.9, cy - s * 0.7, cx, cy - s * 0.9);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  // Checkmark
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.35, cy);
  ctx.lineTo(cx - s * 0.05, cy + s * 0.35);
  ctx.lineTo(cx + s * 0.35, cy - s * 0.25);
  ctx.stroke();
  ctx.lineWidth = 1.2;
}

function drawChart(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const s = r * 0.45;
  const bars = [0.4, 0.7, 0.5, 0.9, 0.6];
  const bw = (s * 2) / (bars.length * 2 - 1);
  // Axes
  ctx.beginPath();
  ctx.moveTo(cx - s, cy - s * 0.8);
  ctx.lineTo(cx - s, cy + s * 0.6);
  ctx.lineTo(cx + s, cy + s * 0.6);
  ctx.stroke();
  // Bars
  for (let i = 0; i < bars.length; i++) {
    const bx = cx - s + i * bw * 2 + bw * 0.5;
    const bh = bars[i] * s * 1.2;
    ctx.fillRect(bx, cy + s * 0.6 - bh, bw, bh);
  }
}

function drawDocument(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const w = r * 0.38, h = r * 0.52;
  const fold = r * 0.12;
  // Page body
  ctx.beginPath();
  ctx.moveTo(cx - w, cy - h);
  ctx.lineTo(cx + w - fold, cy - h);
  ctx.lineTo(cx + w, cy - h + fold);
  ctx.lineTo(cx + w, cy + h);
  ctx.lineTo(cx - w, cy + h);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  // Fold triangle
  ctx.beginPath();
  ctx.moveTo(cx + w - fold, cy - h);
  ctx.lineTo(cx + w - fold, cy - h + fold);
  ctx.lineTo(cx + w, cy - h + fold);
  ctx.stroke();
  // Lines
  for (let i = 0; i < 3; i++) {
    const ly = cy - h * 0.3 + i * h * 0.4;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.6, ly);
    ctx.lineTo(cx + w * 0.4, ly);
    ctx.stroke();
  }
}

// ── Bézier helpers ──────────────────────────────────────────

function cubicBezier(t: number, p0: {x:number,y:number}, p1: {x:number,y:number}, p2: {x:number,y:number}, p3: {x:number,y:number}) {
  const u = 1 - t;
  return {
    x: u*u*u*p0.x + 3*u*u*t*p1.x + 3*u*t*t*p2.x + t*t*t*p3.x,
    y: u*u*u*p0.y + 3*u*u*t*p1.y + 3*u*t*t*p2.y + t*t*t*p3.y,
  };
}

function getControlPoints(from: {x:number,y:number}, to: {x:number,y:number}) {
  const dx = to.x - from.x, dy = to.y - from.y;
  if (Math.abs(dy) < 10) {
    return { p0: from, p1: { x: from.x + dx * 0.4, y: from.y }, p2: { x: to.x - dx * 0.4, y: to.y }, p3: to };
  }
  return { p0: from, p1: { x: from.x + dx * 0.5, y: from.y }, p2: { x: to.x - dx * 0.5, y: to.y }, p3: to };
}

// ── Component ──────────────────────────────────────────────

export default function DataPipeline() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let isVisible = true;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = 900, cssH = 500;
    canvas.width = cssW * dpr; canvas.height = cssH * dpr;
    canvas.style.width = `${cssW}px`; canvas.style.height = `${cssH}px`;
    ctx.scale(dpr, dpr);

    const nodeR = 28;
    const pos = NODES.map(n => ({ x: n.x * cssW, y: n.y * cssH }));
    const pipes = PIPES.map(([f, t]) => getControlPoints(pos[f], pos[t]));

    // Particles
    const particles: Particle[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        pipeIndex: Math.floor(Math.random() * pipes.length),
        t: Math.random(),
        speed: 0.002 + Math.random() * 0.003,
        size: 1.5 + Math.random() * 1.8,
        hue: 210 + Math.random() * 30,
      });
    }

    const handleVis = () => { isVisible = !document.hidden; };
    document.addEventListener('visibilitychange', handleVis);

    let time = 0;

    const animate = () => {
      if (!isVisible) { animationId = requestAnimationFrame(animate); return; }
      time += 0.02;
      ctx.clearRect(0, 0, cssW, cssH);

      // Draw pipes
      for (const { p0, p1, p2, p3 } of pipes) {
        ctx.save();
        ctx.shadowColor = 'rgba(91,141,239,0.25)'; ctx.shadowBlur = 8;
        ctx.strokeStyle = 'rgba(91,141,239,0.15)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(p0.x, p0.y);
        ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y); ctx.stroke();
        ctx.restore();
        ctx.strokeStyle = 'rgba(91,141,239,0.35)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(p0.x, p0.y);
        ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y); ctx.stroke();
      }

      // Draw particles
      for (const p of particles) {
        p.t += p.speed;
        if (p.t > 1) { p.t -= 1; p.pipeIndex = Math.floor(Math.random() * pipes.length); p.hue = 210 + Math.random() * 30; }
        const { p0, p1, p2, p3 } = pipes[p.pipeIndex];
        for (let trail = 3; trail >= 0; trail--) {
          const tt = Math.max(0, p.t - trail * 0.012);
          const tp = cubicBezier(tt, p0, p1, p2, p3);
          ctx.beginPath(); ctx.arc(tp.x, tp.y, p.size * (1 - trail * 0.15), 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue},80%,65%,${(1 - trail / 3) * 0.8})`;
          ctx.fill();
        }
        const lead = cubicBezier(p.t, p0, p1, p2, p3);
        ctx.save();
        ctx.shadowColor = `hsla(${p.hue},80%,65%,0.6)`; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.arc(lead.x, lead.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},80%,75%,0.9)`; ctx.fill();
        ctx.restore();
      }

      // Draw nodes
      for (let i = 0; i < NODES.length; i++) {
        const node = NODES[i];
        const p = pos[i];
        const pulse = 1 + Math.sin(time + i * 1.2) * 0.06;
        const r = nodeR * pulse;

        // Background circle
        ctx.save();
        ctx.shadowColor = 'rgba(91,141,239,0.3)'; ctx.shadowBlur = 12 + Math.sin(time + i) * 4;
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(8,8,18,0.85)'; ctx.fill();
        ctx.strokeStyle = `rgba(91,141,239,${0.4 + Math.sin(time + i) * 0.15})`;
        ctx.lineWidth = 1.5; ctx.stroke();
        ctx.restore();

        // Icon
        ctx.save();
        ctx.strokeStyle = 'rgba(91,141,239,0.7)';
        ctx.fillStyle = 'rgba(91,141,239,0.15)';
        ctx.lineWidth = 1.2;

        if (node.icon === 'cloud') { drawCloud(ctx, p.x, p.y, r); ctx.fill(); ctx.stroke(); }
        else if (node.icon === 'arrows') { drawArrows(ctx, p.x, p.y, r); }
        else if (node.icon === 'database') { drawDatabase(ctx, p.x, p.y, r); }
        else if (node.icon === 'sparkle') { drawSparkle(ctx, p.x, p.y, r, time); }
        else if (node.icon === 'gear') { drawGear(ctx, p.x, p.y, r, time); }
        else if (node.icon === 'check') { drawCheck(ctx, p.x, p.y, r); }
        else if (node.icon === 'chart') { drawChart(ctx, p.x, p.y, r); }
        else if (node.icon === 'document') { drawDocument(ctx, p.x, p.y, r); }

        ctx.restore();

        // Label
        ctx.fillStyle = '#7A7A9E';
        ctx.font = "11px 'JetBrains Mono', monospace";
        ctx.textAlign = 'center';
        ctx.fillText(node.label, p.x, p.y + r + 16);
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(animationId); document.removeEventListener('visibilitychange', handleVis); };
  }, []);

  return (
    <section ref={sectionRef} className="relative z-10 py-24 md:py-32 flex flex-col items-center">
      <p className="text-xs uppercase tracking-widest text-center mb-12"
        style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#7A7A9E', letterSpacing: '0.2em' }}>
        HOW I THINK ABOUT DATA
      </p>
      <div className="w-full flex justify-center px-4">
        <canvas ref={canvasRef} className="rounded-lg" style={{ maxWidth: '100%', touchAction: 'none' }} />
      </div>
    </section>
  );
}
