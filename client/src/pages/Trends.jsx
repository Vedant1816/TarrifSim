// src/pages/Trends.jsx
import React, { useMemo } from "react";
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

/**
 * Annual Trends Dashboard
 * - Focus: past YEARS
 * - Series:
 *    1) Global CPO price (USD/MT)
 *    2) India Retail Edible Oil (₹/kg)
 *    3) CPI YoY (%)
 *    4) Customs Duty (BCD, %)
 *    5) Farmer FFB (₹/t)
 *
 * Replace MOCK_* arrays with your data (MPOC/World Bank for global, DoCA for retail,
 * MoSPI for CPI, CBIC notifications for BCD, state boards for FFB).
 *
 * Requirements: npm i recharts
 */

// ---------- MOCK DATA (annual; replace with your back-end feeds) ----------
const YEARS = [
  2016, 2017, 2018, 2019, 2020,
  2021, 2022, 2023, 2024, 2025,
];

// Global CPO, annual avg USD/MT (illustrative)
const MOCK_GLOBAL_CPO = [620, 680, 595, 560, 750, 1120, 1000, 900, 880, 940];

// India retail edible oil (₹/kg, national avg; illustrative)
const MOCK_RETAIL = [92, 96, 98, 100, 116, 145, 135, 128, 126, 124];

// CPI YoY % (headline or food proxy; illustrative)
const MOCK_CPI = [4.9, 3.6, 3.9, 4.8, 6.2, 5.1, 6.7, 5.7, 5.5, 5.6];

// Customs Duty (BCD) ad-valorem on assessable value (%; annual typical)
const MOCK_BCD = [7.5, 7.5, 7.5, 7.5, 5.0, 5.0, 5.0, 5.5, 12.0, 16.0];

// Farmer FFB prices (₹/t, indicative avg; illustrative)
const MOCK_FFB = [9500, 9800, 10050, 10200, 11000, 13500, 16000, 17500, 19500, 18750];

// ---------- HELPERS ----------
const fmtINR = (n) => (typeof n === "number" ? `₹${n.toLocaleString("en-IN")}` : n);
const fmtUSD = (n) => (typeof n === "number" ? `$${n.toLocaleString("en-US")}` : n);
const fmtPct = (n) => (typeof n === "number" ? `${n.toFixed(1)}%` : n);

function buildAnnualRows() {
  return YEARS.map((year, i) => ({
    year,
    globalCPO: MOCK_GLOBAL_CPO[i],
    retail: MOCK_RETAIL[i],
    cpi: MOCK_CPI[i],
    bcd: MOCK_BCD[i],
    ffb: MOCK_FFB[i],
  }));
}

export default function Trends() {
  const rows = useMemo(buildAnnualRows, []);
  const last = rows[rows.length - 1];
  const prev = rows[rows.length - 2];

  // Simple YoY deltas for KPI cards
  const delta = (cur, prev) =>
    prev !== 0 && typeof cur === "number" && typeof prev === "number"
      ? ((cur - prev) / prev) * 100
      : 0;

  const dGlobal = delta(last.globalCPO, prev.globalCPO);
  const dRetail = delta(last.retail, prev.retail);
  const dCPI = last.cpi - prev.cpi; // absolute pp change is more interpretable here
  const dBCD = last.bcd - prev.bcd; // percentage points
  const dFFB = delta(last.ffb, prev.ffb);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">CPO Ecosystem — Annual Trends</h1>
          <p className="text-slate-600 mt-1">
            Key indicators over past years: Global CPO price, Indian retail edible oil price, CPI, customs duties, and farmer FFB prices.
          </p>
        </header>

        {/* KPI Cards */}
        <div className="grid lg:grid-cols-5 sm:grid-cols-2 gap-4 mb-8">
          <KPI
            title="Global CPO"
            value={`${fmtUSD(last.globalCPO)}/MT`}
            delta={dGlobal}
            unit="%"
          />
          <KPI
            title="Retail Edible Oil"
            value={`${fmtINR(last.retail)}/kg`.replace(",","")}
            delta={dRetail}
            unit="%"
          />
          <KPI
            title="CPI (YoY)"
            value={`${last.cpi.toFixed(1)}%`}
            delta={dCPI}
            unit="pp"
          />
          <KPI
            title="BCD (Customs Duty)"
            value={`${last.bcd.toFixed(1)}%`}
            delta={dBCD}
            unit="pp"
          />
          <KPI
            title="Farmer FFB"
            value={`${fmtINR(last.ffb)}/t`}
            delta={dFFB}
            unit="%"
          />
        </div>

        {/* Charts */}
        <ChartBlock
          title="Global CPO Price (USD/MT)"
          data={rows}
          dataKey="globalCPO"
          yTickFormatter={fmtUSD}
          lineColor="#0ea5e9" // sky-500
          tooltipFmt={(v, n) => [fmtUSD(v), n]}
        />

        <ChartBlock
          title="India Retail Edible Oil (₹/kg)"
          data={rows}
          dataKey="retail"
          yTickFormatter={(v) => `₹${v}`}
          lineColor="#059669" // emerald-600
          tooltipFmt={(v, n) => [`₹${(+v).toFixed(2)}`, n]}
        />

        <ChartBlock
          title="CPI (YoY, %)"
          data={rows}
          dataKey="cpi"
          yTickFormatter={(v) => `${v}%`}
          lineColor="#f59e0b" // amber-500
          tooltipFmt={(v, n) => [`${(+v).toFixed(1)}%`, n]}
        />

        <ChartBlock
          title="Customs Duty (BCD, %)"
          data={rows}
          dataKey="bcd"
          yTickFormatter={(v) => `${v}%`}
          lineColor="#dc2626" // red-600
          tooltipFmt={(v, n) => [`${(+v).toFixed(1)}%`, n]}
          emphasizeLast
        />

        <ChartBlock
          title="Farmer FFB Price (₹/t)"
          data={rows}
          dataKey="ffb"
          yTickFormatter={(v) => `₹${v.toLocaleString("en-IN")}`}
          lineColor="#7c3aed" // violet-600
          tooltipFmt={(v, n) => [fmtINR(v), n]}
        />
      </div>
    </div>
  );
}

/* ---------------- UI Components ---------------- */

function KPI({ title, value, delta, unit }) {
  const arrow = delta > 0 ? "▲" : delta < 0 ? "▼" : "–";
  const cls =
    delta > 0 ? "text-emerald-600" : delta < 0 ? "text-rose-600" : "text-slate-500";
  const label =
    unit === "pp"
      ? `${delta > 0 ? "+" : ""}${delta.toFixed(1)} pp`
      : `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%`;

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      <div className="text-xs mt-1">
        <span className={`inline-flex items-center gap-1 font-medium ${cls}`}>
          {arrow} {label} YoY
        </span>
      </div>
    </div>
  );
}

function ChartBlock({
  title,
  data,
  dataKey,
  yTickFormatter,
  tooltipFmt,
  lineColor = "#334155",
  emphasizeLast = false,
}) {
  const last = data[data.length - 1];
  return (
    <div className="bg-white rounded-2xl shadow p-4 mb-6">
      <div className="font-semibold mb-2">{title}</div>
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={data} margin={{ top: 10, right: 24, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => String(v)}
            axisLine={false}
          />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={yTickFormatter} axisLine={false} />
          <Tooltip formatter={tooltipFmt} />
          <Legend />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={lineColor}
            strokeWidth={2.4}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          {emphasizeLast && (
            <ReferenceDot
              x={last.year}
              y={last[dataKey]}
              r={5}
              fill={lineColor}
              stroke="white"
              strokeWidth={2}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
