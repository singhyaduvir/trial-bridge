'use client';

/**
 * TrialJourney
 * ------------------------------------------------------------------
 * Scroll-scrubbed visualization of a sample moving through
 * formulation -> incubation -> microscopy.
 *
 * See repository prompt for full documentation and integration notes.
 */

import { useEffect, useId, useRef } from 'react';
import anime from 'animejs';

type PhaseColor = 'teal' | 'amber' | 'violet';

export interface TrialJourneyPhase {
  tag: string;
  title: string;
  description: string;
  color: PhaseColor;
}

export interface TrialJourneyProps {
  className?: string;
  sampleId?: string;
  phases?: TrialJourneyPhase[];
}

const DEFAULT_PHASES: TrialJourneyPhase[] = [
  {
    tag: '01 — FORMULATION',
    title: 'Solvents are combined into a single working solution.',
    description:
      'Three components are metered directly into the vial and allowed to reach a stable, homogeneous mixture.',
    color: 'teal',
  },
  {
    tag: '02 — TRANSFER',
    title: 'The vial is handed into incubation.',
    description:
      'A robotic arm grips the sealed sample directly while the incubator chamber closes around it.',
    color: 'teal',
  },
  {
    tag: '03 — INCUBATION',
    title: 'Conditions are held steady while the culture develops.',
    description:
      'Temperature and humidity stay fixed inside the chamber as the sample is monitored for growth.',
    color: 'amber',
  },
  {
    tag: '04 — RETRIEVAL',
    title: 'A second arm hands the sample to analysis.',
    description:
      'The vial is lifted directly from the chamber as the microscope stage moves into place beneath it.',
    color: 'amber',
  },
  {
    tag: '05 — ANALYSIS',
    title: 'The objective adjusts until the sample resolves.',
    description:
      'Magnification and focus are brought into alignment, and the result is logged against the trial record.',
    color: 'violet',
  },
];

const PHASE_COLOR_VAR: Record<PhaseColor, string> = {
  teal: 'var(--tj-teal)',
  amber: 'var(--tj-amber)',
  violet: 'var(--tj-violet)',
};

const STAGE_X = 450;
const STAGE_Y = 400;
const ARM1_PIVOT = { x: 400, y: 250 };
const ARM2_PIVOT = { x: 500, y: 250 };
const ARM1_ANGLE = (Math.atan2(STAGE_Y - ARM1_PIVOT.y, STAGE_X - ARM1_PIVOT.x) * 180) / Math.PI;
const ARM2_ANGLE = (Math.atan2(STAGE_Y - ARM2_PIVOT.y, STAGE_X - ARM2_PIVOT.x) * 180) / Math.PI;
const PARK_ANGLE = -90;

