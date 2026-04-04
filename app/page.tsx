"use client";

import { useEffect, useState } from "react";

const TICKER_ITEMS = [
  { sym: "NIFTY50",    val: "22,847.65", chg: "+1.24%" },
  { sym: "SENSEX",     val: "75,312.09", chg: "+0.98%" },
  { sym: "BANKNIFTY",  val: "48,201.30", chg: "-0.43%" },
  { sym: "RELIANCE",   val: "2,934.00",  chg: "+2.11%" },
  { sym: "TATASTEEL",  val: "158.75",    chg: "-1.07%" },
  { sym: "INFY",       val: "1,812.40",  chg: "+0.66%" },
  { sym: "HDFC",       val: "1,723.55",  chg: "+1.88%" },
  { sym: "ITC",        val: "435.20",    chg: "-0.22%" },
  { sym: "SBIN",       val: "817.90",    chg: "+3.01%" },
  { sym: "WIPRO",      val: "492.65",    chg: "-0.55%" },
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
        const color = bull ? "#d4d4d4" : "#737373";
        const bodyTop = Math.min(c.open, c.close);
        const bodyH   = Math.abs(c.open - c.close);
        return (
          <g key={i}>
            <line x1={c.x+5} y1={c.high} x2={c.x+5} y2={c.low} stroke={color} strokeWidth="0.8" />
            <rect x={c.x} y={bodyTop} width="10" height={bodyH} fill={color} fillOpacity="0.6" />
          </g>
        );
      })}
    </svg>
  );
}

function Ticker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="overflow-hidden border-t border-white/20 bg-black/70 backdrop-blur-sm py-1.5">
      <div className="flex ticker-scroll">
        {doubled.map((item, i) => (
          <span key={i} className="flex shrink-0 items-center gap-2 px-5 font-mono text-[10px] tracking-widest">
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

export default function Home() {
  const [days, setDays]   = useState(0);
  const [hours, setHours] = useState(0);
  const [mins, setMins]   = useState(0);
  const [secs, setSecs]   = useState(0);

  useEffect(() => {
    const target = new Date("2026-04-24T09:00:00+05:30");
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
    <div className="newspaper-page min-h-screen flex flex-col text-white overflow-hidden">
      {/* Background photo layer */}
      <div className="bg-photo" />
      {/* Grain overlay */}
      <div className="grain-overlay" />

      {/* ── HEADER ─────────────────────────────────── */}
      <header className="relative z-10 px-6 md:px-12 pt-8 pb-0">
        {/* Top rule */}
        <div className="rule-double mb-4" />

        {/* Top meta row */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-times text-[11px] text-white/50 tracking-widest uppercase italic">
            Vol. I — Est. 2026
          </span>
          <span className="font-times text-[11px] text-white/50 tracking-widest uppercase italic">
            24–26 April · Entry ₹100
          </span>
        </div>

        {/* ─── MASTHEAD ─── */}
        <div className="text-center py-4">
          <h1 className="masthead-title">
            MCSE.IN
          </h1>
          <p className="font-times italic text-white/50 text-sm tracking-widest mt-1">
            Mock Capital Stock Exchange
          </p>
        </div>

        <div className="rule-single mt-4 mb-3" />

        {/* Dateline row */}
        <div className="flex items-center justify-between">
          <span className="font-times text-[10px] text-white/40 uppercase tracking-widest">
            Markets Open Soon
          </span>
          <span className="font-times text-[10px] text-white/40 uppercase tracking-widest">
            Prize Pool — ₹70,000
          </span>
        </div>

        <div className="rule-single mt-3" />
      </header>

      {/* ── BODY ───────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col px-6 md:px-12 py-8 gap-8">

        {/* Deck quote — secondary, not centrepiece */}
        <div className="flex items-center gap-4">
          <div className="rule-single flex-1" />
          <p className="font-times italic text-white/40 text-xs tracking-widest whitespace-nowrap">
            &ldquo;Every dream has a price.&rdquo;
          </p>
          <div className="rule-single flex-1" />
        </div>

        {/* Three-column editorial layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:divide-x md:divide-white/15">

          {/* Column 1 — About */}
          <div className="md:pr-8 pb-6 md:pb-0">
            <p className="font-times font-bold text-[11px] uppercase tracking-[0.2em] text-white/50 mb-3">
              About the Exchange
            </p>
            <p className="font-times text-sm text-white/70 leading-relaxed">
              The Mock Capital Stock Exchange is a live trading simulation event
              where participants compete across three days of open markets —
              buying, selling, and strategising for maximum returns.
            </p>
            <p className="font-times text-sm text-white/50 leading-relaxed mt-3">
              A floor like no other. Built for those who believe the market
              rewards the bold, the disciplined, and the relentless.
            </p>
          </div>

          {/* Column 2 — Countdown */}
          <div className="py-6 md:py-0 md:px-8 border-t border-b md:border-t-0 md:border-b-0 border-white/15 flex flex-col items-center justify-center gap-6">
            <p className="font-times font-bold text-[11px] uppercase tracking-[0.2em] text-white/50">
              Opening Bell In
            </p>
            <div className="flex gap-6 md:gap-8">
              {[
                { label: "Days",  val: days },
                { label: "Hrs",   val: hours },
                { label: "Min",   val: mins },
                { label: "Sec",   val: secs },
              ].map(({ label, val }) => (
                <div key={label} className="text-center">
                  <div className="masthead-countdown tabular-nums">{pad(val)}</div>
                  <div className="font-times text-[9px] tracking-[0.3em] text-white/40 uppercase mt-1">
                    {label}
                  </div>
                </div>
              ))}
            </div>
            <CandlestickSVG className="w-40 opacity-25 mt-2" />
          </div>

          {/* Column 3 — Event details */}
          <div className="md:pl-8 pt-6 md:pt-0">
            <p className="font-times font-bold text-[11px] uppercase tracking-[0.2em] text-white/50 mb-3">
              Event Bulletin
            </p>
            <table className="w-full font-times text-sm">
              <tbody className="text-white/70">
                {[
                  ["Dates",     "24 – 26 April 2026"],
                  ["Entry Fee", "₹ 100"],
                  ["Prize",     "₹ 70,000 Pool"],
                  ["Format",    "Live Trading Sim"],
                  ["Platform",  "mcse.in"],
                ].map(([k, v]) => (
                  <tr key={k} className="border-b border-white/10">
                    <td className="py-2 pr-4 text-white/40 italic text-xs whitespace-nowrap">{k}</td>
                    <td className="py-2 text-white/75">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rule-single" />

        {/* Prize callout — spread across full width */}
        <div className="text-center">
          <p className="font-times italic text-[10px] tracking-[0.35em] text-white/35 uppercase mb-1">
            Total Prize Pool
          </p>
          <p className="prize-display">₹70000</p>
        </div>
      </main>

      {/* ── TICKER ─────────────────────────────────── */}
      <div className="relative z-10">
        <Ticker />
      </div>
    </div>
  );
}
