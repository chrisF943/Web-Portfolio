import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  color: string;
  alpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  baseX: number;
  baseY: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  life: number;
  maxLife: number;
  color: string;
}

const STAR_COLORS = ['#FFFFFF', '#AEC6FF', '#FFD4A3', '#B8E0D2'];
const LAYER_SPEEDS = [0.05, 0.1, 0.2, 0.3, 0.5];

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let isVisible = true;

    const mouse = { x: 0.5, y: 0.5 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = e.clientY / window.innerHeight;
    };

    const handleVisibility = () => {
      isVisible = !document.hidden;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('visibilitychange', handleVisibility);

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener('resize', resize);

    // Generate stars
    const layers: Star[][] = [];
    for (let i = 0; i < 5; i++) {
      const count = (i + 1) * 40;
      const layer: Star[] = [];
      for (let j = 0; j < count; j++) {
        layer.push({
          x: Math.random() * width,
          y: Math.random() * height,
          baseX: Math.random() * width,
          baseY: Math.random() * height,
          size: 0.5 + Math.random() * 2,
          color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
          alpha: 0.3 + Math.random() * 0.7,
          twinkleSpeed: 0.005 + Math.random() * 0.015,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
      layers.push(layer);
    }

    let shootingStars: ShootingStar[] = [];

    const createShootingStar = () => {
      const vx = (Math.random() - 0.5) * 16;
      const vy = 5 + Math.random() * 7;
      shootingStars.push({
        x: Math.random() * width,
        y: -20,
        vx,
        vy,
        length: 50 + Math.random() * 100,
        life: 20 + Math.floor(Math.random() * 40),
        maxLife: 20 + Math.floor(Math.random() * 40),
        color: '#AEC6FF',
      });
    };

    const animate = () => {
      if (!isVisible) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      ctx.fillStyle = '#080812';
      ctx.fillRect(0, 0, width, height);

      const offsetX = (mouse.x - 0.5) * 20;
      const offsetY = (mouse.y - 0.5) * 20;

      // Draw stars
      for (let li = 0; li < layers.length; li++) {
        const layer = layers[li];
        const speed = LAYER_SPEEDS[li];
        const parallaxFactor = li / 4;

        for (const star of layer) {
          star.twinklePhase += star.twinkleSpeed;
          const displayAlpha = 0.3 + ((Math.sin(star.twinklePhase) + 1) / 2) * 0.7;

          // Move stars horizontally based on layer speed
          star.baseX += speed;
          if (star.baseX > width) star.baseX -= width;

          const renderX = star.baseX + offsetX * parallaxFactor;
          const renderY = star.baseY + offsetY * parallaxFactor;

          ctx.beginPath();
          ctx.arc(renderX, renderY, star.size, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.globalAlpha = displayAlpha;
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;

      // Shooting stars
      if (Math.random() < 0.005) {
        createShootingStar();
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life--;

        const fade = s.life < 10 ? s.life / 10 : 1;
        ctx.globalAlpha = fade;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * (s.length / s.vy) * 0.5, s.y - s.length * 0.5);
        ctx.stroke();

        if (s.life <= 0 || s.y > height + 100) {
          shootingStars.splice(i, 1);
        }
      }

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
