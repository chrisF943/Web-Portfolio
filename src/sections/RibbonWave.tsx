import { useEffect, useRef } from 'react';

// ── Data pipeline visualization ──────────────────────────────────────
// Animated canvas showing data particles flowing through a pipeline:
//   Sources → Ingestion → Transform → Database
// Nodes are drawn as labeled icons, connected by curved pipes.
// Particles stream along the pipes with a glowing trail.

interface PipelineNode {
  label: string;
  x: number;   // 0–1 normalized
  y: number;   // 0–1 normalized
  icon: 'cloud' | 'stream' | 'transform' | 'database';
}

interface Pipe {
  from: number;
  to: number;
}

interface Particle {
  pipeIndex: number;
  t: number;        // 0–1 progress along pipe
  speed: number;
  size: number;
  hue: number;      // color variation
}

const NODES: PipelineNode[] = [
  { label: 'API',        x: 0.08, y: 0.25, icon: 'cloud' },
  { label: 'Stream',     x: 0.08, y: 0.75, icon: 'cloud' },
  { label: 'Ingestion',  x: 0.35, y: 0.50, icon: 'stream' },
  { label: 'Transform',  x: 0.62, y: 0.50, icon: 'transform' },
  { label: 'Database',   x: 0.90, y: 0.50, icon: 'database' },
];

const PIPES: Pipe[] = [
  { from: 0, to: 2 },  // API → Ingestion
  { from: 1, to: 2 },  // Stream → Ingestion
  { from: 2, to: 3 },  // Ingestion → Transform
  { from: 3, to: 4 },  // Transform → Database
];

// ── Icon drawing helpers ──────────────────────────────────────────────

function drawCloud(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.arc(cx, cy - r * 0.15, r * 0.55, Math.PI * 0.5, Math.PI * 1.5);
  ctx.arc(cx - r * 0.1, cy - r * 0.55, r * 0.4, Math.PI, Math.PI * 1.7);
  ctx.arc(cx + r * 0.2, cy - r * 0.6, r * 0.35, Math.PI * 1.2, Math.PI * 1.85);
  ctx.arc(cx + r * 0.35, cy - r * 0.2, r * 0.45, Math.PI * 1.5, Math.PI * 0.5);
  ctx.lineTo(cx - r * 0.55, cy + r * 0.3);
  ctx.closePath();
}

function drawStream(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // Three horizontal wavy arrows
  for (let i = -1; i <= 1; i++) {
    const y = cy + i * r * 0.45;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.5, y);
    ctx.quadraticCurveTo(cx - r * 0.15, y - 4, cx + r * 0.2, y);
    ctx.lineTo(cx + r * 0.45, y);
    ctx.stroke();
    // arrowhead
    ctx.beginPath();
    ctx.moveTo(cx + r * 0.45, y);
    ctx.lineTo(cx + r * 0.3, y - 4);
    ctx.moveTo(cx + r * 0.45, y);
    ctx.lineTo(cx + r * 0.3, y + 4);
    ctx.stroke();
  }
}

