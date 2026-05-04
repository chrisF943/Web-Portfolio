import { useEffect, useRef, useState } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  ribbonIndex: number;
}

function rotateY(point: { x: number; y: number; z: number }, angle: number) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: point.x * cos - point.z * sin,
    y: point.y,
    z: point.x * sin + point.z * cos,
  };
}

function rotateX(point: { x: number; y: number; z: number }, angle: number) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: point.x,
    y: point.y * cos - point.z * sin,
    z: point.y * sin + point.z * cos,
  };
}

function project(
  point: { x: number; y: number; z: number },
  width: number,
  height: number,
  fov: number,
  viewDistance: number
) {
  const scale = fov / (viewDistance + point.z);
  return {
    x: point.x * scale + width / 2,
    y: point.y * scale + height / 2,
    scale,
  };
}

export default function RibbonWave() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let isVisible = true;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssWidth = 800;
    const cssHeight = 500;

    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    ctx.scale(dpr, dpr);

    const width = cssWidth;
    const height = cssHeight;

    // Ribbon params
    const ribbonCount = 5;
    const pointsPerRibbon = 80;
    const ribbonWidth = 12;
    const spacing = 3;
    const waveAmplitude = 80;
    const waveFrequency = 0.02;
    const waveSpeed = 0.002;

    // Generate ribbons
    const ribbons: Point3D[][] = [];
    for (let r = 0; r < ribbonCount; r++) {
      const ribbon: Point3D[] = [];
      for (let i = 0; i < pointsPerRibbon; i++) {
        const baseX = i * spacing - (pointsPerRibbon * spacing) / 2;
        for (let w = 0; w < ribbonWidth; w++) {
          const baseY = (w - ribbonWidth / 2) * 4;
          ribbon.push({
            x: baseX,
            y: baseY,
            z: 0,
            baseX,
            baseY,
            ribbonIndex: r,
          });
        }
      }
      ribbons.push(ribbon);
    }

    let rotationY = 0;
    let rotationX = 0;
    let wavePhase = 0;
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      lastX = e.offsetX;
      lastY = e.offsetY;
      canvas.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.offsetX - lastX;
      const deltaY = e.offsetY - lastY;
      rotationY += deltaX * 0.005;
      rotationX += deltaY * 0.005;
      rotationX = Math.max(-0.5, Math.min(0.5, rotationX));
      lastX = e.offsetX;
      lastY = e.offsetY;
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerUp);

    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const animate = () => {
      if (!isVisible) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      wavePhase += waveSpeed;

      // Auto-rotate when not dragging
      if (!isDragging) {
        rotationY += 0.002;
      }

      const time = performance.now();
      const autoTilt = Math.sin(time * 0.001) * 0.1;
      const totalRotationX = rotationX + autoTilt;

      for (let r = 0; r < ribbons.length; r++) {
        const ribbon = ribbons[r];
        const projectedPoints: { x: number; y: number; scale: number }[] = [];

        for (const point of ribbon) {
          const waveY =
            Math.sin(point.baseX * waveFrequency + wavePhase + r * 0.5) *
            waveAmplitude;
          let p = { x: point.x, y: point.baseY + waveY, z: point.z };
          p = rotateY(p, rotationY);
          p = rotateX(p, totalRotationX);
          const proj = project(p, width, height, 400, 400);
          projectedPoints.push(proj);
        }

        // Draw connecting lines first (behind points)
        ctx.strokeStyle = 'rgba(91, 141, 239, 0.08)';
        ctx.lineWidth = 0.5;

        for (let i = 0; i < pointsPerRibbon - 1; i++) {
          for (let w = 0; w < ribbonWidth; w++) {
            const idx = i * ribbonWidth + w;
            const nextIdx = (i + 1) * ribbonWidth + w;
            if (projectedPoints[idx] && projectedPoints[nextIdx]) {
              ctx.beginPath();
              ctx.moveTo(projectedPoints[idx].x, projectedPoints[idx].y);
              ctx.lineTo(projectedPoints[nextIdx].x, projectedPoints[nextIdx].y);
              ctx.stroke();
            }
          }
        }

        for (let i = 0; i < pointsPerRibbon; i++) {
          for (let w = 0; w < ribbonWidth - 1; w++) {
            const idx = i * ribbonWidth + w;
            const nextIdx = i * ribbonWidth + (w + 1);
            if (projectedPoints[idx] && projectedPoints[nextIdx]) {
              ctx.beginPath();
              ctx.moveTo(projectedPoints[idx].x, projectedPoints[idx].y);
              ctx.lineTo(projectedPoints[nextIdx].x, projectedPoints[nextIdx].y);
              ctx.stroke();
            }
          }
        }

        // Draw points
        for (const proj of projectedPoints) {
          const radius = Math.max(0.5, 1.5 * proj.scale);
          const alpha = 0.3 + 0.7 * proj.scale;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(91, 141, 239, ${alpha})`;
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerUp);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-10 py-24 md:py-32 flex flex-col items-center"
      style={{ minHeight: '100vh' }}
    >
      <div className="mt-16 md:mt-20 w-full flex justify-center px-4">
        <canvas
          ref={canvasRef}
          className="rounded-lg"
          style={{
            maxWidth: '100%',
            cursor: 'grab',
            touchAction: 'none',
          }}
        />
      </div>
    </section>
  );
}
