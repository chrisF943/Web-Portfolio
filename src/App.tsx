import Starfield from './components/Starfield';
import Header from './sections/Header';
import Hero from './sections/Hero';
import Projects from './sections/Projects';
import RibbonWave from './sections/RibbonWave';
import Contact from './sections/Contact';

export default function App() {
  return (
    <div className="relative min-h-screen" style={{ background: '#080812' }}>
      <Starfield />
      <Header />
      <main className="relative z-10">
        <Hero />
        <Projects />
        <RibbonWave />
        <Contact />
      </main>
    </div>
  );
}
