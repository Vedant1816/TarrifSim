import React, { useEffect, useState, useMemo } from "react";
import SimulatedChartBlock from "./SimulatedChartBlock";

export default function MonthlyGlobalCPOChart({
  worldCpoPrice,
  targetMonth,
}) {
  const [baselineData, setBaselineData] = useState([]);
  const [projectionColor, setProjectionColor] = useState("#16a34a");

  //  Fetch & normalize baseline ONCE
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          "http://localhost:3000/api/cpo/monthly-trend"
        );
        const data = await res.json();

        const observations = (data?.obs || [])
          .map((o) => ({
            date: o.date.slice(0, 7), // YYYY-MM
            global_cpo: Number(o.value),
            projection: null,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));

        setBaselineData(observations);
      } catch (e) {
        console.error("Monthly Global CPO fetch error", e);
      }
    })();
  }, []);

  //  Build ONE unified dataset (baseline + anchored future projection)
  const chartData = useMemo(() => {
    if (!baselineData.length || !worldCpoPrice || !targetMonth) {
      return baselineData;
    }

    const lastIdx = baselineData.length - 1;
    const lastBaseline = baselineData[lastIdx];

    //  Prevent backward or same-month simulation
    if (targetMonth <= lastBaseline.date) {
      return baselineData;
    }

    const simulatedValue = Number(worldCpoPrice);

    // Decide red / green
    setProjectionColor(
      simulatedValue < lastBaseline.global_cpo
        ? "#dc2626"
        : "#16a34a"
    );

    // Anchor projection at last baseline point
    const anchoredBaseline = baselineData.map((d, i) =>
      i === lastIdx
        ? { ...d, projection: d.global_cpo }
        : d
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
