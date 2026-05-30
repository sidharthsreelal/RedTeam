'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MODES } from '@/lib/modes';
import dynamic from 'next/dynamic';

const FaultyTerminal = dynamic(() => import('./FaultyTerminal'), { ssr: false });

/* --- Mode display data --- */
const MODE_ICONS: Record<string, string> = {
  'stress-test':      '\u29C7',
  'ooda-loop':        '\u25CE',
  'first-principles': '\u2B21',
  'inversion':        '\u21BB',
  'temporal':          '\u25F7',
  'brainstorm':       '\u260D',
  'chat':             '\u25D0',
};

const MODE_LABELS: Record<string, string> = {
  'stress-test':      '6 AGENTS \u00B7 ADVERSARIAL \u00B7 PARALLEL',
  'ooda-loop':        '4 AGENTS \u00B7 STRATEGIC \u00B7 SEQUENTIAL',
  'first-principles': '5 AGENTS \u00B7 ANALYTICAL \u00B7 PARALLEL',
  'inversion':        '4 AGENTS \u00B7 CONTRARIAN \u00B7 PARALLEL',
  'temporal':         '5 AGENTS \u00B7 TEMPORAL \u00B7 PARALLEL',
  'brainstorm':       '6 AGENTS \u00B7 GENERATIVE \u00B7 PARALLEL',
  'chat':             'DIRECT \u00B7 ONE NODE \u00B7 CONTINUOUS',
};


const FAQ_ITEMS = [
  {
    q: "How does the parallel agent system work?",
    a: "RedTeam deploys up to 6 separate AI agents built on optimized system prompts. Each agent is locked to a specific analytical mode (like Devil's Advocate or Pre-Mortem) and works independently. A final synthesis agent compiles their critical feedback to highlight pivots and action items."
  },
  {
    q: "Can I upload proprietary business documents?",
    a: "Yes. You can ground your sessions by uploading PDFs, Word documents, or text files. All parsing happens directly in your browser client. Your documents are session-scoped and never stored on our servers or used for model training."
  },
  {
    q: "Which AI models power the stress tests?",
    a: "We run on a multi-provider backend utilizing Mistral (mistral-small, mistral-medium) and Gemini (gemini-1.5-pro, gemini-1.5-flash). RedTeam features automated fallback: if one provider encounters rate limits or network lag, the session seamlessly completes on the other."
  },
  {
    q: "How does session memory work?",
    a: "At the end of each round, a background task automatically generates a structured memory summary (goals, assumptions, critical vulnerabilities). This context is automatically injected into subsequent rounds so the agents keep building on your progress."
  }
];

