import { useState, useEffect } from "react";
import bg from "../assets/bg.jpg"
import { useNavigate } from "react-router-dom";

export default function Home(){
const navigate = useNavigate();

const [cpo, setCpo] = useState({
  valueText: "-",
  changeText: "-",
  direction: "flat",
  subtitle: "",
})

useEffect(() => {
  (async() => {
    try{
      const res = await fetch("http://localhost:3000/api/cpo/trend");
      const data = await res.json();

      const val = data?.value_usd_per_metric_ton;
      const pct = data?.percent_change_mom;
      const date = data?.date;

      const valueText = val ? `$${Math.round(val)}/MT` : "—";

      const changeText = pct
          ? `${pct.toFixed(1)}% MoM`
          : "—";
      
      const direction = pct === 0 || pct === null ? "flat" : pct > 0 ? "up" : "down";
      const subtitle = date
          ? new Date(date).toLocaleString("en-IN", {
              month: "short",
              year: "2-digit",
            })
          : "";
           setCpo({ valueText, changeText, direction, subtitle });
    } catch(err) {
      console.log("error fetching CPO data : ", err)
    }
  })();
}, []);

function TrendCard({ title, value, change, direction = "up", subtitle }) {
  const isUp = direction === "up";
  const isDown = direction === "down";
  const isFlat = direction === "flat";

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/70 backdrop-blur p-4 hover:shadow-lg hover:shadow-black/20 transition-all">
      {/* Title */}
      <div className="text-slate-300 text-sm">{title}</div>

      {/* Value + Change */}
      <div className="mt-1 flex items-baseline gap-3">
        <div className="text-2xl md:text-3xl font-semibold text-white">{value}</div>

        <div
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium
          ${
            isUp
              ? "bg-emerald-500/15 text-emerald-400"
              : isDown
              ? "bg-rose-500/15 text-rose-400"
              : "bg-slate-500/15 text-slate-300"
          }`}
        >
          {/* Arrow icon */}
          {!isFlat && (
            <svg
              viewBox="0 0 20 20"
              className={`h-3.5 w-3.5 ${isUp ? "" : "rotate-180"}`}
              fill="currentColor"
            >
              <path d="M10 3l4.5 6h-3v8h-3V9h-3L10 3z" />
            </svg>
          )}
          <span>{change}</span>
        </div>
      </div>

      {/* Subtitle */}
      {subtitle && <div className="mt-1 text-xs text-slate-400">{subtitle}</div>}

      {/* Progress bar */}
      <div className="mt-4 h-1.5 rounded-full bg-slate-700/60 overflow-hidden">
        <div
          className={`h-full ${
            isUp
              ? "bg-emerald-500/70"
              : isDown
              ? "bg-rose-500/70"
              : "bg-slate-400/70"
          } transition-all`}
          style={{
            width: isUp ? "62%" : isDown ? "38%" : "50%",
          }}
        />
      </div>
    </div>
  );
}
return (
    <section
      className="relative flex items-center min-h-screen bg-cover bg-center text-white"
      style={{
        backgroundImage:
          `url(${bg})`,
      }}
    >
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>

      {/* Content */}
      <div className="relative z-10 px-6 py-16 text-left ml-0 mr-auto">

        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
          Welcome To Tarrif Sim
        </h1>

        <p className="text-slate-300 text-base md:text-lg mb-10 max-w-2xl">
        A smart simulator that shows what happens when India changes its palm-oil import duties. Watch how prices, imports, and farmer earnings shift, and explore balanced policies for both consumers and producers.
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <TrendCard
  title="Global CPO Price"
  value={cpo.valueText}
  change={cpo.changeText}
  direction={cpo.direction}
  subtitle={cpo.subtitle}
/>

<TrendCard
  title="Palm Oil Imports (India)"
  value="0.83 MMT"
  change="−16.3% MoM"
  direction="down"
  subtitle="Sept ’25 (SEA)"
/>

<TrendCard
  title="Retail Edible Oil (Palm, packed)"
  value="₹124.5/kg"
  change="—"
  direction="flat"
  subtitle="Latest all-India avg"
/>

<TrendCard
  title="Farmer FFB Price (indicative)"
  value="₹18,750/t"
  change="−10% since May"
  direction="down"
  subtitle="mid-’25"
/>

    </div>
      <button onClick={() => navigate("/input")} className="text-black text-6xl mt-4 h-16">Simulate Now!</button>
      </div>
    </section>
  );
}