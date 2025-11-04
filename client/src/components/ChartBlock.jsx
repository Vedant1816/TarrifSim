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
  ReferenceDot,
} from "recharts";

export default function ChartBlock({
  title,
  data,
  dataKey,
  yTickFormatter,
  tooltipFormatter,
  color = "#334155",
  emphasizeLast = false,
}) {
  const last = data?.[data.length - 1];

  if (!data?.length) {
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
        <LineChart data={data} margin={{ top: 10, right: 24, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={yTickFormatter} axisLine={false} />
          <Tooltip formatter={tooltipFormatter} />
          <Legend />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2.4}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          {emphasizeLast && (
            <ReferenceDot
              x={last.year}
              y={last[dataKey]}
              r={5}
              fill={color}
              stroke="white"
              strokeWidth={2}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
