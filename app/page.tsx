"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

const TICKER_ITEMS = [
  { sym: "MATHSOC",    val: "22,847.65", chg: "+1.24%" },
  { sym: "ENIGMA",     val: "75,312.09", chg: "+0.98%" },
  { sym: "MASTERSHOT", val: "48,201.30", chg: "-0.43%" },
  { sym: "GASMONKEYS", val: "2,934.00",  chg: "+2.11%" },
  { sym: "COGNITIA",   val: "158.75",    chg: "-1.07%" },
  { sym: "AUV",        val: "1,812.40",  chg: "+0.66%" },
  { sym: "BLOCKCHAIN", val: "1,723.55",  chg: "+1.88%" },
  { sym: "INSIGHT",    val: "435.20",    chg: "-0.22%" },
  { sym: "ERUDITE",    val: "817.90",    chg: "+3.01%" },
  { sym: "CELESTE",    val: "492.65",    chg: "-0.55%" },
];

function Ticker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="overflow-hidden border-t border-white/15 bg-black/70 backdrop-blur-sm py-2.5">
      <div className="flex ticker-scroll">
        {doubled.map((item, i) => (
          <span key={i} className="flex shrink-0 items-center gap-3 px-6">
            <span className="ticker-sym">{item.sym}</span>
            <span className="ticker-val">{item.val}</span>
            <span className={item.chg.startsWith("+") ? "ticker-chg-up" : "ticker-chg-dn"}>
              {item.chg}
            </span>
            <span className="ticker-sep">&middot;</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Chart line generation for loading screen ── */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateChartPath(w: number, h: number, points: number): string {
  const rng = seededRandom(42);
  const step = w / (points - 1);
  const pts: [number, number][] = [];
  let y = h * 0.5;
  for (let i = 0; i < points; i++) {
    y += (rng() - 0.42) * (h * 0.18);
    y = Math.max(h * 0.1, Math.min(h * 0.9, y));
    pts.push([i * step, y]);
  }
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const cp1x = pts[i - 1][0] + step * 0.4;
    const cp1y = pts[i - 1][1];
    const cp2x = pts[i][0] - step * 0.4;
    const cp2y = pts[i][1];
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pts[i][0]} ${pts[i][1]}`;
  }
  return d;
}

function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0); // 0=boot 1=chart 2=text 3=exit
  const [scrambledText, setScrambledText] = useState("MCSE");
  const rafRef = useRef<number>(0);
  const scrambleRef = useRef<number>(0);

  const chartPath = useMemo(() => generateChartPath(600, 120, 30), []);

  // Phase timeline
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase(1), 200));   // chart draws
    timers.push(setTimeout(() => setPhase(2), 900));   // text reveals
    timers.push(setTimeout(() => setPhase(3), 2000));  // exit
    return () => timers.forEach(clearTimeout);
  }, []);

  // Progress bar
  useEffect(() => {
    const start = performance.now();
    const dur = 1800;
    const tick = (now: number) => {
      const pct = Math.min(100, ((now - start) / dur) * 100);
      setProgress(pct);
      if (pct < 100) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Text scramble effect
  useEffect(() => {
    if (phase < 2) return;
    const target = "MCSE";
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%";
    let iteration = 0;
    const maxIterations = 12;
    const run = () => {
      const result = target.split("").map((char, i) => {
        if (iteration / 3 > i) return char;
        return chars[Math.floor(Math.random() * chars.length)];
      }).join("");
      setScrambledText(result);
      iteration++;
      if (iteration < maxIterations) {
        scrambleRef.current = window.setTimeout(run, 50);
      }
    };
    run();
    return () => clearTimeout(scrambleRef.current);
  }, [phase]);

  // Exit
  useEffect(() => {
    if (phase !== 3) return;
    const t = setTimeout(onDone, 600);
    return () => clearTimeout(t);
  }, [phase, onDone]);

  return (
    <div className={`ld-screen${phase === 3 ? " ld-exit" : ""}`}>
      <div className="ld-grain" />

      {/* Scan line */}
      <div className="ld-scanline" />

      {/* Grid lines */}
      <div className="ld-grid" />

      <div className="ld-inner">
        {/* Rapid data flash at boot */}
        <div className={`ld-dataflash ${phase >= 1 ? "ld-dataflash-done" : ""}`}>
          {["SYS.INIT", "LOAD MARKET_DATA", "CONNECT EXCHANGE", "VERIFY PROTOCOL"].map((line, i) => (
            <div key={i} className="ld-dataline" style={{ animationDelay: `${i * 120}ms` }}>
              <span className="ld-dataline-prefix">&gt;</span> {line}
              <span className="ld-dataline-ok" style={{ animationDelay: `${i * 120 + 80}ms` }}>OK</span>
            </div>
          ))}
        </div>

        {/* Chart SVG */}
        <div className={`ld-chart ${phase >= 1 ? "ld-chart-visible" : ""}`}>
          <svg viewBox="0 0 600 120" fill="none" className="w-full h-full">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            {/* Area fill */}
            <path
              d={`${chartPath} L 600 120 L 0 120 Z`}
              fill="url(#chartGrad)"
              className="ld-chart-area"
            />
            {/* Line */}
            <path
              d={chartPath}
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="1.5"
              className="ld-chart-line"
            />
          </svg>
        </div>

        {/* MCSE title */}
        <div className={`ld-title-row ${phase >= 2 ? "ld-title-visible" : ""}`}>
          <p className="ld-mcse">{scrambledText}</p>
          <p className="ld-subtitle">MATH CLUB STOCK EXCHANGE</p>
        </div>

        {/* Progress */}
        <div className="ld-progress-wrap">
          <div className="ld-progress-track">
            <div className="ld-progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <span className="ld-progress-pct">{Math.floor(progress)}%</span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [days,  setDays]  = useState(0);
  const [hours, setHours] = useState(0);
  const [mins,  setMins]  = useState(0);
  const [secs,  setSecs]  = useState(0);

  const handleDone = useCallback(() => {
    setLoading(false);
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    const target = new Date("2026-04-24T20:30:00+05:30");
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) return;
      setSecs(Math.floor((diff / 1000) % 60));
      setMins(Math.floor((diff / 60000) % 60));
      setHours(Math.floor((diff / 3600000) % 24));
      setDays(Math.floor(diff / 86400000));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <>
      {loading && <LoadingScreen onDone={handleDone} />}

      <div className={`newspaper-page flex flex-col text-white transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>
        <div className="bg-photo" />
        <div className="grain-overlay" />

        <header className="relative z-10 shrink-0 px-6 sm:px-10 md:px-14 pt-6 md:pt-5">
          <div className="rule-double mb-4 md:mb-3" />

          <div className="flex items-center justify-between mb-3 md:mb-2">
            <Link href="https://www.mathsoc.club/" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 group">
              <Image src="/logo.png" alt="MathSoc" width={32} height={32}
                className="object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
              <span className="font-times text-[11px] text-white/65 group-hover:text-white/90 tracking-[0.18em] uppercase italic transition-colors">
                MathSoc
              </span>
            </Link>

            <Link href="https://www.mu-aeon.com/" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 group">
              <span className="font-times text-[11px] text-white/65 group-hover:text-white/90 tracking-[0.18em] uppercase italic transition-colors">
                Aeon
              </span>
              <Image src="/white.png" alt="Aeon" width={40} height={40}
                className="object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>

          <div className="text-center mb-2 md:mb-1.5">
            <h1 className="masthead-title">MCSE.IN</h1>
            <p className="font-times italic text-white/55 text-[12px] sm:text-[13px] tracking-[0.28em] mt-1.5 md:mt-1">
              Math Club Stock Exchange
            </p>
          </div>

          <div className="rule-single mb-0" />
          <div className="flex items-center justify-between py-1.5 md:py-1">
            <span className="font-times text-[10px] text-white/60 uppercase tracking-[0.18em]">Markets Open Soon</span>
            <span className="font-times italic text-[11px] text-white/70 tracking-[0.14em] hidden sm:block">
              &ldquo;Every dream has a price.&rdquo;
            </span>
            <span className="font-times text-[10px] text-white/60 uppercase tracking-[0.18em]">
              24&#8202;&ndash;&#8202;26 Apr &middot; &#8377;100 Entry
            </span>
          </div>
          <div className="rule-single" />
        </header>

        <main className="relative z-10 flex-1 flex flex-col px-6 sm:px-10 md:px-14 py-5 md:py-3 gap-5 md:gap-3 justify-between">

          <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x md:divide-white/12 gap-6 md:gap-0">

            <div className="md:pr-8">
              <p className="section-label mb-2 md:mb-1.5">About the Exchange</p>
              <p className="body-text">
                The Math Club Stock Exchange is a live trading simulation where
                participants compete across three days of open markets &mdash; buying,
                selling, and strategising for maximum returns.
              </p>
              <p className="body-text-dim mt-2 md:mt-1.5">
                Built for those who believe the market rewards the bold,
                the disciplined, and the relentless.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-3 md:gap-2.5 md:px-8 border-y md:border-y-0 border-white/12 py-6 md:py-0">
              <p className="section-label">Opening Bell In</p>
              <div className="flex gap-6 md:gap-8">
                {[
                  { label: "Days", val: days },
                  { label: "Hrs",  val: hours },
                  { label: "Min",  val: mins },
                  { label: "Sec",  val: secs },
                ].map(({ label, val }) => (
                  <div key={label} className="text-center">
                    <div className="masthead-countdown tabular-nums">{pad(val)}</div>
                    <div className="font-times text-[10px] tracking-[0.24em] text-white/55 uppercase mt-1">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:pl-10">
              <p className="section-label mb-2 md:mb-1.5">Event Details</p>
              <table className="w-full">
                <tbody>
                  {[
                    ["Dates",      "24 \u2013 26 April 2026"],
                    ["Time",       "8:30 PM onwards"],
                    ["Venue",      "Mahindra University"],
                    ["Entry Fee",  "\u20b9 100 per team"],
                    ["Prize Pool", "\u20b9 70,000 total"],
                    ["Format",     "Live Trading Sim"],
                  ].map(([k, v]) => (
                    <tr key={k} className="border-b border-white/10">
                      <td className="py-1.5 md:py-1 pr-4 font-times italic text-white/55 text-[12px] whitespace-nowrap">{k}</td>
                      <td className="py-1.5 md:py-1 font-times text-white/88 text-[13px]">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="rule-single mb-0" />
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-10 py-3 md:py-1.5">
              <p className="section-label md:hidden">Total Prize Pool</p>
              <p className="prize-display"><span className="rupee-sym">&#8377;</span>70,000</p>
              <Link
                href="https://www.mu-aeon.com/events?event=mcse"
                target="_blank"
                rel="noopener noreferrer"
                className="register-btn"
              >
                Register for MCSE &rarr;
              </Link>
            </div>
          </div>

        </main>

        <div className="relative z-10 shrink-0">
          <Ticker />
        </div>
      </div>
    </>
  );
}