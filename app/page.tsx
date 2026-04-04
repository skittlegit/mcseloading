"use client";

import { useEffect, useState, useCallback } from "react";
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

function CandlestickSVG({ className }: { className?: string }) {
  const candles = [
    { x: 10,  open: 70, close: 40, high: 30, low: 80 },
    { x: 28,  open: 42, close: 20, high: 12, low: 50 },
    { x: 46,  open: 22, close: 55, high: 14, low: 62 },
    { x: 64,  open: 53, close: 30, high: 22, low: 60 },
    { x: 82,  open: 32, close: 65, high: 20, low: 72 },
    { x: 100, open: 63, close: 45, high: 38, low: 70 },
    { x: 118, open: 47, close: 75, high: 36, low: 82 },
    { x: 136, open: 73, close: 38, high: 28, low: 80 },
  ];
  return (
    <svg viewBox="0 0 160 100" className={className} fill="none">
      {candles.map((c, i) => {
        const bull = c.close < c.open;
        const color = bull ? "#c8c8c8" : "#666";
        const bodyTop = Math.min(c.open, c.close);
        const bodyH = Math.abs(c.open - c.close);
        return (
          <g key={i}>
            <line x1={c.x + 5} y1={c.high} x2={c.x + 5} y2={c.low} stroke={color} strokeWidth="0.8" />
            <rect x={c.x} y={bodyTop} width="10" height={bodyH} fill={color} fillOpacity="0.55" />
          </g>
        );
      })}
    </svg>
  );
}

function Ticker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="overflow-hidden border-t border-white/15 bg-black/70 backdrop-blur-sm py-2.5">
      <div className="flex ticker-scroll">
        {doubled.map((item, i) => (
          <span key={i} className="flex shrink-0 items-center gap-3 px-6 font-mono text-[11px] tracking-widest">
            <span className="text-white/50">{item.sym}</span>
            <span className="text-white/80">{item.val}</span>
            <span className={item.chg.startsWith("+") ? "text-white/60" : "text-white/40"}>
              {item.chg}
            </span>
            <span className="text-white/20 mx-1">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 350);
    const t2 = setTimeout(() => setStep(2), 850);
    const t3 = setTimeout(() => setExiting(true), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    if (!exiting) return;
    const t = setTimeout(onDone, 600);
    return () => clearTimeout(t);
  }, [exiting, onDone]);

  return (
    <div className={`ld-screen${exiting ? " ld-exit" : ""}`}>
      <div className="ld-grain" />

      <div className="ld-inner">
        <div className="ld-top-rule" />

        <div className="ld-corners">
          <span className="ld-corner-text">MathSoc × Aeon</span>
          <span className="ld-corner-text">Est. 2026</span>
        </div>

        <div className={`ld-title-wrap${step >= 1 ? " ld-show" : ""}`}>
          <h1 className="ld-title">MCSE.IN</h1>
          <p className="ld-subtitle">Math Club Stock Exchange</p>
        </div>

        <div className={`ld-status-row${step >= 2 ? " ld-show" : ""}`}>
          <span className="ld-status-label">Opening Markets</span>
          <span className="ld-dots">
            <span className="ld-dot" style={{ animationDelay: "0s" }} />
            <span className="ld-dot" style={{ animationDelay: "0.28s" }} />
            <span className="ld-dot" style={{ animationDelay: "0.56s" }} />
          </span>
        </div>

        <div className="ld-bottom-rule" />

        <div className={`ld-prize-strip${step >= 2 ? " ld-show" : ""}`}>
          <span className="ld-prize-label">Prize Pool</span>
          <span className="ld-prize-val">₹ 70,000</span>
          <span className="ld-prize-label">24 – 26 Apr 2026</span>
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

      <div className={`newspaper-page min-h-screen flex flex-col text-white transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>
        <div className="bg-photo" />
        <div className="grain-overlay" />

        <header className="relative z-10 px-6 sm:px-10 md:px-16 pt-8 md:pt-10">
          <div className="rule-double mb-6" />

          <div className="flex items-center justify-between mb-6">
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

          <div className="text-center mb-5">
            <h1 className="masthead-title">MCSE.IN</h1>
            <p className="font-times italic text-white/55 text-[12px] sm:text-[13px] tracking-[0.28em] mt-2">
              Math Club Stock Exchange
            </p>
          </div>

          <div className="rule-single mb-0" />
          <div className="flex items-center justify-between py-2.5">
            <span className="font-times text-[11px] text-white/60 uppercase tracking-[0.18em]">Markets Open Soon</span>
            <span className="font-times italic text-[12px] text-white/70 tracking-[0.14em] hidden sm:block">
              &ldquo;Every dream has a price.&rdquo;
            </span>
            <span className="font-times text-[11px] text-white/60 uppercase tracking-[0.18em]">24‒26 Apr · ₹100 Entry</span>
          </div>
          <div className="rule-single" />
        </header>

        <main className="relative z-10 flex-1 flex flex-col px-6 sm:px-10 md:px-16 pt-10 pb-10 gap-10">

          <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x md:divide-white/12 gap-10 md:gap-0">

            <div className="md:pr-10">
              <p className="section-label mb-4">About the Exchange</p>
              <p className="body-text">
                The Math Club Stock Exchange is a live trading simulation event where
                participants compete across three days of open markets — buying,
                selling, and strategising for maximum returns.
              </p>
              <p className="body-text-dim mt-4">
                A floor like no other. Built for those who believe the market
                rewards the bold, the disciplined, and the relentless.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-6 md:px-10 border-y md:border-y-0 border-white/12 py-10 md:py-0">
              <p className="section-label">Opening Bell In</p>
              <div className="flex gap-8 md:gap-10">
                {[
                  { label: "Days", val: days },
                  { label: "Hrs",  val: hours },
                  { label: "Min",  val: mins },
                  { label: "Sec",  val: secs },
                ].map(({ label, val }) => (
                  <div key={label} className="text-center">
                    <div className="masthead-countdown tabular-nums">{pad(val)}</div>
                    <div className="font-times text-[11px] tracking-[0.28em] text-white/60 uppercase mt-2">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
              <CandlestickSVG className="w-36 sm:w-40 opacity-25 mt-2" />
            </div>

            <div className="md:pl-10">
              <p className="section-label mb-4">Event Details</p>
              <table className="w-full font-times">
                <tbody>
                  {[
                    ["Dates",     "24 – 26 April 2026"],
                    ["Time",      "8:30 PM onwards"],
                    ["Venue",     "Mahindra University"],
                    ["Entry Fee", "₹ 100 per team"],
                    ["Prize Pool","₹ 70,000 total"],
                    ["Format",    "Live Trading Sim"],
                  ].map(([k, v]) => (
                    <tr key={k} className="border-b border-white/10">
                      <td className="py-2.5 pr-4 text-white/55 italic text-[12px] whitespace-nowrap">{k}</td>
                      <td className="py-2.5 text-white/88 text-[14px]">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rule-single" />

          <div className="flex flex-col items-center text-center gap-5 py-4">
            <p className="font-times italic text-[12px] tracking-[0.32em] text-white/55 uppercase">
              Total Prize Pool
            </p>
            <p className="prize-display">₹70,000</p>
            <Link
              href="https://www.mu-aeon.com/events?event=mcse"
              target="_blank"
              rel="noopener noreferrer"
              className="register-btn"
            >
              Register for MCSE &rarr;
            </Link>
          </div>

        </main>

        <div className="relative z-10">
          <Ticker />
        </div>
      </div>
    </>
  );
}