const PRESETS = [
  {
    name: 'AI B2B SaaS',
    input: "An AI SaaS that automates competitive intelligence for B2B startups by monitoring social signals, product updates, and pricing shifts.",
    frameworks: [
      { label: 'FRAMEWORK 01', title: "Devil's Advocate", accent: '#EF4444', content: "Assumes competitor data is clean, open, and legally scrapable. Monitored sites will block your IPs, and startups don't update pricing frequently enough." },
      { label: 'FRAMEWORK 02', title: "Pre-Mortem", accent: '#F97316', content: "Fails because B2B founders already know who their competitors are. They need sales execution support, not more dashboard metrics." },
      { label: 'FRAMEWORK 03', title: "Steel Man", accent: '#8B1A1A', content: "At best, this solves a critical investor-reporting pain point. It transforms chaotic external data into board-ready landscape reports." },
      { label: 'FRAMEWORK 04', title: "Second-Order", accent: '#8B5CF6', content: "A competitor tracking system creates a hyper-focus on rival roadmaps, forcing the startup into a reactive feature-war loop." },
      { label: 'FRAMEWORK 05', title: "Blind Spot Detector", accent: '#F59E0B', content: "Ignores the fact that the most valuable competitive intel is private (sales decks, close-lost reasons), which scrapers cannot reach." },
      { label: 'FRAMEWORK 06', title: "Base Rate Check", accent: '#10B981', content: "Roughly 85% of early-stage SaaS pricing adjustments fail because founders lack the statistical volume to run price-elasticity tests." }
    ],
    synthesis: "VERDICT: PIVOT — Shift from general tracking to a sales enablement tool: alert reps when a competitor changes pricing, and generate a battlecard for active deals."
  },
  {
    name: 'Micro-Schools Pods',
    input: "A software-enabled franchise network of hyper-local micro-schools for K-5 kids, operating out of residential neighborhood pods.",
    frameworks: [
      { label: 'FRAMEWORK 01', title: "Devil's Advocate", accent: '#EF4444', content: "Disregards zoning regulations, safety compliance, and insurance liabilities of running schools in residential homes. Overhead will crush margins." },
      { label: 'FRAMEWORK 02', title: "Pre-Mortem", accent: '#F97316', content: "Parents love the idea until a teacher leaves. A single bad hire or teacher departure shuts down the school and leaves parents stranded." },
      { label: 'FRAMEWORK 03', title: "Steel Man", accent: '#8B1A1A', content: "Creates a highly personalized learning environment with extremely low overhead. Bypasses bureaucracy and puts capital directly into teacher pay." },
      { label: 'FRAMEWORK 04', title: "Second-Order", accent: '#8B5CF6', content: "Hyper-local schools pull top students from public schools, draining public funding and provoking severe local teacher-union pushback." },
      { label: 'FRAMEWORK 05', title: "Blind Spot Detector", accent: '#F59E0B', content: "Misses the socialization bottleneck. K-5 kids need large group play, sports leagues, and diverse social circles that a 5-kid pod cannot provide." },
      { label: 'FRAMEWORK 06', title: "Base Rate Check", accent: '#10B981', content: "Historically, over 70% of alternative schooling franchises fail to scale past 3 locations due to localized parent churn and teacher bottlenecks." }
    ],
    synthesis: "VERDICT: STRENGTHEN — Partner with community centers for physical education and social events. Focus software on tracking compliance and background checks."
  },
  {
    name: 'Web3 Creator Platform',
    input: "A decentralized patronage platform where fans buy fractional ownership of a creator's future ad-revenue streams.",
    frameworks: [
      { label: 'FRAMEWORK 01', title: "Devil's Advocate", accent: '#EF4444', content: "Treats ad-revenue splits as utility tokens when they are securitized cash flows. SEC regulations will classify this as an unregistered security." },
      { label: 'FRAMEWORK 02', title: "Pre-Mortem", accent: '#F97316', content: "Creators drop out. If a creator goes on hiatus or gets canceled, the value of their tokens collapses, leaving fans angry and creators facing lawsuits." },
      { label: 'FRAMEWORK 03', title: "Steel Man", accent: '#8B1A1A', content: "Solves the creator funding gap by letting fans bootstrap creative careers without middle-men, aligning fan financial incentives with growth." },
      { label: 'FRAMEWORK 04', title: "Second-Order", accent: '#8B5CF6', content: "Fans-turned-investors demand direct product input, turning creative decisions into consensus committee votes and crushing the creator's vision." },
      { label: 'FRAMEWORK 05', title: "Blind Spot Detector", accent: '#F59E0B', content: "Underestimates the complexity of fractional payouts. Payout processing fees on small monthly splits will eat up all of the fans' returns." },
      { label: 'FRAMEWORK 06', title: "Base Rate Check", accent: '#10B981', content: "Roughly 92% of creator-token platforms fail within 12 months as initial speculative hype fades, leaving fans with illiquid, worthless assets." }
    ],
    synthesis: "VERDICT: PIVOT — Reframe from financial splits to access-based membership tiers using digital collectibles. Bypasses security laws while keeping fan alignment."
  }
];

