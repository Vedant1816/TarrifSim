import React, { useEffect, useState, useMemo } from "react";
import SimulatedChartBlock from "./SimulatedChartBlock";
import globalMonthly from "../data/globalMonthly.json";

export default function MonthlyGlobalCPOChart({
  worldCpoPrice,
  targetMonth,
}) {
  const API_URL = import.meta.env.VITE_API_URL;

  /*  Static fallback */
  const fallbackBaseline = useMemo(() => {
    return (globalMonthly?.obs || [])
      .map((o) => ({
        date: o.date.slice(0, 7),
        global_cpo: Number(o.value),
        projection: null,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, []);

  /*  State */
  const [baselineData, setBaselineData] = useState(fallbackBaseline);

  /* API override */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/cpo/monthly-trend`);
        const data = await res.json();

        if (!data?.obs?.length) return;

        const observations = data.obs
          .map((o) => ({
            date: o.date.slice(0, 7),
            global_cpo: Number(o.value),
            projection: null,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));

        setBaselineData(observations);
      } catch {
        console.warn("Monthly Global CPO API failed, using fallback");
      }
    })();
  }, []);

  /* Projection color (derived) */
  const projectionColor = useMemo(() => {
    if (!baselineData.length || !worldCpoPrice) return "#16a34a";

    const last = baselineData[baselineData.length - 1];
    return Number(worldCpoPrice) < last.global_cpo
      ? "#dc2626"
      : "#16a34a";
  }, [baselineData, worldCpoPrice]);

  /* Chart data */
  const chartData = useMemo(() => {
    if (!baselineData.length || !worldCpoPrice || !targetMonth) {
      return baselineData;
    }

    const lastIdx = baselineData.length - 1;
    const lastBaseline = baselineData[lastIdx];

    // prevent backward simulation
    if (targetMonth <= lastBaseline.date) {
      return baselineData;
    }

    const simulatedValue = Number(worldCpoPrice);

    const anchoredBaseline = baselineData.map((d, i) =>
      i === lastIdx ? { ...d, projection: d.global_cpo } : d
    );

    return [
      ...anchoredBaseline,
      {
        date: targetMonth,
        global_cpo: null,
        projection: simulatedValue,
      },
    ];
  }, [baselineData, worldCpoPrice, targetMonth]);

  return (
    <SimulatedChartBlock
      title="Global CPO Prices – Monthly (USD per MT)"
      chartData={chartData}
      dataKey="global_cpo"
      projectionKey="projection"
      yTickFormatter={(v) => `$${v.toLocaleString("en-US")}`}
      tooltipFormatter={(v) => [
        `$${v.toLocaleString("en-US")}`,
        "Global CPO Price",
      ]}
      projectionColor={projectionColor}
    />
  );
}
