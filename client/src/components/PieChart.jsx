import React from "react";
import {
PieChart as RChart,
Pie,
Cell,
Tooltip,
Legend,
ResponsiveContainer,
} from "recharts";

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
    <>
    </>
)
}