function drawTransform(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // Gear-like shape
  const teeth = 6;
  const outerR = r * 0.55;
  const innerR = r * 0.38;
  ctx.beginPath();
  for (let i = 0; i < teeth * 2; i++) {
    const angle = (i / (teeth * 2)) * Math.PI * 2 - Math.PI / 2;
    const radius = i % 2 === 0 ? outerR : innerR;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawDatabase(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const w = r * 0.55;
  const h = r * 0.7;
  const ey = r * 0.2;
  // body
  ctx.beginPath();
  ctx.moveTo(cx - w, cy - h + ey);
  ctx.lineTo(cx - w, cy + h - ey);
  ctx.ellipse(cx, cy + h - ey, w, ey, 0, Math.PI, 0, true);
  ctx.lineTo(cx + w, cy - h + ey);
  ctx.ellipse(cx, cy - h + ey, w, ey, 0, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // top ellipse
  ctx.beginPath();
  ctx.ellipse(cx, cy - h + ey, w, ey, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // middle line
  ctx.beginPath();
  ctx.ellipse(cx, cy - h * 0.15 + ey, w, ey, 0, 0, Math.PI);
  ctx.stroke();
}

// ── Bézier helpers ──────────────────────────────────────────────────

function cubicBezier(
  t: number,
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number }
) {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

function getPipeControlPoints(
  from: { x: number; y: number },
  to: { x: number; y: number }
) {
  const dx = to.x - from.x;
  return {
    p0: from,
    p1: { x: from.x + dx * 0.4, y: from.y },
    p2: { x: to.x - dx * 0.4, y: to.y },
    p3: to,
  };
}

// ── Component ──────────────────────────────────────────────────────

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
    const cssWidth = 800;
    const cssHeight = 420;

    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    ctx.scale(dpr, dpr);

    const w = cssWidth;
    const h = cssHeight;
    const nodeRadius = 32;

    // Convert normalized coords to pixel coords
    const nodePositions = NODES.map((n) => ({
      x: n.x * w,
      y: n.y * h,
    }));

    // Pre-compute pipe control points
    const pipeData = PIPES.map((pipe) => {
      const from = nodePositions[pipe.from];
      const to = nodePositions[pipe.to];
      return getPipeControlPoints(from, to);
    });

    // Particles
    const particles: Particle[] = [];
    const PARTICLE_COUNT = 60;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        pipeIndex: Math.floor(Math.random() * PIPES.length),
        t: Math.random(),
        speed: 0.002 + Math.random() * 0.003,
        size: 1.5 + Math.random() * 2,
        hue: 210 + Math.random() * 30, // blue range
      });
    }

    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Pulse glow on nodes
    let time = 0;

    const animate = () => {
      if (!isVisible) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      time += 0.02;
      ctx.clearRect(0, 0, w, h);

      // ── Draw pipes ──
      for (const { p0, p1, p2, p3 } of pipeData) {
        // Glow
        ctx.save();
        ctx.shadowColor = 'rgba(91, 141, 239, 0.25)';
        ctx.shadowBlur = 8;
        ctx.strokeStyle = 'rgba(91, 141, 239, 0.15)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
        ctx.stroke();
        ctx.restore();

        // Core line
        ctx.strokeStyle = 'rgba(91, 141, 239, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
        ctx.stroke();
      }

      // ── Draw particles ──
      for (const p of particles) {
        p.t += p.speed;
        if (p.t > 1) {
          p.t -= 1;
          p.pipeIndex = Math.floor(Math.random() * PIPES.length);
          p.hue = 210 + Math.random() * 30;
        }

        const { p0, p1, p2, p3 } = pipeData[p.pipeIndex];
        const pos = cubicBezier(p.t, p0, p1, p2, p3);

        // Trail: draw 3 fading dots behind
        for (let trail = 3; trail >= 0; trail--) {
          const tt = Math.max(0, p.t - trail * 0.012);
          const trailPos = cubicBezier(tt, p0, p1, p2, p3);
          const alpha = (1 - trail / 3) * 0.8;
          const radius = p.size * (1 - trail * 0.15);

          ctx.beginPath();
          ctx.arc(trailPos.x, trailPos.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${alpha})`;
          ctx.fill();
        }

        // Glow on lead particle
        ctx.save();
        ctx.shadowColor = `hsla(${p.hue}, 80%, 65%, 0.6)`;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 75%, 0.9)`;
        ctx.fill();
        ctx.restore();
      }

      // ── Draw nodes ──
      for (let i = 0; i < NODES.length; i++) {
        const node = NODES[i];
        const pos = nodePositions[i];
        const pulse = 1 + Math.sin(time + i * 1.2) * 0.08;
        const r = nodeRadius * pulse;

        // Node background circle
        ctx.save();
        ctx.shadowColor = 'rgba(91, 141, 239, 0.3)';
        ctx.shadowBlur = 12 + Math.sin(time + i) * 4;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(8, 8, 18, 0.85)';
        ctx.fill();
        ctx.strokeStyle = `rgba(91, 141, 239, ${0.4 + Math.sin(time + i) * 0.15})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // Icon inside
        ctx.save();
        ctx.strokeStyle = 'rgba(91, 141, 239, 0.7)';
        ctx.fillStyle = 'rgba(91, 141, 239, 0.15)';
        ctx.lineWidth = 1.2;

        switch (node.icon) {
          case 'cloud':
            drawCloud(ctx, pos.x, pos.y, r);
            ctx.fill();
            ctx.stroke();
            break;
          case 'stream':
            drawStream(ctx, pos.x, pos.y, r);
            break;
          case 'transform':
            drawTransform(ctx, pos.x, pos.y, r);
            ctx.fill();
            ctx.stroke();
            // inner circle
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, r * 0.18, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(91, 141, 239, 0.4)';
            ctx.fill();
            break;
          case 'database':
            drawDatabase(ctx, pos.x, pos.y, r);
            break;
        }
        ctx.restore();

        // Label
        ctx.fillStyle = '#7A7A9E';
        ctx.font = "11px 'JetBrains Mono', monospace";
        ctx.textAlign = 'center';
        ctx.fillText(node.label, pos.x, pos.y + r + 18);
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-10 py-24 md:py-32 flex flex-col items-center"
    >
      <p
        className="text-xs uppercase tracking-widest text-center mb-12"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          color: '#7A7A9E',
          letterSpacing: '0.2em',
        }}
      >
        HOW I THINK ABOUT DATA
      </p>

      <div className="w-full flex justify-center px-4">
        <canvas
          ref={canvasRef}
          className="rounded-lg"
          style={{
            maxWidth: '100%',
            touchAction: 'none',
          }}
        />
      </div>
    </section>
  );
}
