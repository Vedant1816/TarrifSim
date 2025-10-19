// src/pages/Output.jsx
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
 * Scenario:
 * - Apply Scenario only AFTER 2025-10
 * - Show baseline up to 2025-10
 * - Show BOTH Baseline & Scenario between 2025-10 → 2025-11 to visualize the change
 * - Hardcoded Custom Duty (BCD) = 16%
 */

const SCENARIO = {
  asOf: new Date().toISOString(),
  r_BCD: 0.16, // 16%
  r_SWS: 0.10,
  r_AIDC: 0.05,
  fx_usd_inr: 84,
  fob_usd_per_t: 820,
  freight_usd_per_t: 35,
  insurance_usd_per_t: 0,
  local_logistics_inr_t: 1000,
  beta0: 10,
  beta1: 0.08,
  beta2: 2.5,
  CPI_now: 0.056,
};

// Baseline (for comparison)
const BASELINE = { r_BCD: 0.05, r_SWS: 0.10, r_AIDC: 0.05 };

// Bridge months
const BRIDGE_FROM = "2025-10";
const BRIDGE_TO = "2025-11";

// ---------- helpers ----------
const fmtINR = (n) => (typeof n === "number" ? `₹${n.toLocaleString("en-IN")}` : n);
const fmtKg = (n) => (typeof n === "number" ? `₹${n.toFixed(2)}/kg` : n);
const fmtPct = (n) => (typeof n === "number" ? `${n.toFixed(2)}%` : n);

function landedPriceINRperT({ fob, freight, ins, fx, rB, rS, rA, local }) {
  const CIF_usd = fob + freight + ins;
  const assessINR = CIF_usd * fx;
  const BCD = assessINR * rB;
  const SWS = BCD * rS;
  const AIDC = assessINR * rA;
  return assessINR + BCD + SWS + AIDC + local;
}

function retailRP({ LP_inr_t, CPI, beta0, beta1, beta2 }) {
  return beta0 + beta1 * (LP_inr_t / 1000) + beta2 * CPI;
}

// Build a baseline history ending at BRIDGE_FROM (2025-10)
function buildBaselineHistoryEndingAt({ months = 10, anchorMonthKey, anchorLP, anchorRP }) {
  // months = number of months BEFORE anchorMonthKey to include
  // We’ll generate chronological list: [..., anchorMonthKey]
  const out = [];
  const [y, m] = anchorMonthKey.split("-").map(Number);
  // Start from (anchor - months + 1), end at anchor
  const start = new Date(y, m - 1 - (months - 1), 1);
  let lp = anchorLP * 0.95;
  let rp = anchorRP * 0.97;

  for (let i = 0; i < months - 1; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const pullLP = (anchorLP - lp) * 0.05;
    const pullRP = (anchorRP - rp) * 0.05;
    const shockLP = (Math.random() - 0.5) * 800; // ±800
    const shockRP = (Math.random() - 0.5) * 1.0; // ±1.0

    // tiny upward drift, mean-reverting
    lp = lp * (1 + 0.002) + pullLP + shockLP;
    rp = rp * (1 + 0.0015) + pullRP + shockRP;

    out.push({
      month: d.toISOString().slice(0, 7),
      LP_base: Math.round(lp),
      RP_base: +rp.toFixed(2),
    });
  }

  // Push the anchor month as last baseline point exactly at anchors
  out.push({
    month: anchorMonthKey,
    LP_base: Math.round(anchorLP),
    RP_base: +anchorRP.toFixed(2),
  });

  return out;
}

