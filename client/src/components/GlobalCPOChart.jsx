import React, { useEffect } from "react";
import ChartBlock from "./ChartBlock";

export default function GlobalCPOChart(){
    const[annualData, setAnnualData] = React.useState([]);

    useEffect(() => {
        (async() => {
            try{
              const res = await fetch("http://localhost:3000/api/cpo/annual-trend")
              const data = await res.json();

              const observations = data?.obs.map((o) => ({
                 date: new Date(o.date).getFullYear(),
                 global_cpo: Number(o.value).toFixed(2),
              }));


              if(observations){
                setAnnualData(observations);
              }
            } catch(e) {
                console.log("Error while fetching in frontend -FRED Annual CPO data", e);
            }
        }) ();
    }, []);

    return(
        <>
          <ChartBlock title = "Global CPO Prices(USD per MT)" 
          data = {annualData} dataKey = "global_cpo" 
          yTickFormatter={(v) => `$${v.toLocaleString("en-US")}`}
          tooltipFormatter={(v, n) => [`$${v.toLocaleString("en-US")}`, "Global CPO Price"]}
          />
        </>
    )


}