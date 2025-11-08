import React from "react";
import {
  PieChart as RChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/**
 * Reusable Pie / Donut chart component (Recharts)
 * -------------------------------------------------
 * Props
 * - title?: string                      // Optional heading rendered above the chart
 * - data: Array<{ name: string, value: number, color?: string }>
 * - dataKey?: string                    // Defaults to "value"
 * - nameKey?: string                    // Defaults to "name"
 * - height?: number                     // Chart height (defaults 320)
 * - innerRadius?: number | string       // Set to >0 (e.g. 70) to make a donut
 * - outerRadius?: number | string       // Defaults 120
 * - showLegend?: boolean                // Defaults true
 * - showLabels?: boolean                // Defaults true (slice labels)
 * - valueFormatter?: (n:number)=>string // Formats tooltip/labels (defaults to locale string)
 * - percentDecimals?: number            // Decimals for percentage labels (default 1)
 * - palette?: string[]                  // Fallback colors used in order
 * - onSliceClick?: (payload)=>void      // click handler per slice
 * - centerLabel?: {                     // Optional text in donut's center
 *     top?: string;                     // Big text (e.g., total)
 *     bottom?: string;                  // Small text (e.g., subtitle)
 *   }
 * - className?: string                  // Wrapper classes
 *
 * Usage example:
 * <PieChart
 *   title="Edible Oil Market Share (India)"
 *   data={[
 *     { name: "Palm Oil", value: 38 },
 *     { name: "Soybean", value: 25 },
 *     { name: "Sunflower", value: 15 },
 *     { name: "Mustard", value: 12 },
 *     { name: "Others", value: 10 },
 *   ]}
 *   innerRadius={70}
 *   valueFormatter={(n)=> `${n}%`}
 * />
 */

export default function PieChart({
  title,
  data = [],
  dataKey = "value",
  nameKey = "name",
  height = 320,
  innerRadius = 0,
  outerRadius = 120,
  showLegend = true,
  showLabels = true,
  valueFormatter,
  percentDecimals = 1,
  palette = [
    "#059669", // emerald-600
    "#f59e0b", // amber-500
    "#dc2626", // red-600
    "#2563eb", // blue-600
    "#7c3aed", // violet-600
    "#16a34a", // green-600
    "#ea580c", // orange-600
    "#9333ea", // purple-600
    "#0ea5e9", // sky-500
    "#ef4444", // red-500
  ],
  onSliceClick,
  centerLabel,
  className = "",
}) {
  const safeData = Array.isArray(data)
    ? data.filter(d =>
        d && typeof d[dataKey] === "number" && isFinite(d[dataKey]) && d[nameKey]
      )
    : [];

  const total = safeData.reduce((s, d) => s + (d[dataKey] ?? 0), 0);

  const fmt = (n) =>
    typeof valueFormatter === "function"
      ? valueFormatter(n)
      : Number(n).toLocaleString("en-IN");

  const renderLabel = ({ name, value, percent }) => {
    if (!showLabels) return null;
    const p = (percent * 100).toFixed(percentDecimals);
    return `${name} (${p}%)`;
  };

  return (
    <div className={`bg-white rounded-2xl shadow p-4 ${className}`}>
      {title ? (
        <div className="font-semibold mb-2 flex items-center justify-between">
          <span>{title}</span>
          {total > 0 && (
            <span className="text-xs text-slate-500">Total: {fmt(total)}</span>
          )}
        </div>
      ) : null}

      <div className="w-full" style={{ height }} aria-label={title || "Pie chart"}>
        <ResponsiveContainer width="100%" height="100%">
          <RChart>
            <Pie
              data={safeData}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              isAnimationActive={true}
              label={renderLabel}
              onClick={onSliceClick}
            >
              {safeData.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={entry.color || palette[i % palette.length]} />
              ))}
            </Pie>

            {/* <Tooltip
              formatter={(v, n, p) => [fmt(v), p?.payload?.[nameKey] ?? n]}
              cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
            /> */}

            {showLegend && <Legend />}
          </RChart>
        </ResponsiveContainer>
      </div>

      {/* Center label for donut charts */}
      {innerRadius ? (
        <div className="pointer-events-none select-none absolute" style={{
          transform: "translate(-50%, -50%)",
          left: "50%",
          marginTop: `-${height/2 - 8}px`,
        }}>
          {centerLabel?.top && (
            <div className="text-center text-xl font-semibold">{centerLabel.top}</div>
          )}
          {centerLabel?.bottom && (
            <div className="text-center text-slate-500 text-xs mt-0.5">{centerLabel.bottom}</div>
          )}
        </div>
      ) : null}

      {safeData.length === 0 && (
        <div className="text-slate-500 text-sm mt-2">No data available</div>
      )}
    </div>
  );
}