export default function Output() {
  // ------- Baseline & Scenario (now) -------
  const LP_base_now = useMemo(
    () =>
      landedPriceINRperT({
        fob: SCENARIO.fob_usd_per_t,
        freight: SCENARIO.freight_usd_per_t,
        ins: SCENARIO.insurance_usd_per_t,
        fx: SCENARIO.fx_usd_inr,
        rB: BASELINE.r_BCD,
        rS: BASELINE.r_SWS,
        rA: BASELINE.r_AIDC,
        local: SCENARIO.local_logistics_inr_t,
      }),
    []
  );

  const LP_scn_now = useMemo(
    () =>
      landedPriceINRperT({
        fob: SCENARIO.fob_usd_per_t,
        freight: SCENARIO.freight_usd_per_t,
        ins: SCENARIO.insurance_usd_per_t,
        fx: SCENARIO.fx_usd_inr,
        rB: SCENARIO.r_BCD,
        rS: SCENARIO.r_SWS,
        rA: SCENARIO.r_AIDC,
        local: SCENARIO.local_logistics_inr_t,
      }),
    []
  );

  const RP_base_now = useMemo(
    () =>
      retailRP({
        LP_inr_t: LP_base_now,
        CPI: SCENARIO.CPI_now,
        beta0: SCENARIO.beta0,
        beta1: SCENARIO.beta1,
        beta2: SCENARIO.beta2,
      }),
    [LP_base_now]
  );

  const RP_scn_now = useMemo(
    () =>
      retailRP({
        LP_inr_t: LP_scn_now,
        CPI: SCENARIO.CPI_now,
        beta0: SCENARIO.beta0,
        beta1: SCENARIO.beta1,
        beta2: SCENARIO.beta2,
      }),
    [LP_scn_now]
  );

  // ------- Build timeline: baseline up to 2025-10, then 2025-11 baseline & scenario -------
  // 1) Build baseline history ending at 2025-10
  const baselineHistory = useMemo(
    () =>
      buildBaselineHistoryEndingAt({
        months: 10, // e.g., show 9 months before + the anchor month
        anchorMonthKey: BRIDGE_FROM,
        anchorLP: LP_base_now,
        anchorRP: RP_base_now,
      }),
    [LP_base_now, RP_base_now]
  );

  // 2) Create 2025-11 baseline projection (small natural drift from 2025-10)
  const LP_base_next = Math.round(LP_base_now * 1.0025);
  const RP_base_next = +(RP_base_now * 1.0015).toFixed(2);

  // 3) Compose the final series:
  //    - months < 2025-10: scenario = null
  //    - at 2025-10: scenario == baseline (to draw the starting point)
  //    - at 2025-11: baseline = projected; scenario = scenario_now (16% duty)
  const series = useMemo(() => {
    const arr = baselineHistory.map((row) => {
      if (row.month < BRIDGE_FROM) {
        return {
          month: row.month,
          LP_base: row.LP_base,
          RP_base: row.RP_base,
          LP_scn: null,
          RP_scn: null,
        };
      }
      // row.month === BRIDGE_FROM
      return {
        month: row.month,
        LP_base: row.LP_base,
        RP_base: row.RP_base,
        LP_scn: row.LP_base, // equal to baseline at 2025-10
        RP_scn: row.RP_base,
      };
    });

    // Append 2025-11 point with BOTH baseline projection and scenario value
    arr.push({
      month: BRIDGE_TO,
      LP_base: LP_base_next,
      RP_base: RP_base_next,
      LP_scn: LP_scn_now,
      RP_scn: +RP_scn_now.toFixed(2),
    });

    return arr;
  }, [baselineHistory, LP_base_next, RP_base_next, LP_scn_now, RP_scn_now]);

  // ------- Impacts (computed off "now" values) -------
  const lpDeltaPct = ((LP_scn_now - LP_base_now) / LP_base_now) * 100;
  const rpDeltaPct = ((RP_scn_now - RP_base_now) / RP_base_now) * 100;
  const importDeltaPct = -0.2 * (rpDeltaPct / 100) * 100; // toy
  const ffbDeltaPct = 0.3 * (lpDeltaPct / 100) * 100;     // toy

  const CIF_now_usd =
    SCENARIO.fob_usd_per_t + SCENARIO.freight_usd_per_t + SCENARIO.insurance_usd_per_t;
  const assessNow = CIF_now_usd * SCENARIO.fx_usd_inr;
  const dRate = SCENARIO.r_BCD - BASELINE.r_BCD;
  const extraBCD = assessNow * dRate;
  const extraSWS = extraBCD * SCENARIO.r_SWS;
  const fiscalPerTonne = Math.round(extraBCD + extraSWS);

  // ------- UI helpers -------
  const deltaInfo = (pct) => {
    if (pct > 0) return { arrow: "▲", cls: "text-emerald-600", label: `+${pct.toFixed(2)}%` };
    if (pct < 0) return { arrow: "▼", cls: "text-rose-600", label: `${pct.toFixed(2)}%` };
    return { arrow: "–", cls: "text-slate-500", label: "0.00%" };
  };
  const lpDelta = deltaInfo(lpDeltaPct);
  const rpDelta = deltaInfo(rpDeltaPct);
  const impDelta = deltaInfo(importDeltaPct);
  const ffbDelta = deltaInfo(ffbDeltaPct);

  const priceFormatterINR = (v) => (v ? fmtINR(Math.round(v)) : v);
  const priceFormatterKg = (v) => (v ? `₹${(+v).toFixed(2)}` : v);
  const tooltipFmtLP = (value, name) => [priceFormatterINR(value), name];
  const tooltipFmtRP = (value, name) => [priceFormatterKg(value), name];

  const scnColorLP = lpDeltaPct >= 0 ? "#059669" : "#dc2626"; // emerald/red
  const scnColorRP = rpDeltaPct >= 0 ? "#059669" : "#dc2626";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">CPO Duty Simulation — Output</h1>
          <p className="text-slate-600 mt-1">
            Baseline shown up to <span className="font-mono">{BRIDGE_FROM}</span>. Scenario (16% duty) applies from{" "}
            <span className="font-mono">{BRIDGE_TO}</span> with a visible bridge segment.
          </p>
        </header>

        {/* KPI Row */}
        <div className="grid lg:grid-cols-4 sm:grid-cols-2 gap-4 mb-8">
          <KPI
            title="Landed Price (now)"
            value={fmtINR(LP_scn_now) + " /t"}
            deltaClass={lpDelta.cls}
            deltaArrow={lpDelta.arrow}
            deltaText={lpDelta.label + " vs baseline"}
          />
          <KPI
            title="Retail Price (now)"
            value={fmtKg(RP_scn_now)}
            deltaClass={rpDelta.cls}
            deltaArrow={rpDelta.arrow}
            deltaText={rpDelta.label + " vs baseline"}
          />
          <KPI
            title="Imports (short-run)"
            value={fmtPct(importDeltaPct)}
            deltaClass={impDelta.cls}
            deltaArrow={impDelta.arrow}
            deltaText="elasticity −0.2 (illustrative)"
          />
          <KPI
            title="Farmer FFB (approx.)"
            value={fmtPct(ffbDeltaPct)}
            deltaClass={ffbDelta.cls}
            deltaArrow={ffbDelta.arrow}
            deltaText="0.3× landed pass-through"
          />
        </div>

        {/* Landed Price Chart */}
        <ChartCard title="Landed Price — Baseline (≤ 2025-10) vs Scenario Bridge (2025-10 → 2025-11)">
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={series} margin={{ top: 10, right: 24, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={priceFormatterINR} tick={{ fontSize: 12 }} />
              <Tooltip formatter={tooltipFmtLP} />
              <Legend />
              {/* Baseline across all points */}
              <Line
                type="monotone"
                dataKey="LP_base"
                name="Baseline LP"
                stroke="#334155" // slate-700
                strokeWidth={2.25}
                dot={false}
                activeDot={{ r: 4 }}
              />
              {/* Scenario only visible from 2025-10 (equal to base), then 2025-11 (jump) */}
              <Line
                type="monotone"
                dataKey="LP_scn"
                name="Scenario LP (16%)"
                stroke={scnColorLP}
                strokeWidth={3}
                dot={{ r: 3 }}
                connectNulls={false} // break line before 2025-10
              />
              {/* emphasize the end (2025-11) */}
              <ReferenceDot
                x={BRIDGE_TO}
                y={series[series.length - 1]?.LP_scn}
                r={5}
                fill={scnColorLP}
                stroke="white"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Retail Price Chart */}
        <ChartCard title="Retail Pass-through — Baseline (≤ 2025-10) vs Scenario Bridge (2025-10 → 2025-11)">
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={series} margin={{ top: 10, right: 24, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={priceFormatterKg} tick={{ fontSize: 12 }} />
              <Tooltip formatter={tooltipFmtRP} />
              <Legend />
              <Line
                type="monotone"
                dataKey="RP_base"
                name="Baseline RP"
                stroke="#0ea5e9" // sky-500
                strokeWidth={2.25}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="RP_scn"
                name="Scenario RP (16%)"
                stroke={scnColorRP}
                strokeWidth={3}
                dot={{ r: 3 }}
                connectNulls={false}
              />
              <ReferenceDot
                x={BRIDGE_TO}
                y={series[series.length - 1]?.RP_scn}
                r={5}
                fill={scnColorRP}
                stroke="white"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Summary table */}
        <div className="bg-white rounded-2xl shadow p-4 mb-10">
          <div className="font-semibold mb-2">Scenario Summary</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600">
                  <th className="py-2">Metric</th>
                  <th className="py-2">Baseline</th>
                  <th className="py-2">Scenario (16%)</th>
                  <th className="py-2">Change</th>
                </tr>
              </thead>
              <tbody>
                <Row
                  name="Landed Price (₹/t)"
                  base={fmtINR(LP_base_now)}
                  scn={fmtINR(LP_scn_now)}
                  deltaNode={<DeltaCell pct={((LP_scn_now - LP_base_now) / LP_base_now) * 100} />}
                />
                <Row
                  name="Retail Price (₹/kg)"
                  base={fmtKg(RP_base_now)}
                  scn={fmtKg(RP_scn_now)}
                  deltaNode={<DeltaCell pct={((RP_scn_now - RP_base_now) / RP_base_now) * 100} />}
                />
                <Row
                  name="Imports (short-run, %)"
                  base="—"
                  scn={fmtPct(importDeltaPct)}
                  deltaNode="—"
                />
                <Row
                  name="Farmer FFB (%, approx.)"
                  base="—"
                  scn={fmtPct(ffbDeltaPct)}
                  deltaNode="—"
                />
                <Row
                  name="Extra Fiscal / tonne (₹)"
                  base="0"
                  scn={fmtINR(fiscalPerTonne)}
                  deltaNode="+"
                />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI bits ---------- */
function KPI({ title, value, deltaClass, deltaArrow, deltaText }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      <div className="text-xs mt-1">
        <span className={`inline-flex items-center gap-1 font-medium ${deltaClass}`}>
          {deltaArrow} {deltaText}
        </span>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 mb-6">
      <div className="font-semibold mb-2">{title}</div>
      {children}
    </div>
  );
}

function Row({ name, base, scn, deltaNode }) {
  return (
    <tr className="border-t">
      <td className="py-2">{name}</td>
      <td className="py-2">{base}</td>
      <td className="py-2">{scn}</td>
      <td className="py-2">{deltaNode}</td>
    </tr>
  );
}

function DeltaCell({ pct }) {
  const pos = pct > 0;
  const neg = pct < 0;
  const cls = pos ? "text-emerald-600" : neg ? "text-rose-600" : "text-slate-500";
  const arrow = pos ? "▲" : neg ? "▼" : "–";
  return (
    <span className={`inline-flex items-center gap-1 font-medium ${cls}`}>
      {arrow} {fmtPct(pct)}
    </span>
  );
}
