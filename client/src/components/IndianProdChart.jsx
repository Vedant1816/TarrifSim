import React from "react";
import ChartBlock from "./ChartBlock";
import domesticProd from "../data/domesticProd.json";

export default function GlobalCPOChart() {
  const annualData = domesticProd.data.map((o) => ({
    date: o.year,
    CPO_produciton: o.domestic_prod,
  }));

  return (
    <ChartBlock
      title="Production of CPO (metric tons) in India"
      data={annualData}
      dataKey="CPO_produciton"
      yTickFormatter={(v) => v.toLocaleString("en-US")}
      tooltipFormatter={(v) => [
        v.toLocaleString("en-US"),
        "India",
      ]}
    />
  );
}
