import React, { useEffect, useMemo, useState } from "react";
import SimulatedChartBlock from "./SimulatedChartBlock";
import domesticProd from "../data/domesticProd.json";

export default function SimProd({
  domestic_Prod,
  targetYear,
}) {
  const [baselineData, setBaselineData] = useState([]);
  const [projectionColor, setProjectionColor] = useState("#16a34a");

  // Load baseline once
  useEffect(() => {
    const observations = (domesticProd.data || [])
      .map((d) => ({
        year: d.year,
        domestic_prod: Number(d.domestic_prod),
        projection: null,
      }))
      .sort((a, b) => a.year - b.year);

    setBaselineData(observations);
  }, []);

  // Build unified dataset
  const chartData = useMemo(() => {
    if (!baselineData.length || domestic_Prod == null || !targetYear) {
      return baselineData;
    }

    const lastIdx = baselineData.length - 1;
    const lastBaseline = baselineData[lastIdx];

    // Prevent backward projection
    if (targetYear <= lastBaseline.year) {
      return baselineData;
    }

    const simulatedValue = Number(domestic_Prod);

    setProjectionColor(
      simulatedValue < lastBaseline.domestic_prod
        ? "#dc2626"
        : "#16a34a"
    );

    // Anchor projection
    const anchoredBaseline = baselineData.map((d, i) =>
      i === lastIdx ? { ...d, projection: d.domestic_prod } : d
    );

    return [
      ...anchoredBaseline,
      {
        year: targetYear,
        domestic_prod: null,
        projection: simulatedValue,
      },
    ];
  }, [baselineData, domestic_Prod, targetYear]);

  return (
    <SimulatedChartBlock
      title="Domestic CPO Production (Metric Tonnes)"
      chartData={chartData}
      dataKey="domestic_prod"
      projectionKey="projection"
      yTickFormatter={(v) => v.toLocaleString("en-IN")}
      tooltipFormatter={(v) => [
        v.toLocaleString("en-IN"),
        "Domestic Production",
      ]}
      projectionColor={projectionColor}
      xKey="year"
    />
  );
}
