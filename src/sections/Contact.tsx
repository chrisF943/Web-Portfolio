import { useEffect, useRef, useState } from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';

export default function Contact() {
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

  const iconButtonClass =
    "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ease-out";

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative z-10 py-36 md:py-44 px-6"
    >
      <div
        className="max-w-xl mx-auto text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
        }}
      >
        <p
          className="text-xs uppercase tracking-widest mb-8"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            color: '#7A7A9E',
            letterSpacing: '0.2em',
          }}
        >
          LET'S CONNECT
        </p>

        <h2
          className="text-2xl md:text-4xl font-light leading-tight"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            color: '#E8E6F0',
          }}
        >
          Always willing to connect and chat.
        </h2>

        <p
          className="text-base mt-5"
          style={{
            fontFamily: "'Inter', sans-serif",
            color: '#7A7A9E',
          }}
        >
          Feel free to get in touch on any of my platforms. Whether it's about a project,
          an opportunity, or just to geek out about space and code.
        </p>

        <div className="flex justify-center gap-6 mt-10">
          <a
            href="https://www.linkedin.com/in/christopher-faris-58145328a/"
            target="_blank"
            rel="noopener noreferrer"
            className={iconButtonClass}
            style={{
              color: '#7A7A9E',
              background: 'transparent',
              border: '1px solid rgba(122, 122, 158, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#5B8DEF';
              e.currentTarget.style.borderColor = 'rgba(91, 141, 239, 0.5)';
              e.currentTarget.style.background = 'rgba(91, 141, 239, 0.08)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(91, 141, 239, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#7A7A9E';
              e.currentTarget.style.borderColor = 'rgba(122, 122, 158, 0.3)';
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Linkedin size={24} />
          </a>
          <a
            href="mailto:chris.faris@icloud.com"
            className={iconButtonClass}
            style={{
              color: '#7A7A9E',
              background: 'transparent',
              border: '1px solid rgba(122, 122, 158, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#5B8DEF';
              e.currentTarget.style.borderColor = 'rgba(91, 141, 239, 0.5)';
              e.currentTarget.style.background = 'rgba(91, 141, 239, 0.08)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(91, 141, 239, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#7A7A9E';
              e.currentTarget.style.borderColor = 'rgba(122, 122, 158, 0.3)';
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Mail size={24} />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className={iconButtonClass}
            style={{
              color: '#7A7A9E',
              background: 'transparent',
              border: '1px solid rgba(122, 122, 158, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#5B8DEF';
              e.currentTarget.style.borderColor = 'rgba(91, 141, 239, 0.5)';
              e.currentTarget.style.background = 'rgba(91, 141, 239, 0.08)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(91, 141, 239, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#7A7A9E';
              e.currentTarget.style.borderColor = 'rgba(122, 122, 158, 0.3)';
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Github size={24} />
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-xl mx-auto mt-24">
        <div
          className="w-full"
          style={{ borderTop: '1px solid rgba(122, 122, 158, 0.15)' }}
        />
        <p
          className="text-center mt-6 text-xs"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: 'rgba(122, 122, 158, 0.5)',
          }}
        >
          &copy; 2026 Christopher Faris &mdash; Built among the stars
        </p>
      </div>
    </section>
  );
}
