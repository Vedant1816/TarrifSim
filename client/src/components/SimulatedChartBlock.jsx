import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

export default function SimulatedChartBlock({
  title,
  chartData = [],      // ONE unified dataset
  dataKey,
  projectionKey,       // e.g. "projection"
  yTickFormatter,
  xKey = "date",
  tooltipFormatter,
  baseColor = "#334155",
  projectionColor = "#16a34a",
}) {
  if (!chartData.length) {
    return (
      <div className="bg-white rounded-2xl shadow p-4 mb-6">
        <div className="font-semibold mb-2">{title}</div>
        <div className="text-slate-500 text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4 mb-6">
      <div className="font-semibold mb-2">{title}</div>

      <ResponsiveContainer width="100%" height={340}>
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 24, left: 0, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} axisLine={false} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={yTickFormatter} axisLine={false} />

          <Tooltip formatter={tooltipFormatter} />
          <Legend />

          {/* Historical line */}
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={baseColor}
            strokeWidth={2.4}
            dot={{ r: 3 }}
            name="Historical"
          />

          {/* Projection EXTENSION */}
          <Line
            type="monotone"
            dataKey={projectionKey}
            stroke={projectionColor}
            strokeWidth={3}
            dot={{ r: 5 }}
            name="Simulation"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