export default function TrialJourney({
  className,
  sampleId = 'TRL-0192',
  phases = DEFAULT_PHASES,
}: TrialJourneyProps) {
  const uid = useId().replace(/:/g, '');

  const wrapperRef = useRef<HTMLDivElement>(null);
  const copyRefs = useRef<Array<HTMLDivElement | null>>([]);
  const readoutPhaseRef = useRef<HTMLSpanElement>(null);
  const readoutPctRef = useRef<HTMLSpanElement>(null);
  const readoutRootRef = useRef<HTMLDivElement>(null);

  const els = useRef<Record<string, SVGGraphicsElement | null>>({});
  const setEl = (key: string) => (node: SVGGraphicsElement | null) => {
    els.current[key] = node;
  };

  const timelineRef = useRef<any | null>(null);

  useEffect(() => {
    const tickGroup = els.current.tickGroup;
    if (tickGroup && tickGroup.childElementCount === 0) {
      const cx = STAGE_X,
        cy = STAGE_Y,
        rOuter = 260,
        rInner = 246;
      for (let i = 0; i < 72; i++) {
        const a = (i / 72) * Math.PI * 2;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', String(cx + Math.cos(a) * rInner));
        line.setAttribute('y1', String(cy + Math.sin(a) * rInner));
        line.setAttribute('x2', String(cx + Math.cos(a) * rOuter));
        line.setAttribute('y2', String(cy + Math.sin(a) * rOuter));
        tickGroup.appendChild(line);
      }
    }

    const e = els.current;
    const tl = anime.timeline({ autoplay: false, easing: 'easeInOutQuad' });

    tl.add({ targets: e.mixRig, translateY: [-40, 0], opacity: [0, 1], duration: 250 }, 0);
    tl.add({ targets: e.vialGroup, opacity: [0, 1], duration: 200 }, 0);
    // droplets travel further to reach the lowered vial mouth
    tl.add({ targets: e.drop1, translateY: [0, 130], opacity: [0, 1, 0], duration: 300 }, 150);
    tl.add({ targets: e.drop2, translateY: [0, 130], opacity: [0, 1, 0], duration: 300 }, 330);
    tl.add({ targets: e.drop3, translateY: [0, 130], opacity: [0, 1, 0], duration: 300 }, 510);
    tl.add({ targets: e.liquidRect, y: [90, 8], height: [0, 82], duration: 650, easing: 'easeOutQuad' }, 250);
    tl.add({ targets: e.bub1, translateY: [0, -28], opacity: [0, 0.8, 0], duration: 400 }, 500);
    tl.add({ targets: e.bub2, translateY: [0, -24], opacity: [0, 0.8, 0], duration: 400 }, 600);
    tl.add({ targets: e.bub3, translateY: [0, -26], opacity: [0, 0.8, 0], duration: 400 }, 700);
    tl.add({ targets: e.vialCap, opacity: [0, 1], scale: [0.5, 1], duration: 200 }, 800);
    tl.add({ targets: e.mixRig, translateY: [0, -55], opacity: [1, 0], duration: 250 }, 800);

    tl.add({ targets: e.arm1seg, rotate: [PARK_ANGLE, ARM1_ANGLE], duration: 320 }, 950);
    tl.add({ targets: e.arm1gripper, rotate: [0, 14], duration: 150 }, 1270);
    tl.add({ targets: e.incubatorGroup, translateX: [260, 0], duration: 480, easing: 'easeInOutQuad' }, 1300);
    tl.add({ targets: e.arm1gripper, rotate: [14, 0], duration: 150 }, 1780);
    tl.add({ targets: e.arm1seg, rotate: [ARM1_ANGLE, PARK_ANGLE], duration: 320 }, 1780);
    tl.add({ targets: e.incDoor, height: [0, 160], duration: 260 }, 2100);

    tl.add({ targets: e.incubatorGlow, opacity: [0, 0.9, 0.5, 0.9, 0.4], duration: 700 }, 2400);
    tl.add({ targets: e.cult1, opacity: [0, 1], scale: [0.4, 1], duration: 200 }, 2450);
    tl.add({ targets: e.cult2, opacity: [0, 1], scale: [0.4, 1], duration: 200 }, 2550);
    tl.add({ targets: e.cult3, opacity: [0, 1], scale: [0.4, 1], duration: 200 }, 2650);
    tl.add({ targets: e.cult4, opacity: [0, 1], scale: [0.4, 1], duration: 200 }, 2750);
    tl.add({ targets: e.incDoor, height: [160, 0], duration: 260 }, 2900);
    tl.add({ targets: e.incubatorGlow, opacity: [0.4, 0], duration: 250 }, 2900);

    tl.add({ targets: e.arm2seg, rotate: [PARK_ANGLE, ARM2_ANGLE], duration: 320 }, 2950);
    tl.add({ targets: e.arm2gripper, rotate: [0, -14], duration: 150 }, 3270);
    tl.add({ targets: e.incubatorGroup, translateX: [0, 260], duration: 480, easing: 'easeInOutQuad' }, 3300);
    tl.add({ targets: e.microscopeGroup, translateX: [-260, 0], duration: 480, easing: 'easeInOutQuad' }, 3300);
    tl.add({ targets: e.arm2gripper, rotate: [-14, 0], duration: 150 }, 3780);
    tl.add({ targets: e.arm2seg, rotate: [ARM2_ANGLE, PARK_ANGLE], duration: 320 }, 3780);

    tl.add({ targets: e.turret, rotate: [0, 55], duration: 350 }, 4050);
    tl.add({ targets: e.focusRing1, opacity: [0, 0.6, 0], r: [40, 14], duration: 450 }, 4150);
    tl.add({ targets: e.focusRing2, opacity: [0, 0.4, 0], r: [55, 26], duration: 450 }, 4300);
    tl.add({ targets: e.turret, rotate: [55, 20], duration: 350 }, 4500);
    tl.add({ targets: e.focusRing1, opacity: [0, 0.7, 0], r: [30, 18], duration: 450 }, 4600);
    tl.add({ targets: e.vialGroup, scale: [1, 1, 1.04], duration: 400, easing: 'easeInOutSine' }, 4750);

    timelineRef.current = tl;

    return () => {
      timelineRef.current = null;
    };
  }, []);

  useEffect(() => {
    const CIRC = 2 * Math.PI * 260;
    let ticking = false;

    const render = () => {
      const wrapper = wrapperRef.current;
      const tl = timelineRef.current;
      const progressArc = els.current.progressArc;
      if (!wrapper || !tl) return;

      const rect = wrapper.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      let progress = scrollable > 0 ? -rect.top / scrollable : 0;
      progress = Math.max(0, Math.min(1, progress));

      tl.seek(progress * tl.duration);

      if (progressArc) {
        progressArc.style.strokeDashoffset = String(CIRC * (1 - progress));
      }

      const phaseIdx = Math.min(phases.length - 1, Math.floor(progress * phases.length));
      const info = phases[phaseIdx];
      const colorVar = PHASE_COLOR_VAR[info.color];

      if (progressArc) progressArc.style.stroke = colorVar;
      if (readoutRootRef.current) readoutRootRef.current.style.setProperty('--tj-phase-color', colorVar);
      if (readoutPhaseRef.current) readoutPhaseRef.current.textContent = info.tag.split('— ')[1] ?? info.tag;
      if (readoutPctRef.current) readoutPctRef.current.textContent = `${Math.round(progress * 100)}%`;

      copyRefs.current.forEach((el, idx) => {
        if (!el) return;
        el.classList.toggle('is-active', idx === phaseIdx);
      });
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          render();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    render();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [phases]);

  const liquidGradId = `${uid}-liquidGrad`;
  const incGlowId = `${uid}-incGlow`;

  return (
    <div className={className} style={{ background: 'var(--tj-bg)' }}>
      <style>{`
        .tj-root {
          --tj-bg: #F6F7F5;
          --tj-panel: #FFFFFF;
          --tj-line: #E1E5E1;
          --tj-ink: #1B2420;
          --tj-ink-dim: #667069;
          --tj-teal: #0E8E7E;
          --tj-amber: #C97A12;
          --tj-violet: #6952C7;
          --tj-glass-stroke: #B9C2BC;
          --tj-track: #E1E5E1;
          --tj-phase-color: var(--tj-teal);
          position: relative;
          font-family: "Space Grotesk", "Inter", system-ui, sans-serif;
          color: var(--tj-ink);
        }
        .tj-scrolly { position: relative; height: 600vh; }
        .tj-sticky {
          position: sticky;
          top: 0;
          height: 100vh;
          display: grid;
          grid-template-columns: minmax(240px, 380px) 1fr;
          align-items: center;
          overflow: hidden;
          background: var(--tj-bg);
        }
        .tj-copy-col { position: relative; height: 220px; padding-left: 6vw; }
        .tj-copy {
          position: absolute;
          inset: 0 24px 0 0;
          opacity: 0;
          transform: translateY(14px);
          transition: opacity .35s ease, transform .35s ease;
        }
        .tj-copy.is-active { opacity: 1; transform: translateY(0); }
        .tj-copy .tj-tag {
          display: inline-block;
          font-family: "IBM Plex Mono", ui-monospace, monospace;
          font-size: 12px;
          letter-spacing: 0.02em;
          color: var(--tj-tag-color, var(--tj-teal));
          margin-bottom: 12px;
        }
        .tj-copy h2 { font-size: clamp(22px, 2.6vw, 30px); line-height: 1.25; margin: 0 0 10px; font-weight: 600; }
        .tj-copy p { color: var(--tj-ink-dim); font-size: 15px; line-height: 1.6; margin: 0; max-width: 34ch; }
        .tj-stage-col { position: relative; height: 100%; display: flex; align-items: center; justify-content: center; }
        .tj-stage-col svg { width: min(64vw, 720px); height: auto; overflow: visible; }
        .tj-ring-ticks { transform-origin: 450px 400px; animation: tj-spin 90s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .tj-ring-ticks { animation: none; }
          .tj-copy { transition: opacity .01s linear; transform: none; }
        }
        @keyframes tj-spin { to { transform: rotate(360deg); } }
        .tj-readout {
          position: absolute;
          right: 4vw;
          bottom: 6vh;
          width: 236px;
          padding: 12px 14px;
          background: var(--tj-panel);
          border: 1px solid var(--tj-line);
          border-radius: 6px;
          font-family: "IBM Plex Mono", ui-monospace, monospace;
          font-size: 11.5px;
          line-height: 1.7;
          color: var(--tj-ink-dim);
          box-shadow: 0 1px 2px rgba(20, 30, 25, 0.04);
        }
        .tj-readout .tj-k { color: var(--tj-phase-color); }
        .tj-scroll-cue {
          position: absolute;
          left: 6vw;
          bottom: 6vh;
          font-family: "IBM Plex Mono", ui-monospace, monospace;
          font-size: 11px;
          color: var(--tj-ink-dim);
          letter-spacing: 0.02em;
        }
        .tj-arm rect { fill: #4B564F; }
        .tj-arm .tj-joint { fill: #39423C; }
        .tj-gripper path { fill: #55645C; }
        .tj-rig { fill: #4B564F; }
        .tj-vial-glass { fill: rgba(20, 30, 25, 0.03); stroke: var(--tj-glass-stroke); stroke-width: 2; }
        .tj-vial-cap { fill: #55645C; }
        .tj-bubble { fill: #FFFFFF; opacity: 0; }
        .tj-droplet { opacity: 0; }
        .tj-incubator-body { fill: var(--tj-panel); stroke: var(--tj-line); stroke-width: 2; }
        .tj-incubator-door { fill: #ECE7DB; stroke: var(--tj-line); stroke-width: 1.5; }
        .tj-incubator-glow { opacity: 0; }
        .tj-culture-dot { opacity: 0; fill: var(--tj-amber); }
        .tj-scope-body { fill: var(--tj-panel); stroke: var(--tj-line); stroke-width: 2; }
        .tj-scope-lens { fill: #EFEAE0; stroke: var(--tj-glass-stroke); stroke-width: 1.5; }
        .tj-focus-ring { fill: none; stroke: var(--tj-violet); opacity: 0; }
      `}</style>

      <div className="tj-root">
        <div className="tj-scrolly" ref={wrapperRef}>
          <div className="tj-sticky">
            <div className="tj-copy-col">
              {phases.map((phase, idx) => (
                <div
                  key={phase.tag}
                  className="tj-copy"
                  ref={(el) => {
                    copyRefs.current[idx] = el;
                  }}
                  style={{ '--tj-tag-color': PHASE_COLOR_VAR[phase.color] } as React.CSSProperties}
                >
                  <span className="tj-tag">{phase.tag}</span>
                  <h2>{phase.title}</h2>
                  <p>{phase.description}</p>
                </div>
              ))}
            </div>

            <div className="tj-stage-col">
              <svg viewBox="0 0 900 700" aria-hidden="true">
                <defs>
                  <linearGradient id={liquidGradId} x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#0E8E7E" />
                    <stop offset="100%" stopColor="#6FDFD0" />
                  </linearGradient>
                  <radialGradient id={incGlowId} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#C97A12" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#C97A12" stopOpacity="0" />
                  </radialGradient>
                </defs>

                <g className="tj-ring-ticks">
                  <circle cx={STAGE_X} cy={STAGE_Y} r={260} fill="none" stroke="#DEE3DE" strokeWidth={1} />
                  <g ref={setEl('tickGroup')} stroke="#D7DCD6" strokeWidth={2} />
                </g>
                <circle cx={STAGE_X} cy={STAGE_Y} r={260} fill="none" stroke="var(--tj-track)" strokeWidth={6} opacity={0.6} />
                <circle
                  ref={setEl('progressArc')}
                  cx={STAGE_X}
                  cy={STAGE_Y}
                  r={260}
                  fill="none"
                  stroke="var(--tj-teal)"
                  strokeWidth={6}
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 260}
                  strokeDashoffset={2 * Math.PI * 260}
                  transform={`rotate(-90 ${STAGE_X} ${STAGE_Y})`}
                />

                <g ref={setEl('mixRig')} transform={`translate(${STAGE_X},255)`} opacity={0}>
                  <rect className="tj-rig" x={-58} y={-10} width={116} height={18} rx={8} />
                  <rect className="tj-rig" x={-10} y={6} width={6} height={16} rx={2} />
                  <rect className="tj-rig" x={-3} y={6} width={6} height={16} rx={2} />
                  <rect className="tj-rig" x={4} y={6} width={6} height={16} rx={2} />
                </g>
                <circle ref={setEl('drop1')} className="tj-droplet" cx={STAGE_X - 8} cy={300} r={5} fill="#0E8E7E" />
                <circle ref={setEl('drop2')} className="tj-droplet" cx={STAGE_X} cy={300} r={5} fill="#3FB4A4" />
                <circle ref={setEl('drop3')} className="tj-droplet" cx={STAGE_X + 8} cy={300} r={5} fill="#8FDDD0" />

                <g ref={setEl('incubatorGroup')} transform="translate(0,0)">
                  <rect className="tj-incubator-body" x={390} y={330} width={120} height={180} rx={10} />
                  <circle ref={setEl('incubatorGlow')} className="tj-incubator-glow" cx={STAGE_X} cy={STAGE_Y + 20} r={80} fill={`url(#${incGlowId})`} />
                  <rect ref={setEl('incDoor')} className="tj-incubator-door" x={394} y={334} width={112} height={0} rx={6} />
                </g>

                <g ref={setEl('microscopeGroup')} transform="translate(0,0)">
                  <rect x={415} y={486} width={70} height={12} rx={4} className="tj-scope-body" />
                  <rect x={440} y={150} width={20} height={190} className="tj-scope-body" />
                  <rect x={428} y={120} width={44} height={40} rx={8} className="tj-scope-body" />
                  <rect x={436} y={90} width={28} height={40} rx={10} className="tj-scope-body" />
                  <g ref={setEl('turret')} style={{ transformBox: 'fill-box', transformOrigin: `${STAGE_X}px 340px` } as React.CSSProperties}>
                    <circle cx={STAGE_X} cy={340} r={16} className="tj-scope-lens" />
                    <circle cx={STAGE_X - 18} cy={352} r={9} className="tj-scope-lens" />
                    <circle cx={STAGE_X + 18} cy={352} r={9} className="tj-scope-lens" />
                  </g>
                  <circle ref={setEl('focusRing1')} className="tj-focus-ring" cx={STAGE_X} cy={STAGE_Y + 20} r={40} />
                  <circle ref={setEl('focusRing2')} className="tj-focus-ring" cx={STAGE_X} cy={STAGE_Y + 20} r={55} />
                </g>

                <g ref={setEl('vialGroup')} transform={`translate(${STAGE_X},${STAGE_Y + 12})`} opacity={0}>
                  <rect className="tj-vial-glass" x={-22} y={0} width={44} height={90} rx={10} />
                  <rect ref={setEl('vialCap')} className="tj-vial-cap" x={-14} y={-12} width={28} height={14} rx={3} opacity={0} />
                  <g transform="translate(-22,0)">
                    <rect ref={setEl('liquidRect')} x={0} y={90} width={44} height={0} fill={`url(#${liquidGradId})`} />
                  </g>
                  <circle ref={setEl('bub1')} className="tj-bubble" cx={-6} cy={70} r={2.4} />
                  <circle ref={setEl('bub2')} className="tj-bubble" cx={4} cy={60} r={2} />
                  <circle ref={setEl('bub3')} className="tj-bubble" cx={-2} cy={50} r={2.2} />
                  <circle ref={setEl('cult1')} className="tj-culture-dot" cx={-8} cy={55} r={2.6} />
                  <circle ref={setEl('cult2')} className="tj-culture-dot" cx={6} cy={65} r={2.2} />
                  <circle ref={setEl('cult3')} className="tj-culture-dot" cx={0} cy={45} r={2.4} />
                  <circle ref={setEl('cult4')} className="tj-culture-dot" cx={-4} cy={35} r={2} />
                </g>

                <g className="tj-arm" transform={`translate(${ARM1_PIVOT.x},${ARM1_PIVOT.y})`}>
                  <circle className="tj-joint" r={9} />
                  <g ref={setEl('arm1seg')} style={{ transformBox: 'fill-box', transformOrigin: '0px 0px' } as React.CSSProperties}>
                    <rect x={0} y={-8} width={158} height={16} rx={8} />
                    <g
                      ref={setEl('arm1gripper')}
                      className="tj-gripper"
                      transform="translate(158,0)"
                      style={{ transformBox: 'fill-box', transformOrigin: '0px 0px' } as React.CSSProperties}
                    >
                      <path d="M0,-3 L16,-16 L20,-10 L6,1 Z" />
                      <path d="M0,3 L16,16 L20,10 L6,-1 Z" />
                    </g>
                  </g>
                </g>

                <g className="tj-arm" transform={`translate(${ARM2_PIVOT.x},${ARM2_PIVOT.y})`}>
                  <circle className="tj-joint" r={9} />
                  <g ref={setEl('arm2seg')} style={{ transformBox: 'fill-box', transformOrigin: '0px 0px' } as React.CSSProperties}>
                    <rect x={-158} y={-8} width={158} height={16} rx={8} />
                    <g
                      ref={setEl('arm2gripper')}
                      className="tj-gripper"
                      transform="translate(-158,0)"
                      style={{ transformBox: 'fill-box', transformOrigin: '0px 0px' } as React.CSSProperties}
                    >
                      <path d="M0,-3 L-16,-16 L-20,-10 L-6,1 Z" />
                      <path d="M0,3 L-16,16 L-20,10 L-6,-1 Z" />
                    </g>
                  </g>
                </g>
              </svg>

              <div className="tj-readout" ref={readoutRootRef}>
                <div>
                  <span className="tj-k">phase</span>&nbsp;
                  <span ref={readoutPhaseRef}>formulation</span>
                </div>
                <div>
                  <span className="tj-k">sample</span>&nbsp;{sampleId}
                </div>
                <div>
                  <span className="tj-k">progress</span>&nbsp;
                  <span ref={readoutPctRef}>0%</span>
                </div>
              </div>
              <div className="tj-scroll-cue">SCROLL ↓</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