/* --- Scroll reveal --- */
function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Section({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  const { ref, visible } = useScrollReveal();
  return (
    <section ref={ref} id={id} className={`lp-section ${visible ? 'lp-visible' : ''} ${className}`}>
      {children}
    </section>
  );
}

/* --- Interactive Canvas Demo --- */
function CanvasDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<HTMLDivElement>(null);
  const fwRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  const [activeIdea, setActiveIdea] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'typing-input' | 'streaming-frameworks' | 'synthesis' | 'done'>('idle');
  const [isVisible, setIsVisible] = useState(false);

  const [inputProgress, setInputProgress] = useState(0);
  const [fwProgress, setFwProgress] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [synthProgress, setSynthProgress] = useState(0);

  const [coords, setCoords] = useState<{
    inputBottom: { x: number; y: number } | null;
    fwTops: { x: number; y: number }[];
    fwBottoms: { x: number; y: number }[];
    synthTop: { x: number; y: number } | null;
  }>({
    inputBottom: null,
    fwTops: [],
    fwBottoms: [],
    synthTop: null,
  });

  const updateCoords = useCallback(() => {
    const container = containerRef.current;
    const input = inputRef.current;
    const synth = synthRef.current;
    if (!container || !input || !synth) return;

    const containerRect = container.getBoundingClientRect();
    const inputRect = input.getBoundingClientRect();
    const synthRect = synth.getBoundingClientRect();

    const inputBottom = {
      x: inputRect.left - containerRect.left + inputRect.width / 2,
      y: inputRect.bottom - containerRect.top,
    };

    const synthTop = {
      x: synthRect.left - containerRect.left + synthRect.width / 2,
      y: synthRect.top - containerRect.top,
    };

    const fwTops = fwRefs.map(ref => {
      const el = ref.current;
      if (!el) return { x: 0, y: 0 };
      const r = el.getBoundingClientRect();
      return {
        x: r.left - containerRect.left + r.width / 2,
        y: r.top - containerRect.top,
      };
    });

    const fwBottoms = fwRefs.map(ref => {
      const el = ref.current;
      if (!el) return { x: 0, y: 0 };
      const r = el.getBoundingClientRect();
      return {
        x: r.left - containerRect.left + r.width / 2,
        y: r.bottom - containerRect.top,
      };
    });

    setCoords({ inputBottom, fwTops, fwBottoms, synthTop });
  }, []);

  // Intersection observer to start typing simulation when scrolled into view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setIsVisible(true);
        io.disconnect();
      }
    }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && phase === 'idle') {
      setPhase('typing-input');
    }
  }, [isVisible, phase]);

  // Coordinate update layout trigger
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    updateCoords();

    const t = setTimeout(updateCoords, 150);
    const observer = new ResizeObserver(() => updateCoords());
    observer.observe(container);

    window.addEventListener('resize', updateCoords);
    return () => {
      clearTimeout(t);
      observer.disconnect();
      window.removeEventListener('resize', updateCoords);
    };
  }, [updateCoords, phase, activeIdea]);

  // Typing simulation state machine
  useEffect(() => {
    if (phase === 'idle') return;

    let timer: ReturnType<typeof setInterval>;

    if (phase === 'typing-input') {
      const text = PRESETS[activeIdea].input;
      timer = setInterval(() => {
        setInputProgress(prev => {
          if (prev >= text.length) {
            clearInterval(timer);
            setPhase('streaming-frameworks');
            return text.length;
          }
          return prev + Math.ceil(Math.random() * 2) + 1;
        });
      }, 30);
    } else if (phase === 'streaming-frameworks') {
      const frameworks = PRESETS[activeIdea].frameworks;
      timer = setInterval(() => {
        setFwProgress(prev => {
          const next = [...prev];
          let allDone = true;
          for (let i = 0; i < 6; i++) {
            const limit = frameworks[i].content.length;
            if (next[i] < limit) {
              next[i] = Math.min(next[i] + Math.ceil(Math.random() * 3) + 1, limit);
              allDone = false;
            }
          }
          if (allDone) {
            clearInterval(timer);
            setPhase('synthesis');
          }
          return next;
        });
      }, 40);
    } else if (phase === 'synthesis') {
      const text = PRESETS[activeIdea].synthesis;
      timer = setInterval(() => {
        setSynthProgress(prev => {
          if (prev >= text.length) {
            clearInterval(timer);
            setPhase('done');
            return text.length;
          }
          return prev + Math.ceil(Math.random() * 2) + 1;
        });
      }, 30);
    }

    return () => clearInterval(timer);
  }, [phase, activeIdea]);

  const selectIdea = (index: number) => {
    setActiveIdea(index);
    setPhase('typing-input');
    setInputProgress(0);
    setFwProgress([0, 0, 0, 0, 0, 0]);
    setSynthProgress(0);
  };

  const { inputBottom, fwTops, fwBottoms, synthTop } = coords;

  return (
    <div className="lp-canvas-wrapper">
      {/* Preset Selectors */}
      <div className="lp-demo-selectors">
        <span className="lp-demo-selector-label">STRESS-TEST PRESET:</span>
        <div className="lp-demo-selector-btns">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => selectIdea(idx)}
              className={`lp-demo-selector-btn ${activeIdea === idx ? 'active' : ''}`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div ref={containerRef} className="lp-canvas">
        {/* SVG connection lines behind nodes */}
        <svg className="lp-canvas-svg">
          {inputBottom && fwTops.length === 6 && fwTops.map((top, i) => {
            const active = inputProgress > 0;
            const pulse = phase === 'typing-input' || (phase === 'streaming-frameworks' && fwProgress[i] < PRESETS[activeIdea].frameworks[i].content.length);
            const d = `M ${inputBottom.x} ${inputBottom.y} C ${inputBottom.x} ${(inputBottom.y + top.y) / 2}, ${top.x} ${(inputBottom.y + top.y) / 2}, ${top.x} ${top.y}`;
            return (
              <g key={`edge-in-${i}`}>
                <path d={d} className={`lp-svg-path ${active ? 'active' : ''}`} />
                {pulse && (
                  <path
                    d={d}
                    className="lp-svg-pulse"
                    style={{ stroke: PRESETS[activeIdea].frameworks[i].accent }}
                  />
                )}
              </g>
            );
          })}
          {synthTop && fwBottoms.length === 6 && fwBottoms.map((bottom, i) => {
            const active = fwProgress[i] > 0;
            const pulse = phase === 'streaming-frameworks' || (phase === 'synthesis' && synthProgress < PRESETS[activeIdea].synthesis.length);
            const d = `M ${bottom.x} ${bottom.y} C ${bottom.x} ${(bottom.y + synthTop.y) / 2}, ${synthTop.x} ${(bottom.y + synthTop.y) / 2}, ${synthTop.x} ${synthTop.y}`;
            return (
              <g key={`edge-out-${i}`}>
                <path d={d} className={`lp-svg-path ${active ? 'active' : ''}`} />
                {pulse && (
                  <path
                    d={d}
                    className="lp-svg-pulse"
                    style={{ stroke: '#3B82F6' }}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Input Node */}
        <div ref={inputRef} className={`lp-nd lp-nd-input ${inputProgress > 0 ? 'lp-nd-vis' : ''}`}>
          <p className="lp-nd-lbl">INPUT IDEA</p>
          <p className="lp-nd-body">
            &ldquo;{PRESETS[activeIdea].input.substring(0, inputProgress)}
            {phase === 'typing-input' && <span className="lp-cursor">|</span>}&rdquo;
          </p>
        </div>

        {/* Framework row */}
        <div className="lp-fw-row">
          {PRESETS[activeIdea].frameworks.map((fw, i) => {
            const visible = fwProgress[i] > 0;
            const isTyping = phase === 'streaming-frameworks' && fwProgress[i] < fw.content.length;
            return (
              <div key={fw.label} className="lp-fw-col">
                <div
                  ref={fwRefs[i]}
                  className={`lp-nd lp-nd-fw ${visible ? 'lp-nd-vis' : ''}`}
                  style={{ borderLeftColor: fw.accent }}
                >
                  <div className="lp-nd-top">
                    <div>
                      <p className="lp-nd-lbl">{fw.label}</p>
                      <p className="lp-nd-title">{fw.title}</p>
                    </div>
                    <div className="lp-nd-dot" style={{ background: fw.accent }} />
                  </div>
                  <p className="lp-nd-content">
                    {fw.content.substring(0, fwProgress[i])}
                    {isTyping && <span className="lp-cursor">|</span>}
                    {!visible && phase === 'typing-input' && <span className="lp-nd-waiting">Waiting...</span>}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Synthesis Node */}
        <div ref={synthRef} className={`lp-nd lp-nd-synth ${synthProgress > 0 ? 'lp-nd-vis' : ''}`}>
          <div className="lp-nd-top">
            <div>
              <p className="lp-nd-lbl">SYNTHESIS</p>
              <p className="lp-nd-title">Strengthen Your Plan</p>
            </div>
            <div className="lp-nd-dot" style={{ background: '#3B82F6' }} />
          </div>
          <p className="lp-nd-content">
            {PRESETS[activeIdea].synthesis.substring(0, synthProgress)}
            {phase === 'synthesis' && <span className="lp-cursor">|</span>}
            {synthProgress === 0 && phase !== 'done' && <span className="lp-nd-waiting">Awaiting critique...</span>}
          </p>
        </div>
      </div>
    </div>
  );
}

/* --- Inline Brand SVG Logo Badges --- */
function LogoNova() {
  return (
    <div className="lp-brand-badge">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lp-brand-logo-svg">
        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
        <line x1="12" y1="22" x2="12" y2="12" />
        <line x1="12" y1="12" x2="22" y2="8.5" />
        <line x1="12" y1="12" x2="2" y2="8.5" />
      </svg>
      <span className="lp-brand-badge-name">NOVA.AI</span>
    </div>
  );
}

function LogoApex() {
  return (
    <div className="lp-brand-badge">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lp-brand-logo-svg">
        <path d="M12 2L2 22h20L12 2z" />
        <path d="M12 10l-4 8h8l-4-8z" />
      </svg>
      <span className="lp-brand-badge-name">APEX</span>
    </div>
  );
}

function LogoAether() {
  return (
    <div className="lp-brand-badge">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lp-brand-logo-svg">
        <path d="M12 2L2 12l10 10 10-10L12 2z" />
        <path d="M12 6l-6 6 6 6 6-6-6-6z" />
      </svg>
      <span className="lp-brand-badge-name">AETHER</span>
    </div>
  );
}

function LogoVortex() {
  return (
    <div className="lp-brand-badge">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lp-brand-logo-svg">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        <path d="M2 12h20" />
      </svg>
      <span className="lp-brand-badge-name">VORTEX</span>
    </div>
  );
}

function LogoVertex() {
  return (
    <div className="lp-brand-badge">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lp-brand-logo-svg">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" />
      </svg>
      <span className="lp-brand-badge-name">VERTEX</span>
    </div>
  );
}

/* ==========================================================
   MAIN LANDING PAGE
   ========================================================== */
export default function LandingPage({ onLaunch }: { onLaunch: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  /* Unlock scroll */
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlH = html.style.height;
    const prevHtmlO = html.style.overflowY;
    const prevBodyH = body.style.height;
    const prevBodyO = body.style.overflowY;
    html.style.height = 'auto';
    html.style.overflowY = 'auto';
    body.style.height = 'auto';
    body.style.overflowY = 'auto';
    return () => {
      html.style.height = prevHtmlH;
      html.style.overflowY = prevHtmlO;
      body.style.height = prevBodyH;
      body.style.overflowY = prevBodyO;
    };
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const launch = useCallback(() => {
    setFadeOut(true);
    setTimeout(onLaunch, 480);
  }, [onLaunch]);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const toggleFaq = (idx: number) => {
    setOpenFaq(prev => (prev === idx ? null : idx));
  };

  return (
    <div className={`lp-root ${fadeOut ? 'lp-fade-out' : ''}`}>

      {/* -- Single shared FaultyTerminal -- */}
      <div className="lp-terminal-bg">
        <FaultyTerminal
          scale={2.5}
          gridMul={[2, 1]}
          digitSize={2.1}
          timeScale={0.5}
          scanlineIntensity={0.5}
          glitchAmount={1}
          flickerAmount={1}
          noiseAmp={0.9}
          chromaticAberration={0}
          curvature={0.1}
          tint="#ff0000"
          mouseReact={true}
          mouseStrength={0.5}
          pageLoadAnimation={true}
          brightness={0.5}
        />
      </div>
      <div className="lp-terminal-overlay" />

      {/* -- Navbar -- */}
      <nav className={`lp-nav ${scrolled ? 'lp-nav-scrolled' : ''}`}>
        <div className="lp-nav-inner">
          <div className="lp-nav-brand">
            <img src="/favicon.png" alt="RedTeam" className="lp-nav-logo" />
            <span className="lp-nav-name">RedTeam</span>
          </div>
          <div className="lp-nav-links">
            <button onClick={() => scrollTo('modes')} className="lp-nav-link">Modes</button>
            <button onClick={() => scrollTo('features')} className="lp-nav-link">Features</button>
            <button onClick={() => scrollTo('pricing')} className="lp-nav-link">Pricing</button>
            <button onClick={() => scrollTo('faq')} className="lp-nav-link">FAQ</button>
          </div>
          <button onClick={launch} className="lp-btn-sm">Launch &rarr;</button>
        </div>
      </nav>

      {/* -- Hero -- */}
      <section className="lp-hero">
        <div className="lp-hero-inner">
          <p className="lp-eyebrow lp-hero-anim" style={{ animationDelay: '0.1s' }}>
            ADVERSARIAL INTELLIGENCE ENGINE
          </p>
          <h1 className="lp-hero-h1 lp-hero-anim" style={{ animationDelay: '0.3s' }}>
            The Future of<br />
            <em className="lp-hero-em">ideation.</em>
          </h1>
          <p className="lp-hero-sub lp-hero-anim" style={{ animationDelay: '0.5s' }}>
            RedTeam deploys up to 6 independent AI agents at your idea simultaneously &mdash;
            each hunting for a different class of failure. Seconds, not weeks.
          </p>
          <div className="lp-hero-cta lp-hero-anim" style={{ animationDelay: '0.7s' }}>
            <button onClick={launch} className="lp-btn-lg">LAUNCH REDTEAM &rarr;</button>
          </div>
          <p className="lp-hero-meta lp-hero-anim" style={{ animationDelay: '0.9s' }}>
            7 analytical modes &nbsp;&middot;&nbsp; up to 6 AI agents &nbsp;&middot;&nbsp; real-time streaming canvas
          </p>
        </div>
      </section>

      {/* -- Problem -- */}
      <Section id="problem" className="lp-problem">
        <p className="lp-eyebrow">THE PROBLEM</p>
        <blockquote className="lp-pullquote">
          &ldquo;Your worst ideas feel exactly like your best ideas &mdash;
          until someone shows you what you can&rsquo;t see.&rdquo;
        </blockquote>
        <div className="lp-two-col">
          <p>Founders beta-test with friends. Strategists bounce ideas off their team. Researchers run it past advisors. Everyone in the room shares the same blind spots you do.</p>
          <p>The critical feedback that saves your plan is the feedback nobody in the room is equipped to give. RedTeam gives you that voice &mdash; structured, relentless, and incapable of being polite.</p>
        </div>
      </Section>

      {/* -- Modes -- */}
      <Section id="modes" className="lp-modes">
        <p className="lp-eyebrow">SEVEN MODES OF ATTACK</p>
        <h2 className="lp-h2">Choose how to break your idea.</h2>
        <p className="lp-lead">Each mode deploys a different cognitive framework. Pick one, and up to 6 agents run in parallel &mdash; each hunting for a different failure class.</p>

        <div className="lp-modes-grid">
          {MODES.filter(m => m.id !== 'chat').map(mode => (
            <div key={mode.id} className="lp-mode-card" style={{ '--mode-accent': mode.accent } as React.CSSProperties}>
              <span className="lp-mode-icon" style={{ color: mode.accent }}>{MODE_ICONS[mode.id]}</span>
              <p className="lp-mode-name">{mode.name}</p>
              <p className="lp-mode-tagline">{mode.tagline}</p>
              <div className="lp-mode-rule" style={{ background: `${mode.accent}30` }} />
              <p className="lp-mode-meta" style={{ color: mode.accent }}>{MODE_LABELS[mode.id]}</p>
            </div>
          ))}
        </div>

        {MODES.filter(m => m.id === 'chat').map(mode => (
          <div key={mode.id} className="lp-mode-card lp-mode-chat" style={{ '--mode-accent': mode.accent } as React.CSSProperties}>
            <span className="lp-mode-icon" style={{ color: mode.accent }}>{MODE_ICONS[mode.id]}</span>
            <div className="lp-mode-chat-body">
              <p className="lp-mode-name">{mode.name}</p>
              <p className="lp-mode-tagline">{mode.tagline}</p>
            </div>
            <p className="lp-mode-meta" style={{ color: mode.accent }}>{MODE_LABELS[mode.id]}</p>
          </div>
        ))}
      </Section>

      {/* -- Features + Canvas Demo -- */}
      <Section id="features" className="lp-features">
        <p className="lp-eyebrow">BUILT FOR DEPTH</p>
        <h2 className="lp-h2">Not a chatbot. A war room.</h2>

        <CanvasDemo />
      </Section>

      {/* -- How It Works -- */}
      <Section id="how" className="lp-how">
        <p className="lp-eyebrow">HOW IT WORKS</p>
        <h2 className="lp-h2">Three steps to a stress-tested idea.</h2>
        <div className="lp-steps">
          {[
            { n: '\u2460', title: 'Choose Your Mode', body: 'Pick how you want your idea attacked. 7 modes, each with a different analytical lens and agent configuration.' },
            { n: '\u2461', title: 'Describe Your Idea', body: 'Tell it what you\'re building, planning, or deciding. Plain language. No templates. No prompting tricks.' },
            { n: '\u2462', title: 'Read the Verdict', body: 'Up to 6 agents stream in parallel. A synthesis agent delivers the final verdict \u2014 risks, pivots, and paths forward.' },
          ].map((step, i) => (
            <div key={i} className="lp-step">
              <div className="lp-step-num">{step.n}</div>
              <h3 className="lp-step-title">{step.title}</h3>
              <p className="lp-step-body">{step.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* -- Pricing -- */}
      <Section id="pricing" className="lp-pricing">
        <p className="lp-eyebrow">PRICING</p>
        <h2 className="lp-h2">Simple pricing. No surprises.</h2>
        <p className="lp-lead">Start free. Upgrade when you&rsquo;re ready.</p>

        {/* Pricing Toggle */}
        <div className="lp-billing-toggle-container">
          <span className={`lp-billing-label ${!annual ? 'active' : ''}`}>Monthly</span>
          <button onClick={() => setAnnual(!annual)} className="lp-billing-toggle" aria-label="Toggle annual billing">
            <div className={`lp-billing-toggle-knob ${annual ? 'annually' : ''}`} />
          </button>
          <span className={`lp-billing-label ${annual ? 'active' : ''}`}>
            Annually <span className="lp-billing-badge-discount">Save 20%</span>
          </span>
        </div>

        <div className="lp-pricing-grid">
          <div className="lp-pricing-card">
            <h3 className="lp-pricing-name">Free</h3>
            <div className="lp-pricing-price">
              <span className="lp-pricing-amount">$0</span>
              <span className="lp-pricing-period">/month</span>
            </div>
            <p className="lp-pricing-desc">For individuals exploring ideas.</p>
            <ul className="lp-pricing-list">
              <li><span className="lp-check">&check;</span>3 sessions per day</li>
              <li><span className="lp-check">&check;</span>4 analytical modes</li>
              <li><span className="lp-check">&check;</span>Session memory</li>
              <li><span className="lp-check">&check;</span>Community support</li>
            </ul>
            <button onClick={launch} className="lp-pricing-cta">Get Started</button>
          </div>

          <div className="lp-pricing-card lp-pricing-hot">
            <span className="lp-pricing-badge">MOST POPULAR</span>
            <h3 className="lp-pricing-name">Pro</h3>
            <div className="lp-pricing-price">
              <span className="lp-pricing-amount">{annual ? '$23' : '$29'}</span>
              <span className="lp-pricing-period">{annual ? '/mo, billed annually' : '/month'}</span>
            </div>
            <p className="lp-pricing-desc">For founders and strategists.</p>
            <ul className="lp-pricing-list">
              <li><span className="lp-check">&check;</span>Unlimited sessions</li>
              <li><span className="lp-check">&check;</span>All 7 modes</li>
              <li><span className="lp-check">&check;</span>Document grounding</li>
              <li><span className="lp-check">&check;</span>Web search</li>
              <li><span className="lp-check">&check;</span>Priority support</li>
              <li><span className="lp-check">&check;</span>Session export</li>
            </ul>
            <button onClick={launch} className="lp-pricing-cta lp-pricing-cta-hot">Start Free Trial</button>
          </div>

          <div className="lp-pricing-card">
            <h3 className="lp-pricing-name">Team</h3>
            <div className="lp-pricing-price">
              <span className="lp-pricing-amount">{annual ? '$63' : '$79'}</span>
              <span className="lp-pricing-period">{annual ? '/mo, billed annually' : '/month'}</span>
            </div>
            <p className="lp-pricing-desc">For teams that think together.</p>
            <ul className="lp-pricing-list">
              <li><span className="lp-check">&check;</span>Everything in Pro</li>
              <li><span className="lp-check">&check;</span>Up to 10 seats</li>
              <li><span className="lp-check">&check;</span>Shared sessions</li>
              <li><span className="lp-check">&check;</span>Team memory</li>
              <li><span className="lp-check">&check;</span>API access</li>
              <li><span className="lp-check">&check;</span>Dedicated support</li>
            </ul>
            <button onClick={launch} className="lp-pricing-cta">Contact Us</button>
          </div>
        </div>
      </Section>

      {/* -- FAQ Section -- */}
      <Section id="faq" className="lp-faq">
        <p className="lp-eyebrow">COMMON QUESTIONS</p>
        <h2 className="lp-h2">Frequently Asked Questions</h2>
        <p className="lp-lead">Everything you need to know about RedTeam.</p>
        
        <div className="lp-faq-accordion">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className={`lp-faq-item ${isOpen ? 'open' : ''}`}>
                <button className="lp-faq-trigger" onClick={() => toggleFaq(idx)}>
                  <span className="lp-faq-q">{item.q}</span>
                  <span className="lp-faq-arrow">{isOpen ? '\u2212' : '\u002B'}</span>
                </button>
                <div className="lp-faq-content">
                  <p className="lp-faq-a">{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* -- Social Proof with Stylized Brand Badges -- */}
      <Section id="social" className="lp-social">
        <p className="lp-eyebrow">TRUSTED BY THINKERS</p>
        <p className="lp-lead" style={{ maxWidth: 520, margin: '0 auto 40px' }}>
          Join founders, researchers, professors, and strategists who stress-test their ideas before the market does.
        </p>
        <div className="lp-logo-strip">
          <LogoNova />
          <LogoApex />
          <LogoAether />
          <LogoVortex />
          <LogoVertex />
        </div>
      </Section>

      {/* -- Final CTA -- */}
      <section className="lp-final">
        <div className="lp-final-inner">
          <h2 className="lp-final-h2">
            Stop asking friends.<br />
            <em className="lp-hero-em">Start stress-testing.</em>
          </h2>
          <button onClick={launch} className="lp-btn-lg">LAUNCH REDTEAM &rarr;</button>
          <p className="lp-hero-meta" style={{ marginTop: 20 }}>
            No credit card. No setup. Just your idea and 35 adversarial frameworks.
          </p>
        </div>
      </section>

      {/* -- Footer -- */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-nav-brand">
            <img src="/favicon.png" alt="RedTeam" className="lp-nav-logo" />
            <span className="lp-nav-name">RedTeam</span>
          </div>
          <div className="lp-footer-links">
            <button onClick={() => scrollTo('modes')}>Modes</button>
            <button onClick={() => scrollTo('features')}>Features</button>
            <button onClick={() => scrollTo('pricing')}>Pricing</button>
            <button onClick={() => scrollTo('faq')}>FAQ</button>
          </div>
          <p className="lp-footer-copy">&copy; {new Date().getFullYear()} RedTeam. The future of ideation.</p>
        </div>
      </footer>
    </div>
  );
}
