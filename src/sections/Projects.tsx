import { useEffect, useRef, useState, useCallback } from 'react';

interface Project {
  title: string;
  description: string;
  link: string;
  tags: string[];
  gradient: string;
}

const PROJECTS: Project[] = [
  {
    title: 'PyShip',
    description: 'A retro battle game built with Python. Navigate ships, engage in tactical combat, and test your strategic abilities in this classic arcade-style game.',
    link: 'https://github.com/chrisF943/PyShip',
    tags: ['Python', 'Game'],
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  },
  {
    title: 'fern - Password Manager',
    description: 'Securely stores passwords locally using SQLite and cryptographic encryption. Features a Tkinter GUI with SQLAlchemy ORM for easy database operations.',
    link: 'https://github.com/chrisF943/fern-password-manager',
    tags: ['Python', 'SQLite', 'Security'],
    gradient: 'linear-gradient(135deg, #0f3460 0%, #1a1a2e 100%)',
  },
  {
    title: 'Gemini-Python-Tips',
    description: 'Uses Google Gemini API to learn new tips for being a better Python developer, sent right to your inbox in a neat email.',
    link: 'https://github.com/chrisF943/Gemini-Python-Tips',
    tags: ['Python', 'AI', 'API'],
    gradient: 'linear-gradient(135deg, #16213e 0%, #0f3460 100%)',
  },
  {
    title: 'Seminar-Project',
    description: 'Automated data collection via API and PythonAnywhere. Visualized data with Pandas and Matplotlib, analyzed trends and comprised a report of findings.',
    link: 'https://github.com/chrisF943/Seminar-Project',
    tags: ['Python', 'Data Analysis', 'APIs'],
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #1a1a2e 50%, #0f3460 100%)',
  },
  {
    title: 'CEN4802',
    description: 'Jenkins CI/CD pipeline with Maven, Docker, DataDog monitoring, and automated testing frameworks for seamless development workflows.',
    link: 'https://github.com/chrisF943/CEN4802',
    tags: ['Maven', 'Jenkins', 'Docker'],
    gradient: 'linear-gradient(135deg, #16213e 0%, #1a1a2e 100%)',
  },
  {
    title: 'Python-Hashing',
    description: 'Hash table implementation in Python for storing Orlando bus stop data from JSON with linear probing. Performance tested against dictionaries.',
    link: 'https://github.com/chrisF943/Python-Hashing',
    tags: ['Python', 'Data Structures', 'JSON'],
    gradient: 'linear-gradient(135deg, #0f3460 0%, #16213e 100%)',
  },
  {
    title: 'Pdf-Agent',
    description: 'A Python project focused on PDF processing and agent-based automation. Manipulate, extract, and process PDF documents with intelligent automation.',
    link: 'https://github.com/chrisF943/Pdf-Agent',
    tags: ['Python', 'Automation'],
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
  },
  {
    title: 'Folder_tree',
    description: 'A Java project for managing and visualizing folder structures. Build, navigate, and analyze directory trees with ease.',
    link: 'https://github.com/chrisF943/Folder_tree',
    tags: ['Java', 'File System'],
    gradient: 'linear-gradient(135deg, #16213e 0%, #0f3460 100%)',
  },
];

const N = PROJECTS.length;
const THETA = 360 / N;
const RADIUS = 520;

