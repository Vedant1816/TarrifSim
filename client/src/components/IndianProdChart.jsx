import React, { useEffect } from "react";
import ChartBlock from "./ChartBlock";

export default function GlobalCPOChart(){
    const[annualData, setAnnualData] = React.useState([]);

    useEffect(() => {
        (async() =>{
            try{
              const res = await fetch("http://localhost:3000/api/cpo/india-annual-trend");
              const data = await res.json();
              
              const observations = data.latestRecords.map((o) => ({
                 date : o._year,
                 value : o.production_of_crude_palm_oil__cpo___in_metric_tons_
              }));

              if(observations){
                setAnnualData(observations);
              }

            }catch(e){
                console.log("Error(frontend) India Prod Data annual", e);
            }
        })();
    }, []);

    return(
        <>
         <ChartBlock title = "Production of CPO(metric tons) in India" 
                   data = {annualData} dataKey = "value" 
                   yTickFormatter={(v) => `${v.toLocaleString("en-US")}`}
                   tooltipFormatter={(v, n) => [`$${v.toLocaleString("en-US")}`, "India"]}
        />
        </>
    )
}