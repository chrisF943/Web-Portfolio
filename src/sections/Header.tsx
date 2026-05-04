import { useEffect, useRef, useState } from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Entrance animation
    const timer = setTimeout(() => setVisible(true), 100);

    const onScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const iconButtonClass =
    "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ease-out";

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 md:px-10 transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-12px)',
        background: scrolled ? 'rgba(8, 8, 18, 0.7)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
      }}
    >
      <div
        className="text-sm font-medium tracking-widest"
        style={{ fontFamily: "'JetBrains Mono', monospace", color: '#7A7A9E' }}
      >
        STELLAR.DEV
      </div>

      <div className="flex items-center gap-3">
        <a
          href="https://www.linkedin.com/in/christopher-faris-58145328a/"
          target="_blank"
          rel="noopener noreferrer"
          className={iconButtonClass}
          style={{
            color: '#7A7A9E',
            background: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#5B8DEF';
            e.currentTarget.style.background = 'rgba(91, 141, 239, 0.1)';
            e.currentTarget.style.boxShadow = '0 0 16px rgba(91, 141, 239, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#7A7A9E';
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Linkedin size={20} />
        </a>
        <a
          href="mailto:chris.faris@icloud.com"
          className={iconButtonClass}
          style={{
            color: '#7A7A9E',
            background: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#5B8DEF';
            e.currentTarget.style.background = 'rgba(91, 141, 239, 0.1)';
            e.currentTarget.style.boxShadow = '0 0 16px rgba(91, 141, 239, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#7A7A9E';
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Mail size={20} />
        </a>
        <a
          href="https://github.com/chrisF943"
          target="_blank"
          rel="noopener noreferrer"
          className={iconButtonClass}
          style={{
            color: '#7A7A9E',
            background: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#5B8DEF';
            e.currentTarget.style.background = 'rgba(91, 141, 239, 0.1)';
            e.currentTarget.style.boxShadow = '0 0 16px rgba(91, 141, 239, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#7A7A9E';
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Github size={20} />
        </a>
      </div>
    </header>
  );
}
