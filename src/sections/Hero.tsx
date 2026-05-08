import { useEffect, useState } from 'react';

export default function Hero() {
  const [loaded, setLoaded] = useState(false);
  const [scrollIndicatorVisible, setScrollIndicatorVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 200);

    const onScroll = () => {
      setScrollIndicatorVisible(window.scrollY < window.innerHeight * 0.5);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const anim = (delay: number) => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.6s ease-out ${delay}s, transform 0.6s ease-out ${delay}s`,
  });

  const animLarge = (delay: number) => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? 'translateY(0)' : 'translateY(30px)',
    transition: `opacity 0.8s ease-out ${delay}s, transform 0.8s ease-out ${delay}s`,
  });

  return (
    <section
      id="hero"
      className="relative z-10 flex flex-col items-center justify-center text-center px-6"
      style={{ minHeight: '100vh' }}
    >
      <div style={anim(0.2)}>
        <p
          className="text-sm uppercase tracking-widest mb-4"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            color: '#7A7A9E',
            letterSpacing: '0.2em',
          }}
        >
          Hello, I'm
        </p>
      </div>

      <h1
        className="text-5xl md:text-7xl font-normal leading-tight"
        style={{
          ...animLarge(0.4),
          fontFamily: "'Space Grotesk', sans-serif",
          color: '#E8E6F0',
          letterSpacing: '0.02em',
        }}
      >
        Christopher Faris
      </h1>

      <p
        className="text-lg md:text-xl mt-3 font-light"
        style={{
          ...anim(0.6),
          fontFamily: "'Inter', sans-serif",
          color: '#5B8DEF',
        }}
      >
        Orlando, FL based Data Engineer
      </p>

      <p
        className="text-base mt-6 max-w-xl mx-auto leading-relaxed"
        style={{
          ...anim(0.8),
          fontFamily: "'Inter', sans-serif",
          color: '#7A7A9E',
          lineHeight: 1.7,
        }}
      >
        Currently working on the infrastructure that moves, transforms, and surfaces data across a real estate company's entire operation — from Azure Data Factory pipelines and SQL warehouses to internal monitoring apps built in Node and React. I care about building things that are reliable, well-architected, and actually useful to the people depending on them.
      </p>

      <div
        className="flex flex-col sm:flex-row items-center gap-4 mt-9"
        style={{
          ...anim(1.0),
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'translateY(0)' : 'translateY(15px)',
          transition: 'opacity 0.5s ease-out 1.0s, transform 0.5s ease-out 1.0s',
        }}
      >
        <a
          href="#projects"
          className="px-7 py-3.5 rounded-lg text-sm font-medium uppercase tracking-widest transition-all duration-300"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            background: '#5B8DEF',
            color: '#080812',
            letterSpacing: '0.1em',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#7AA5FF';
            e.currentTarget.style.boxShadow = '0 0 24px rgba(91, 141, 239, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#5B8DEF';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          View My Work
        </a>
        <a
          href="#contact"
          className="px-7 py-3.5 rounded-lg text-sm font-medium uppercase tracking-widest transition-all duration-300 border"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            background: 'transparent',
            borderColor: 'rgba(122, 122, 158, 0.4)',
            color: '#7A7A9E',
            letterSpacing: '0.1em',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#5B8DEF';
            e.currentTarget.style.color = '#5B8DEF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(122, 122, 158, 0.4)';
            e.currentTarget.style.color = '#7A7A9E';
          }}
        >
          Get in Touch
        </a>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center"
        style={{
          opacity: loaded && scrollIndicatorVisible ? 1 : 0,
          transition: 'opacity 0.6s ease-out 1.4s',
          pointerEvents: 'none',
        }}
      >
        <div
          className="w-px h-10 relative overflow-hidden"
          style={{ background: 'rgba(122, 122, 158, 0.3)' }}
        >
          <div
            className="w-1 h-1 rounded-full absolute left-1/2 -translate-x-1/2"
            style={{
              background: '#5B8DEF',
              boxShadow: '0 0 6px rgba(91, 141, 239, 0.6)',
              animation: 'scrollDot 2s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes scrollDot {
          0% { top: 0; opacity: 1; }
          80% { top: 36px; opacity: 0.3; }
          100% { top: 40px; opacity: 0; }
        }
      `}</style>
    </section>
  );
}
