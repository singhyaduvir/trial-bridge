"use client";

import React, { useEffect, useRef, useState } from 'react';

type PhaseColor = 'teal' | 'amber' | 'violet';

interface Phase {
  tag: string;
  title: string;
  description: string;
  color: PhaseColor;
}

const PHASES: Phase[] = [
  { tag: '01 — BUILD', title: 'Connect with your medical team.', description: 'Find the medical professional responsible for your care.', color: 'teal' },
  { tag: '02 — TRANSFER', title: 'Complete your eligibility profile.', description: 'Fill in your medical information and values or submit your medical documents to have us do it for you.', color: 'teal' },
  { tag: '03 — MATCHING', title: 'Eligible Trial Matching.', description: 'Your profile is matched with eligible trials and given scores depending on your criteria.', color: 'amber' },
  { tag: '04 — APPLICATION', title: 'Submit Informed Application.', description: 'You may consult with your medical team about the matching criteria for the trial and submit an application with your profile to the trial.', color: 'amber' },
  { tag: '05 — TRACKING', title: 'One unified dashboard to track trials, patients, and outcomes.', description: 'Your application and patients are tracked on your dashboard giving you access to all relevant information to drive your trial outcomes forward.', color: 'violet' },
];

const COLOR_HEX: Record<PhaseColor, string> = {
  teal: '#0E7C7B',
  amber: '#C3781F',
  violet: '#6E4CC9',
};

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function hexToRgba(hex: string, alpha: number) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function lerpColor(a: string, b: string, t: number) {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return `rgb(${Math.round(ar + (br - ar) * t)}, ${Math.round(ag + (bg - ag) * t)}, ${Math.round(ab + (bb - ab) * t)})`;
}

function clamp(v: number, min: number, max: number) { return Math.min(max, Math.max(min, v)); }

function seeded(seed: number) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

