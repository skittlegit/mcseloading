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

function Socials() {
  const links = [
    {
      href: "https://www.instagram.com/mathsoc.mu/",
      label: "Instagram",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      href: "https://x.com/mumathsoc",
      label: "X / Twitter",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      href: "https://www.linkedin.com/company/mathematics-club-mu/",
      label: "LinkedIn",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
  ];
  return (
    <div className="flex items-center gap-4">
      {links.map(({ href, label, icon }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="text-white/40 hover:text-white/75 transition-colors"
        >
          {icon}
        </a>
      ))}
    </div>
  );
}

function TradeWidget() {
  const [idx, setIdx] = useState(0);
  const [price, setPrice] = useState(() =>
    parseFloat(TICKER_ITEMS[0].val.replace(/,/g, ""))
  );
  const [flash, setFlash] = useState<{ action: "BUY" | "SELL"; price: string } | null>(null);
  const [trades, setTrades] = useState(0);
  const flashRef = useRef<number | null>(null);

  const item = TICKER_ITEMS[idx];

  useEffect(() => {
    const base = parseFloat(TICKER_ITEMS[idx].val.replace(/,/g, ""));
    const id = setInterval(() => {
      setPrice((p) => {
        const delta = (Math.random() - 0.5) * base * 0.0025;
        return Math.max(base * 0.97, Math.min(base * 1.03, p + delta));
      });
    }, 700);
    return () => clearInterval(id);
  }, [idx]);

  const fmt = (n: number) =>
    n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const execute = (action: "BUY" | "SELL") => {
    if (flash) return;
    setTrades((t) => t + 1);
    setFlash({ action, price: fmt(price) });
    if (flashRef.current) clearTimeout(flashRef.current);
    flashRef.current = window.setTimeout(() => {
      setFlash(null);
      setIdx((i) => (i + 1) % TICKER_ITEMS.length);
    }, 1100);
  };

  return (
    <div className="mt-4 md:mt-3 border-t border-white/10 pt-3 w-full max-w-60">
      {/* Symbol + price row */}
      <div className="flex items-baseline justify-between mb-2.5">
        <span className="font-monument text-[9px] tracking-[0.2em] text-white/45">{item.sym}</span>
        <span className="font-times tabular-nums text-[13px] text-white/85 transition-all duration-300">
          ₹{fmt(price)}
        </span>
        <span className={`font-times text-[10px] ${item.chg.startsWith("+") ? "text-white/45" : "text-white/28"}`}>
          {item.chg}
        </span>
      </div>

      {/* Action area */}
      {flash ? (
        <div className={`text-center py-2 font-times text-[11px] tracking-[0.18em] uppercase transition-opacity duration-200 ${flash.action === "BUY" ? "text-white/90" : "text-white/40"}`}>
          {flash.action} · ₹{flash.price}
        </div>
      ) : (
        <div className="flex gap-1.5">
          <button onClick={() => execute("BUY")} className="trade-btn-buy flex-1">Buy</button>
          <button onClick={() => execute("SELL")} className="trade-btn-sell flex-1">Sell</button>
        </div>
      )}

      {/* Counter */}
      {trades > 0 && (
        <p className="font-times text-[9px] text-white/22 text-center mt-2 tracking-[0.16em] uppercase">
          {trades} order{trades !== 1 ? "s" : ""} placed
        </p>
      )}
    </div>
  );
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
            <Link href="https://www.mathsoc.in/" target="_blank" rel="noopener noreferrer"
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
          {/* Mobile: socials on own row; Desktop: inline between the two text items */}
          <div className="flex items-center justify-between py-1.5 md:py-1">
            <span className="font-times text-[10px] text-white/60 uppercase tracking-[0.18em]">Markets Open Soon</span>
            <span className="hidden md:block"><Socials /></span>
            <span className="font-times text-[10px] text-white/60 uppercase tracking-[0.18em]">
              24&#8202;&ndash;&#8202;26 Apr &middot; &#8377;100 Entry
            </span>
          </div>
          {/* Socials row — mobile only, sits between rule lines */}
          <div className="flex justify-center py-2 md:hidden border-t border-white/10">
            <Socials />
          </div>
          <div className="rule-single" />
        </header>

        <main className="relative z-10 flex-1 flex flex-col md:grid md:grid-cols-3 md:grid-rows-[1fr_auto] px-6 sm:px-10 md:px-14 pt-5 md:pt-3 pb-5 md:pb-0 gap-5 md:gap-0">

          {/* About — col 1, row 1 on desktop */}
          <div className="order-1 md:pr-8 md:col-start-1 md:row-start-1 md:self-start">
            <p className="section-label mb-3 md:mb-2">The Exchange</p>
            <p className="body-text mb-4 md:mb-3">
              University clubs, listed as equities. Buy shares, trade live, collect returns.
            </p>
            <div>
              {([
                ["01", "Build your portfolio",    "30+ university clubs trade as live stocks"],
                ["02", "Trade across three days", "Markets open each evening. Prices shift with every session."],
                ["03", "Claim the prize pool",    "Top portfolios split ₹70,000 at settlement."],
              ] as [string, string, string][]).map(([num, title, desc]) => (
                <div key={num} className="flex gap-3 items-start border-t border-white/10 py-2 md:py-1.5">
                  <span className="font-times italic text-[11px] text-white/25 w-5 shrink-0 mt-0.5 leading-none">{num}</span>
                  <div>
                    <p className="font-times text-[12px] text-white/80 leading-snug">{title}</p>
                    <p className="font-times text-[11px] text-white/38 leading-snug mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Countdown — col 2, row 1 on desktop */}
          <div className="order-3 flex flex-col items-center justify-center gap-3 md:gap-2.5 md:px-8 border-y md:border-y-0 md:border-l md:border-white/12 py-6 md:py-0 md:col-start-2 md:row-start-1">
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
            <TradeWidget />
          </div>

          {/* Prize/Register — mobile: order 2 (above countdown), desktop: col 1–3, row 2 */}
          <div className="order-2 md:order-none md:col-start-1 md:col-end-4 md:row-start-2">
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

          {/* Event Details — mobile: order 4 (last, below prize), desktop: col 3, row 1 */}
          <div className="order-4 md:order-none md:pl-10 md:col-start-3 md:row-start-1 md:border-l md:border-white/12 md:self-start">
            <p className="section-label mb-2 md:mb-1.5">Event Details</p>
            <table className="w-full">
              <tbody>
                {[
                  ["Dates",      "24 \u2013 26 April 2026"],
                  ["Time",       "8:30 PM onwards"],
                  ["Venue",      "Mahindra University"],
                ].map(([k, v]) => (
                  <tr key={k} className="border-b border-white/10">
                    <td className="py-1.5 md:py-1 pr-4 font-times italic text-white/55 text-[12px] whitespace-nowrap">{k}</td>
                    <td className="py-1.5 md:py-1 font-times text-white/88 text-[13px]">{v}</td>
                  </tr>
                ))}
                <tr className="border-b border-white/10">
                  <td className="py-1.5 md:py-1 pr-4 font-times italic text-white/55 text-[12px] whitespace-nowrap">Entry Fee</td>
                  <td className="py-1.5 md:py-1 font-times text-white/88 text-[13px]">
                    <span>&#8377; 100 per person</span><br />
                    <span className="text-white/45 text-[11px]">Free for MU students</span>
                  </td>
                </tr>
                {[
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

        </main>

        <div className="relative z-10 shrink-0">
          <Ticker />
        </div>
      </div>
    </>
  );
}