export default function Projects() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartAngleRef = useRef(0);
  const dragStartXRef = useRef(0);
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animFrameRef = useRef<number>(0);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Intersection observer for entrance
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

  const snapToNearest = useCallback((angle: number) => {
    return Math.round(angle / THETA) * THETA;
  }, []);

  // Auto-rotation and inertia animation loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.67, 3); // normalize to ~60fps, cap at 3x
      lastTime = time;

      setCurrentAngle((prev) => {
        if (!isDragging) {
          // Apply inertia
          if (Math.abs(velocityRef.current) > 0.5) {
            velocityRef.current *= 0.92;
            const newAngle = prev + velocityRef.current * dt;
            return newAngle;
          } else {
            velocityRef.current = 0;
            // Auto-rotate slowly
            return prev + 0.1 * dt;
          }
        }
        return prev;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isDragging]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    dragStartAngleRef.current = currentAngle;
    velocityRef.current = 0;
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [currentAngle]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartXRef.current;
    velocityRef.current = (e.clientX - lastXRef.current) * 0.3;
    lastXRef.current = e.clientX;
    setCurrentAngle(dragStartAngleRef.current + deltaX * 0.3);
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    // After inertia settles, we could snap, but let's let inertia play out
    idleTimerRef.current = setTimeout(() => {
      // Snap to nearest card when fully idle
      setCurrentAngle((prev) => {
        const snapped = snapToNearest(prev);
        return snapped;
      });
    }, 2000);
  }, [snapToNearest]);

  const activeIndex = Math.round((-currentAngle % 360 + 360) % 360 / THETA) % N;

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative z-10 py-32 md:py-44"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
      }}
    >
      <p
        className="text-xs uppercase tracking-widest text-center mb-12"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          color: '#7A7A9E',
          letterSpacing: '0.2em',
        }}
      >
        SELECTED WORK
      </p>

      <div
        ref={containerRef}
        className="relative mx-auto"
        style={{
          perspective: '1200px',
          width: '100%',
          height: '520px',
          overflow: 'visible',
          touchAction: 'none',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div
          className="absolute top-1/2 left-1/2"
          style={{
            transformStyle: 'preserve-3d',
            WebkitTransformStyle: 'preserve-3d',
            transform: `rotateY(${currentAngle}deg)`,
            width: 0,
            height: 0,
            transition: isDragging ? 'none' : 'transform 0.1s linear',
          }}
        >
          {PROJECTS.map((project, i) => {
            const cardAngle = (i * THETA + currentAngle) % 360;
            const normalizedAngle = ((cardAngle + 180) % 360) - 180;
            const frontness = Math.cos((normalizedAngle * Math.PI) / 180);
            const opacity = 0.3 + 0.7 * ((frontness + 1) / 2);
            const scale = 0.85 + 0.15 * ((frontness + 1) / 2);
            const blur = frontness < 0.8 ? 1.5 * (1 - frontness) : 0;

            return (
              <div
                key={i}
                className="absolute rounded-2xl overflow-hidden"
                style={{
                  width: '340px',
                  height: '420px',
                  top: '-210px',
                  left: '-170px',
                  transformOrigin: 'center center',
                  transform: `rotateY(${i * THETA}deg) translateZ(${RADIUS}px)`,
                  opacity,
                  filter: blur > 0.5 ? `blur(${blur}px)` : 'none',
                  scale: `${scale}`,
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  pointerEvents: frontness > 0.8 ? 'auto' : 'none',
                }}
              >
                {/* Image area */}
                <div
                  className="w-full h-[200px]"
                  style={{ background: project.gradient }}
                />

                {/* Text area */}
                <div className="p-6">
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xl font-medium mb-2 transition-colors duration-300 hover:text-[#5B8DEF]"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      color: '#E8E6F0',
                    }}
                  >
                    {project.title}
                  </a>
                  <p
                    className="text-sm leading-relaxed mb-4 line-clamp-2"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      color: '#7A7A9E',
                      lineHeight: 1.6,
                    }}
                  >
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2.5 py-1 rounded"
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '11px',
                          fontWeight: 400,
                          color: '#5B8DEF',
                          background: 'rgba(91, 141, 239, 0.08)',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center gap-3 mt-10">
        {PROJECTS.map((_, i) => (
          <button
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: activeIndex === i ? 10 : 8,
              height: activeIndex === i ? 10 : 8,
              background: activeIndex === i ? '#5B8DEF' : 'rgba(122, 122, 158, 0.3)',
              transform: activeIndex === i ? 'scale(1.2)' : 'scale(1)',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={() => {
              const targetAngle = -i * THETA;
              setCurrentAngle(targetAngle);
            }}
            aria-label={`Go to project ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