export default function TrialJourney() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const PH = PHASES;
    const contentEl = contentRef.current!;
    const railEl = railRef.current!;
    // build content and rail ticks via React render (JSX) — these refs exist
    // Canvas scene
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const count = PH.length;
    const rand = seeded(42);

    let width = 0, height = 0, dpr = 1;
    let nodes: any[] = [];
    let ambient: any[] = [];
    const trail: { x: number; y: number }[] = [];

    function buildScene() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      nodes = PH.map((phase, i) => {
        const t = count === 1 ? 0.5 : i / (count - 1);
        const sway = Math.sin(t * Math.PI * 1.4) * 0.16;
        const dendrites = Array.from({ length: 5 + Math.floor(rand() * 3) }).map(() => ({
          angle: rand() * Math.PI * 2,
          length: 18 + rand() * 26,
          wobble: rand() * Math.PI * 2,
        }));
        return { x: 0.5 + sway, y: 0.1 + t * 0.8, color: COLOR_HEX[phase.color], dendrites };
      });

      ambient = Array.from({ length: 46 }).map(() => ({ x: rand(), y: rand(), r: 0.6 + rand() * 1.4, phase: rand() * Math.PI * 2, speed: 0.2 + rand() * 0.4 }));
    }

    buildScene();

    let rafId = 0;
    let lastNow = 0;
    const progressState = { value: 0 };

    function pointAt(fraction: number) {
      const f = clamp(fraction, 0, count - 1);
      const i0 = Math.floor(f);
      const i1 = Math.min(i0 + 1, count - 1);
      const local = f - i0;
      const a = nodes[i0], b = nodes[i1];
      return { x: (a.x + (b.x - a.x) * local) * width, y: (a.y + (b.y - a.y) * local) * height };
    }

    function draw(now: number) {
      lastNow = now;
      ctx.clearRect(0, 0, width, height);
      const progress = progressState.value;
      // ambient
      ctx.save();
      for (const dot of ambient) {
        const drift = prefersReducedMotion ? 0 : Math.sin(now * 0.0005 * dot.speed + dot.phase);
        const x = dot.x * width;
        const y = dot.y * height + drift * 4;
        ctx.beginPath();
        ctx.fillStyle = 'rgba(20, 24, 27, 0.10)';
        ctx.arc(x, y, dot.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // spine
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const steps = 160;
      for (let s = 0; s < steps; s++) {
        const t0 = (s / steps) * (count - 1);
        const t1 = ((s + 1) / steps) * (count - 1);
        if (t0 / (count - 1) > progress / (count - 1)) break;
        const p0 = pointAt(t0);
        const p1 = pointAt(t1);
        const segIndex = Math.min(Math.floor(t0), count - 2);
        const segLocal = t0 - segIndex;
        const col = lerpColor(nodes[segIndex].color, nodes[Math.min(segIndex + 1, count - 1)].color, segLocal);
        ctx.strokeStyle = col;
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }

      // dormant continuation
      ctx.strokeStyle = '#C9CDCE';
      ctx.globalAlpha = 0.4;
      ctx.setLineDash([1, 7]);
      ctx.beginPath();
      const startAhead = pointAt(Math.max(progress, 0));
      ctx.moveTo(startAhead.x, startAhead.y);
      for (let s = 1; s <= steps; s++) {
        const t = (s / steps) * (count - 1);
        if (t < progress) continue;
        const p = pointAt(t);
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // nodes + dendrites
      nodes.forEach((node, i) => {
        const activation = clamp(1 - Math.abs(progress - i), 0, 1);
        const x = node.x * width, y = node.y * height;
        const pulse = prefersReducedMotion ? 0 : Math.sin(now * 0.004 + i) * 0.5 + 0.5;

        ctx.save();
        node.dendrites.forEach((d: any) => {
          const reach = d.length * (0.35 + activation * 0.9);
          const wob = prefersReducedMotion ? 0 : Math.sin(now * 0.002 + d.wobble) * 3;
          const ex = x + Math.cos(d.angle) * (reach + wob);
          const ey = y + Math.sin(d.angle) * (reach + wob);
          ctx.strokeStyle = activation > 0.05 ? node.color : '#E3E1DA';
          ctx.globalAlpha = 0.18 + activation * 0.4;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(ex, ey);
          ctx.stroke();
          if (activation > 0.15) {
            ctx.beginPath();
            ctx.fillStyle = node.color;
            ctx.globalAlpha = activation * 0.6;
            ctx.arc(ex, ey, 1.4, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        const glowR = 14 + activation * 22 + (prefersReducedMotion ? 0 : pulse * 4 * activation);
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowR);
        gradient.addColorStop(0, node.color);
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.globalAlpha = 0.35 * Math.max(activation, 0.12);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, glowR, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.fillStyle = activation > 0.05 ? node.color : '#C9CDCE';
        ctx.beginPath();
        ctx.arc(x, y, 4 + activation * 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
        ctx.restore();
      });

      // traveling signal + trail
      const head = pointAt(progress);
      const headColor = lerpColor(nodes[Math.min(Math.floor(progress), count - 1)].color, nodes[Math.min(Math.ceil(progress), count - 1)].color, progress % 1);
      trail.push({ x: head.x, y: head.y });
      if (trail.length > 24) trail.shift();
      ctx.save();
      trail.forEach((p, idx) => {
        const lifeFrac = idx / trail.length;
        ctx.globalAlpha = lifeFrac * 0.5;
        ctx.fillStyle = headColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1 + lifeFrac * 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
      const headGlow = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 16);
      headGlow.addColorStop(0, 'rgba(255,255,255,0.9)');
      headGlow.addColorStop(0.4, headColor);
      headGlow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = headGlow;
      ctx.beginPath();
      ctx.arc(head.x, head.y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(head.x, head.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function loop(now: number) {
      draw(now);
      rafId = requestAnimationFrame(loop);
    }

    function onResize() {
      buildScene();
    }

    // set wrapper height
      if (wrapperRef.current) wrapperRef.current.style.height = `${PH.length * 80}vh`;

    // scroll handling
    function updateProgress() {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      let progress = scrollable > 0 ? -rect.top / scrollable : 0;
      progress = Math.max(0, Math.min(1, progress));
      progressState.value = progress * (count - 1);
      const newActive = Math.round(progressState.value);
      if (newActive !== active) setActive(newActive);
    }

    function onScroll() {
      updateProgress();
    }

    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });

    // initial sizing and start
    buildScene();
    updateProgress();
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
    };
  }, [active]);

  return (
    <div>
      <style>{`
        :root{--ink:#14181b;--paper:#ffffff;--hairline:#e3e1da;--muted:#4b4f52;--dormant:#c9cdce}
        *{box-sizing:border-box}
        html,body{margin:0;padding:0;background:var(--paper);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',sans-serif}
        .intro{min-height:36vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem 1.5rem;border-bottom:1px solid var(--hairline)}
        .intro .eyebrow{font-family:ui-monospace,Menlo,monospace;font-size:.75rem;letter-spacing:.06em;color:var(--muted);margin-bottom:1rem}
        .intro h1{font-family:'Newsreader',Georgia,serif;font-weight:500;font-size:clamp(2rem,4.5vw,3.4rem);line-height:1.15;max-width:20ch;margin:0 0 1rem}
        .intro p{font-family:'Newsreader',Georgia,serif;color:var(--muted);max-width:40ch;line-height:1.6;margin:0}
        .wrapper{position:relative;width:100%;background:var(--paper)}
        .sticky-pane{position:sticky;top:0;height:100vh;width:46%;float:left;display:flex;align-items:center;justify-content:center;overflow:hidden}
        canvas#scene{width:100%;height:100%;display:block}
        .rail{position:absolute;left:2.5rem;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:2.75rem}
        .tick{width:6px;height:6px;border-radius:999px;background:#d8d6cf;transition:background-color .5s ease,transform .5s ease,box-shadow .5s ease}
        .tick.reached{transform:scale(1.6)}
        .content{width:54%;margin-left:46%}
        .section{min-height:80vh;display:flex;flex-direction:column;justify-content:center;padding:3.5rem 4.5rem 3.5rem 3rem;border-left:1px solid var(--hairline);opacity:.32;filter:saturate(.6);transform:translateX(4px);transition:opacity .6s ease,transform .6s ease,filter .6s ease,border-color .6s ease}
        .section.active{opacity:1;filter:saturate(1);transform:translateX(0)}
        .tag{font-family:ui-monospace,Menlo,monospace;font-size:.75rem;letter-spacing:.06em;color:var(--phase-color,#0e7c7b)}
        .title{margin:1rem 0 1rem;font-family:'Newsreader',Georgia,serif;font-weight:500;font-size:clamp(1.75rem,3vw,2.6rem);line-height:1.15;color:var(--ink);max-width:26ch}
        .description{font-family:'Newsreader',Georgia,serif;font-size:1.0625rem;line-height:1.6;color:var(--muted);max-width:46ch}
        .outro{min-height:30vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:2rem 1.5rem;color:var(--muted)}
        @media (max-width:860px){.sticky-pane{float:none;width:100%;height:42vh}.rail{left:1.25rem;flex-direction:row;top:auto;bottom:1.25rem;transform:none}.content{width:100%;margin-left:0}.section{min-height:auto;padding:2.25rem 1.5rem}}
      `}</style>

      <div className="intro">
        <div className="eyebrow">SCROLL TO BEGIN</div>
        <h1>The path from patient to trial.</h1>
        <p>Five phases, one continuous signal. Scroll to trace it.</p>
      </div>

      <div className="wrapper" id="wrapper" ref={wrapperRef}>
        <div className="sticky-pane">
          <canvas id="scene" ref={canvasRef} />
          <div className="rail" ref={railRef}>
            {PHASES.map((p, i) => (
              <div key={p.tag} className={`tick ${i <= active ? 'reached' : ''}`} style={{ ['--tick-color' as any]: COLOR_HEX[p.color] } as React.CSSProperties} />
            ))}
          </div>
        </div>
        <div className="content" id="content" ref={contentRef}>
          {PHASES.map((phase, i) => (
            <section key={phase.tag} className={`section ${i === active ? 'active' : ''}`} style={{ ['--phase-color' as any]: COLOR_HEX[phase.color] } as React.CSSProperties}>
              <span className="tag">{phase.tag}</span>
              <h3 className="title">{phase.title}</h3>
              <p className="description">{phase.description}</p>
            </section>
          ))}
        </div>
      </div>

      <div className="outro">
        <p>End of the journey — scroll back up to watch the signal retrace.</p>
      </div>
    </div>
  );
}
