"use client";

import { useEffect, useState, useCallback } from "react";

const TICKER_ITEMS = [
  { sym: "NIFTY50",   val: "22,847.65", chg: "+1.24%" },
  { sym: "SENSEX",    val: "75,312.09", chg: "+0.98%" },
  { sym: "BANKNIFTY", val: "48,201.30", chg: "-0.43%" },
  { sym: "RELIANCE",  val: "2,934.00",  chg: "+2.11%" },
  { sym: "TATASTEEL", val: "158.75",    chg: "-1.07%" },
  { sym: "INFY",      val: "1,812.40",  chg: "+0.66%" },
  { sym: "HDFC",      val: "1,723.55",  chg: "+1.88%" },
  { sym: "ITC",       val: "435.20",    chg: "-0.22%" },
  { sym: "SBIN",      val: "817.90",    chg: "+3.01%" },
  { sym: "WIPRO",     val: "492.65",    chg: "-0.55%" },
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
        const bodyH = Math.abs(c.open - c.close);
        return (
          <g key={i}>
            <line x1={c.x + 5} y1={c.high} x2={c.x + 5} y2={c.low} stroke={color} strokeWidth="0.8" />
            <rect x={c.x} y={bodyTop} width="10" height={bodyH} fill={color} fillOpacity="0.5" />
          </g>
        );
      })}
    </svg>
  );
}

