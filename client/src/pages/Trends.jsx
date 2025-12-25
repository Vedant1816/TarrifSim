// src/pages/Trends.jsx
import React, { useMemo, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceDot,
} from "recharts";
import GlobalCPOChart from "../components/GlobalCPOChart";
import IndianProdChart from "../components/IndianProdChart";
import PieChart from "../components/PieChart";
import useScrollVisibility from "../hooks/useScrollVisibility";
import ChartBlock from "../components/ChartBlock";
// import ChartBlock from "../components/ChartBlock";

/* ---------- MOCK / HELPERS (unchanged) ---------- */

const BCD_DATE = ["Jan-2019", "Oct-2022", "Sept-2024", "May-2025"];
const BCD = [40, 0, 20, 10];


const fmtINR = (n) => (typeof n === "number" ? `₹${n.toLocaleString("en-IN")}` : n);
const fmtUSD = (n) => (typeof n === "number" ? `$${n.toLocaleString("en-US")}` : n);
const fmtPct = (n) => (typeof n === "number" ? `${n.toFixed(1)}%` : n);

function buildAnnualRows() {
  return BCD_DATE.map((year, i) => ({
    date: year,
    bcd: BCD[i],
  }));
}



/* ---------- Simple reveal wrapper ---------- */
function RevealOnScroll({ children, height = 340, offset = 120 }) {
  const { ref, visible } = useScrollVisibility(offset, true);
  return (
    <div ref={ref} className="mb-6">
      {!visible ? (
        <div style={{ height }} className="bg-slate-100 rounded-2xl shadow" />
      ) : (
        children
      )}
    </div>
  );
}

/* ---------- Page ---------- */
export default function Trends() {
  const rows = useMemo(buildAnnualRows, []);
  const last = rows[rows.length - 1];
  const prev = rows[rows.length - 2];

  const [globalCPO, setGlobalCPO] = React.useState({
    value: "-",
    change: "-",
    subtitle: "-",
    direction: "flat",
  });

  const [indianProd, setIndianProd] = React.useState({
    value: "-",
    change: "-",
    subtitle: "-",
    direction: "flat",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:3000/api/cpo/trend");
        const data = await res.json();
        const val = data?.value_usd_per_metric_ton;
        const pct = data?.percent_change_mom;
        const date = data?.date;
        const direction = pct == 0 || pct == null ? "flat" : pct > 0 ? "up" : "down";
        const value = val ? `$${Math.round(val)}/MT` : "—";
        const change = pct ? `${pct.toFixed(1)}% MoM` : "—";
        const subtitle = date
          ? new Date(date).toLocaleString("en-IN", { month: "short", year: "2-digit" })
          : "";
        setGlobalCPO({ value, change, subtitle, direction });
      } catch (err) {
        console.log("error(frontend) fetching Global CPO data : ", err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:3000/api/cpo/india-trend");
        const data = await res.json();

        const val = data?.value;
        const pch = data?.pch;
        const year = data?.year;

        const value = val ? `${val} MT` : "-";
        const change = pch ? `${Math.abs(pch).toFixed(2)}%` : "-";
        const subtitle = year ? year.replace("(P)", "").trim() : "";
        const direction = pch == 0 || pch == null ? "flat" : pch > 0 ? "up" : "down";

        setIndianProd({ value, change, subtitle, direction });
      } catch (e) {
        console.log("Error(frontend) fetching indian cpo prod data ", e);
      }
    })();
  }, []);

  const delta = (cur, prev) =>
    prev !== 0 && typeof cur === "number" && typeof prev === "number"
      ? ((cur - prev) / prev) * 100
      : 0;

  const dBCD = last.bcd - prev.bcd;

  const retailOilShare = [
    { name: "Palm Oil", value: 31.5 },
    { name: "Soybean Oil", value: 28 },
    { name: "Sunflower Oil", value: 17.5 },
    { name: "Mustard Oil", value: 12.5 },
    { name: "Others", value: 10.5 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">CPO Ecosystem — Annual Trends</h1>
          <p className="text-slate-600 mt-1">
            Key indicators over past years: Global CPO price, Domestic Production,
            Custom Duties and Market Split.
          </p>
        </header>

        {/* KPI Cards */}
        <div className="grid lg:grid-cols-5 sm:grid-cols-2 gap-4 mb-8">
          <KPI title="Global CPO Price" value={globalCPO.value} delta={parseFloat(globalCPO.change)} unit="%" direction={globalCPO.direction} />
          <KPI title="Domestic Production(MT)" value={parseFloat(indianProd.value).toLocaleString("en-IN")} delta={parseFloat(indianProd.change)} unit="%" direction={indianProd.direction} />
          <KPI title="Basic Custom Duty on CPO(India)" value={`${last.bcd.toFixed(1)}%`} delta={dBCD} unit="%" direction={dBCD > 0 ? "up" : dBCD < 0 ? "down" : "flat"} />
        </div>

        {/* Charts — rendered only when scrolled into view */}
        <RevealOnScroll>
          <GlobalCPOChart />
        </RevealOnScroll>

        <RevealOnScroll>
          <IndianProdChart />
        </RevealOnScroll>

        <RevealOnScroll>
          <ChartBlock 
             title = "Basic Customers Duty On CPO(India)" 
             data = {rows} dataKey = "bcd" 
             yTickFormatter={(v) => `${v.toLocaleString("en-US")}`}
             tooltipFormatter={(v, n) => [`${v.toLocaleString("en-US")}`, "India"]}
          />
          
        </RevealOnScroll>

        <RevealOnScroll>
          <PieChart
            title="Retail Edible Oil Market Share (India, 2025)"
            data={retailOilShare}
            innerRadius={70}
            valueFormatter={(n) => `${n}%`}
          />
        </RevealOnScroll>
      </div>
    </div>
  );
}

/* ---------------- UI Components ---------------- */

function KPI({ title, value, delta, unit, direction }) {
  const arrow = direction === "up" ? "▲" : direction === "down" ? "▼" : "–";
  const cls =
    direction === "up" ? "text-emerald-600" : direction === "down" ? "text-rose-600" : "text-slate-500";
  const label = unit === "pp"
    ? `${direction === "up" ? "+" : ""}${Number.isFinite(delta) ? delta.toFixed(1) : "0.0"} pp`
    : `${direction === "up" ? "+" : ""}${Number.isFinite(delta) ? delta.toFixed(1) : "0.0"}%`;

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      <div className="text-xs mt-1">
        <span className={`inline-flex items-center gap-1 font-medium ${cls}`}>
          {arrow} {label}
        </span>
      </div>
    </div>
  );
}
