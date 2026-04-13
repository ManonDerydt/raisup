import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu, X, ArrowRight, Check, Sparkles, Target, Zap, Users,
  Linkedin, Instagram, ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';

// ─── Hook: fade-in au scroll ──────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ─── Animated section wrapper ─────────────────────────────────────────────────
const FadeUp: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children, delay = 0, className,
}) => {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={clsx(
        'transition-all duration-700',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// ─── Animated Score Circle ────────────────────────────────────────────────────
const AnimatedScore: React.FC = () => {
  const { ref, visible } = useInView(0.3);
  const [score, setScore] = useState(0);
  const target = 74;
  const radius = 80;
  const circ = 2 * Math.PI * radius;

  useEffect(() => {
    if (!visible) return;
    let frame: number;
    const start = performance.now();
    const duration = 1400;
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setScore(Math.round(ease * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [visible]);

  const offset = circ - (score / 100) * circ;

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center w-52 h-52">
        <svg className="-rotate-90" width="208" height="208">
          <circle cx="104" cy="104" r={radius} fill="none" stroke="rgba(244,184,204,0.2)" strokeWidth="16" />
          <circle
            cx="104" cy="104" r={radius} fill="none"
            stroke="#F4B8CC" strokeWidth="16"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-5xl font-black text-white">{score}</span>
          <span className="text-sm text-gray-400">/100</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mt-8 w-full max-w-lg">
        {[
          { label: 'Pitch', value: 18 },
          { label: 'Traction', value: 20 },
          { label: 'Équipe', value: 19 },
          { label: 'Marché', value: 17 },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center gap-2">
            <span className="text-white font-bold text-lg">{visible ? value : 0}<span className="text-gray-500 text-sm font-normal">/25</span></span>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-rose-accent transition-all duration-1000"
                style={{ width: visible ? `${(value / 25) * 100}%` : '0%', transitionDelay: '400ms' }}
              />
            </div>
            <span className="text-gray-400 text-xs">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const HomePage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── NAVBAR ── */}
      <header className={clsx(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled ? 'bg-white border-b border-gray-100 shadow-sm' : 'bg-transparent',
      )}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <img
            src="/raisup_logo.png"
            alt="RAISUP"
            className={clsx('h-12 w-auto transition-all duration-300', !scrolled && 'brightness-0 invert')}
          />

          <nav className="hidden md:flex items-center gap-8">
            {['Produit', 'Tarifs', 'Comment ça marche'].map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase().replace(/\s/g, '-')}`}
                className={clsx(
                  'text-sm font-medium transition-colors',
                  scrolled ? 'text-gray-600 hover:text-primary' : 'text-white/80 hover:text-white',
                )}
              >
                {label}
              </a>
            ))}
          </nav>

          <Link
            to="/register"
            className="hidden md:inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary text-white text-sm font-semibold hover:bg-opacity-80 transition-colors"
          >
            Candidater
          </Link>

          <button
            className={clsx('md:hidden p-2', scrolled ? 'text-primary' : 'text-white')}
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white md:hidden flex flex-col">
          <div className="flex items-center justify-between px-6 h-16 border-b border-gray-100">
            <img src="/raisup_logo.png" alt="RAISUP" className="h-12 w-auto" />
            <button onClick={() => setMobileMenuOpen(false)}><X className="h-6 w-6 text-primary" /></button>
          </div>
          <nav className="flex flex-col gap-6 px-6 py-10">
            {['Produit', 'Tarifs', 'Comment ça marche'].map((label) => (
              <a
                key={label}
                href="#"
                className="text-lg font-medium text-gray-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                {label}
              </a>
            ))}
            <Link
              to="/register"
              className="mt-4 inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary text-white font-semibold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Candidater
            </Link>
          </nav>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="bg-hero-bg min-h-screen flex items-center pt-16">
        <div className="max-w-7xl mx-auto px-6 py-24 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <h1 className="text-[clamp(48px,6vw,72px)] font-black leading-tight tracking-tight text-white mb-6">
              Lève des fonds<br />
              <span className="text-rose-accent italic">rapidement.</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-md leading-relaxed">
              Ton copilote IA pour lever des fonds : analyse, documents financiers et matching investisseurs.
            </p>
            <ul className="space-y-3 mb-10">
              {[
                ['Analyse IA complète', 'de ton potentiel de levée'],
                ['Documents financiers', 'générés en quelques clics'],
                ['Matching intelligent', 'avec les bons investisseurs'],
              ].map(([bold, rest]) => (
                <li key={bold} className="flex items-center gap-3 text-sm text-gray-300">
                  <ChevronRight className="h-4 w-4 text-rose-accent flex-shrink-0" />
                  <span><strong className="text-white">{bold}</strong> {rest}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#comment-ça-marche"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white text-white text-sm font-semibold hover:bg-white hover:text-primary transition-colors"
              >
                Je veux en savoir plus <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-primary text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Je candidate
              </Link>
            </div>
          </div>

          {/* Right — video mockup */}
          <div className="w-full aspect-video rounded-2xl overflow-hidden relative" style={{ background: '#0F1B2D' }}>
            <div className="absolute top-4 left-4">
              <button className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20 hover:bg-white/20 transition-colors">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Play with sound
              </button>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="h-7 w-7 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-white/50 text-sm">Découvrez Raisup en 2 min</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="produit" className="bg-white py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[
              {
                icon: Sparkles,
                iconBg: 'bg-blue-100',
                iconColor: 'text-blue-600',
                title: 'Analyse IA de ton potentiel',
                desc: 'Un score sur 100 qui évalue ton dossier en temps réel selon 4 axes clés.',
                checks: ['Score Raisup personnalisé', 'Recommandations actionnables'],
              },
              {
                icon: Target,
                iconBg: 'bg-pink-100',
                iconColor: 'text-pink-500',
                title: 'Matching investisseurs intelligent',
                desc: 'Trouve les investisseurs les plus alignés avec ton projet grâce à notre algorithme.',
                checks: ['Base de 200+ investisseurs', 'Filtrage par secteur et stade'],
              },
              {
                icon: Zap,
                iconBg: 'bg-violet-100',
                iconColor: 'text-violet-600',
                title: 'Documents générés en un clic',
                desc: "Pitch deck, business plan, executive summary — rédigés par l'IA en quelques secondes.",
                checks: ['Export PDF professionnel', 'Personnalisé à ton profil'],
              },
              {
                icon: Users,
                iconBg: 'bg-orange-100',
                iconColor: 'text-orange-500',
                title: 'Accompagnement humain premium',
                desc: "Une équipe d'experts disponible pour t'accompagner à chaque étape de ta levée.",
                checks: ['Accès à des mentors sectoriels', 'Suivi personnalisé du pipeline'],
              },
            ].map(({ icon: Icon, iconBg, iconColor, title, desc, checks }, i) => (
              <FadeUp key={title} delay={i * 100}>
                <div className="rounded-2xl border border-gray-100 p-8 hover:shadow-md transition-shadow" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                  <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center mb-5', iconBg)}>
                    <Icon className={clsx('h-6 w-6', iconColor)} />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-5">{desc}</p>
                  <ul className="space-y-2">
                    {checks.map((c) => (
                      <li key={c} className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="h-4 w-4 text-rose-accent flex-shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCORE ── */}
      <section className="bg-hero-bg py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <FadeUp>
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-rose-accent mb-4">Score</span>
            <h2 className="text-4xl font-black text-white mb-3">Votre score Raisup</h2>
            <p className="text-gray-400 mb-14">Un indicateur sur 100 qui évalue votre dossier en temps réel</p>
          </FadeUp>
          <AnimatedScore />
          <FadeUp delay={600} className="mt-12">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white text-primary text-sm font-bold hover:bg-gray-100 transition-colors"
            >
              Calculer mon score <ArrowRight className="h-4 w-4" />
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="comment-ça-marche" className="bg-white py-28">
        <div className="max-w-7xl mx-auto px-6">
          <FadeUp className="text-center mb-16">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-rose-accent bg-pink-50 px-3 py-1 rounded-full mb-4">Comment ça marche</span>
            <h2 className="text-4xl font-black text-primary">De l'onboarding au closing en 6 étapes</h2>
          </FadeUp>

          {/* Desktop timeline */}
          <div className="hidden lg:flex items-start gap-0">
            {[
              { n: '01', title: 'Onboarding', desc: 'Crée ton profil startup en 5 minutes.' },
              { n: '02', title: 'Génération docs', desc: 'Pitch deck et business plan générés par l\'IA.' },
              { n: '03', title: 'Matching', desc: 'Trouve les investisseurs alignés avec ton projet.' },
              { n: '04', title: 'Postulation', desc: 'Envoie ta candidature en un clic.' },
              { n: '05', title: 'Suivi pipeline', desc: 'Suis l\'avancement de chaque dossier.' },
              { n: '06', title: 'Closing', desc: 'Finalise ta levée avec l\'aide de nos experts.' },
            ].map(({ n, title, desc }, i, arr) => (
              <div key={n} className="flex-1 flex flex-col items-center text-center relative">
                {i < arr.length - 1 && (
                  <div className="absolute top-5 left-1/2 w-full h-0.5 bg-gray-100" style={{ zIndex: 0 }} />
                )}
                <FadeUp delay={i * 80} className="flex flex-col items-center relative z-10">
                  <div className="w-10 h-10 rounded-full bg-rose-accent flex items-center justify-center text-white text-xs font-black mb-4">
                    {n}
                  </div>
                  <h3 className="font-bold text-primary text-sm mb-1">{title}</h3>
                  <p className="text-gray-400 text-xs leading-snug px-2">{desc}</p>
                </FadeUp>
              </div>
            ))}
          </div>

          {/* Mobile timeline */}
          <div className="lg:hidden space-y-0">
            {[
              { n: '01', title: 'Onboarding', desc: 'Crée ton profil startup en 5 minutes.' },
              { n: '02', title: 'Génération docs', desc: 'Pitch deck et business plan générés par l\'IA.' },
              { n: '03', title: 'Matching', desc: 'Trouve les investisseurs alignés avec ton projet.' },
              { n: '04', title: 'Postulation', desc: 'Envoie ta candidature en un clic.' },
              { n: '05', title: 'Suivi pipeline', desc: 'Suis l\'avancement de chaque dossier.' },
              { n: '06', title: 'Closing', desc: 'Finalise ta levée avec l\'aide de nos experts.' },
            ].map(({ n, title, desc }, i, arr) => (
              <div key={n} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-rose-accent flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                    {n}
                  </div>
                  {i < arr.length - 1 && <div className="w-0.5 flex-1 bg-gray-100 my-2" />}
                </div>
                <FadeUp delay={i * 80} className="pb-8">
                  <h3 className="font-bold text-primary mb-1">{title}</h3>
                  <p className="text-gray-400 text-sm">{desc}</p>
                </FadeUp>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-testimonial-bg py-28">
        <div className="max-w-7xl mx-auto px-6">
          <FadeUp className="text-center mb-14">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-rose-accent bg-pink-50 px-3 py-1 rounded-full mb-4">Ils nous font confiance</span>
            <h2 className="text-4xl font-black text-primary">Ce que disent nos fondateurs</h2>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                initials: 'SL', name: 'Sarah Lambert', startup: 'MedFlow', sector: 'HealthTech',
                quote: 'En 3 semaines, Raisup nous a aidé à structurer notre dossier et à identifier les bons investisseurs. Nous avons signé une term sheet 6 semaines après.',
              },
              {
                initials: 'TM', name: 'Thomas Martin', startup: 'EcoStack', sector: 'GreenTech',
                quote: 'Le score Raisup nous a montré exactement où améliorer notre pitch. Les documents générés par l\'IA nous ont économisé des semaines de travail.',
              },
              {
                initials: 'AC', name: 'Amina Cherif', startup: 'FlowOps', sector: 'SaaS B2B',
                quote: 'Le matching investisseur est bluffant. En quelques clics, on a trouvé 8 fonds vraiment alignés avec notre vision. 2 d\'entre eux sont en DD actuellement.',
              },
            ].map(({ initials, name, startup, sector, quote }, i) => (
              <FadeUp key={name} delay={i * 100}>
                <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-full bg-rose-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold text-primary text-sm">{name}</p>
                      <p className="text-gray-400 text-xs">{startup} · {sector}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed flex-1">"{quote}"</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="bg-cta-bg py-32">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <FadeUp>
            <span className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-6 block">Contact</span>
            <h2 className="text-5xl font-black text-primary mb-4">Envie d'en savoir plus ?</h2>
            <p className="text-gray-600 text-lg mb-10">
              Pose-nous tes questions ou reste informé de nos actualités
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-primary text-white font-semibold hover:bg-opacity-80 transition-colors"
              >
                Rejoindre le programme Pioneer <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#produit"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-colors"
              >
                En savoir plus
              </a>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-hero-bg py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-white/10">
            {/* Brand */}
            <div>
              <img src="/raisup_logo_white.png" alt="RAISUP" className="h-12 w-auto mb-4" />
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                L'accélérateur des startups ambitieuses.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-rose-accent"
                />
                <button className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0">
                  <ArrowRight className="h-4 w-4 text-primary" />
                </button>
              </div>
            </div>

            {/* Contact */}
            <div>
              <p className="text-white font-semibold text-sm mb-4">Contact</p>
              <a href="mailto:contact@raisup.co" className="text-gray-400 text-sm hover:text-white transition-colors">
                contact@raisup.co
              </a>
            </div>

            {/* Social */}
            <div>
              <p className="text-white font-semibold text-sm mb-4">Suivez-nous</p>
              <div className="flex gap-3">
                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-colors"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs">© 2025 Raisup. Tous droits réservés.</p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-500 text-xs hover:text-gray-300 transition-colors">Mentions légales</a>
              <a href="#" className="text-gray-500 text-xs hover:text-gray-300 transition-colors">Confidentialité</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;