function Ticker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="overflow-hidden border-t border-white/20 bg-black/80 backdrop-blur-sm py-2">
      <div className="flex ticker-scroll">
        {doubled.map((item, i) => (
          <span key={i} className="flex shrink-0 items-center gap-2 px-6 font-mono text-[10px] tracking-widest">
            <span className="text-white/45">{item.sym}</span>
            <span className="text-white/75">{item.val}</span>
            <span className={item.chg.startsWith("+") ? "text-white/55" : "text-white/35"}>
              {item.chg}
            </span>
            <span className="text-white/15 mx-2">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const hold = setTimeout(() => setExiting(true), 2000);
    return () => clearTimeout(hold);
  }, []);

  useEffect(() => {
    if (!exiting) return;
    const done = setTimeout(onDone, 700);
    return () => clearTimeout(done);
  }, [exiting, onDone]);

  return (
    <div className={`loading-screen ${exiting ? "loading-exit" : ""}`}>
      <div className="grain-overlay" style={{ opacity: 0.6 }} />
      <div className="loading-inner">
        <div className="loading-rule loading-rule-expand" />
        <h1 className="loading-title loading-fade-in">MCSE.IN</h1>
        <div className="loading-rule loading-rule-expand" style={{ animationDelay: "0.1s" }} />
        <p className="loading-sub loading-fade-in" style={{ animationDelay: "0.4s" }}>
          Opening Markets&nbsp;&nbsp;&middot;&nbsp;&nbsp;Please Wait
        </p>
        <div className="loading-candles loading-fade-in" style={{ animationDelay: "0.6s" }}>
          {[0.3,0.7,0.5,0.9,0.4,0.8,0.6,1.0,0.55,0.75].map((h, i) => (
            <div
              key={i}
              className="loading-bar"
              style={{
                height: `${h * 40}px`,
                animationDelay: `${0.6 + i * 0.07}s`,
                background: i % 3 === 0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)",
              }}
            />
          ))}
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
    const target = new Date("2026-04-24T08:30:00+05:30");
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

      <div className={`newspaper-page min-h-screen flex flex-col text-white overflow-hidden transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>
        <div className="bg-photo" />
        <div className="grain-overlay" />

        <header className="relative z-10 px-8 md:px-16 pt-10 pb-0">
          <div className="rule-double mb-5" />

          <div className="flex items-baseline justify-between mb-4">
            <span className="font-times text-[10px] text-white/40 tracking-[0.25em] uppercase italic">
              Vol. I &mdash; Est. 2026
            </span>
            <span className="font-times text-[10px] text-white/40 tracking-[0.25em] uppercase italic">
              24 &ndash; 26 April &nbsp;&middot;&nbsp; Entry ₹100
            </span>
          </div>

          <div className="text-center pt-2 pb-5">
            <h1 className="masthead-title">MCSE.IN</h1>
            <p className="font-times italic text-white/45 text-[13px] tracking-[0.3em] mt-2">
              Mock Capital Stock Exchange
            </p>
          </div>

          <div className="rule-single mb-3" />
          <div className="flex items-center justify-between py-2">
            <span className="font-times text-[10px] text-white/35 uppercase tracking-[0.22em]">
              Markets Open Soon
            </span>
            <span className="font-times italic text-[10px] text-white/35 tracking-[0.22em]">
              &ldquo;Every dream has a price.&rdquo;
            </span>
            <span className="font-times text-[10px] text-white/35 uppercase tracking-[0.22em]">
              Prize Pool &mdash; ₹70,000
            </span>
          </div>
          <div className="rule-single" />
        </header>

        <main className="relative z-10 flex-1 flex flex-col px-8 md:px-16 pt-10 pb-8 gap-10">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:divide-x md:divide-white/12">

            <div className="md:pr-10 pb-8 md:pb-0">
              <p className="font-times font-bold text-[10px] uppercase tracking-[0.22em] text-white/40 mb-4 pb-2 border-b border-white/10">
                About the Exchange
              </p>
              <p className="font-times text-[13px] text-white/65 leading-[1.75]">
                The Mock Capital Stock Exchange is a live trading simulation
                event where participants compete across three days of open
                markets — buying, selling, and strategising for maximum returns.
              </p>
              <p className="font-times text-[13px] text-white/40 leading-[1.75] mt-4">
                A floor like no other. Built for those who believe the market
                rewards the bold, the disciplined, and the relentless.
              </p>
            </div>

            <div className="py-8 md:py-0 md:px-10 border-t border-b md:border-0 border-white/12 flex flex-col items-center justify-center gap-7">
              <p className="font-times font-bold text-[10px] uppercase tracking-[0.22em] text-white/40">
                Opening Bell In
              </p>
              <div className="flex gap-8 md:gap-10">
                {[
                  { label: "Days", val: days },
                  { label: "Hrs",  val: hours },
                  { label: "Min",  val: mins },
                  { label: "Sec",  val: secs },
                ].map(({ label, val }) => (
                  <div key={label} className="text-center">
                    <div className="masthead-countdown tabular-nums">{pad(val)}</div>
                    <div className="font-times text-[9px] tracking-[0.3em] text-white/35 uppercase mt-2">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
              <CandlestickSVG className="w-36 opacity-20 mt-1" />
            </div>

            <div className="md:pl-10 pt-8 md:pt-0">
              <p className="font-times font-bold text-[10px] uppercase tracking-[0.22em] text-white/40 mb-4 pb-2 border-b border-white/10">
                Event Bulletin
              </p>
              <table className="w-full font-times">
                <tbody>
                  {[
                    ["Dates",     "24 – 26 April 2026"],
                    ["Time",      "8:30 AM onwards"],
                    ["Entry Fee", "₹ 100"],
                    ["Prize",     "₹ 70,000 Pool"],
                    ["Format",    "Live Trading Sim"],
                    ["Platform",  "mcse.in"],
                  ].map(([k, v]) => (
                    <tr key={k} className="border-b border-white/8">
                      <td className="py-2.5 pr-5 text-white/35 italic text-[11px] whitespace-nowrap">{k}</td>
                      <td className="py-2.5 text-white/70 text-[13px]">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rule-single" />

          <div className="text-center pb-2">
            <p className="font-times italic text-[10px] tracking-[0.4em] text-white/30 uppercase mb-2">
              Total Prize Pool
            </p>
            <p className="prize-display">₹70000</p>
          </div>
        </main>

        <div className="relative z-10">
          <Ticker />
        </div>
      </div>
    </>
  );
}
