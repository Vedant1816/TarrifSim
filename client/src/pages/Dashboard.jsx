import CurrData from "../data/currData.json"
import currGlobal from "../data/currGlobal.json"
import { useState, useEffect } from "react";
import { apiFetch } from "../apiFetch";
import bcdData from "../data/bcdData.json";

export default function Dashboard(){
    const currValues = CurrData.values ?? {};
    const API_URL = import.meta.env.VITE_API_URL;
    const LABELS = {
        imports_mt: "Imports (MT)",
        domestic_retail_rs_per_kg: "Domestic Retail Price (₹/kg)",
        farmgate_ffb_rs_per_kg: "Farmgate FFB Price (₹/kg)",
        domesticProd: "Domestic Production (MT)",
    }
    const [fx, setFx] = useState(null);
    const [fxLoading, setFxLoading] = useState(true);

    const [globalPrice, setGlobalPrice] = useState(currGlobal.values.global_price.toFixed(2));//Fallback in case of API fetch failure
    useEffect(() => { //API override
      (async() => {
        try{
          const res = await fetch(`${API_URL}/api/cpo/trend`);
          const data = await res.json();
          const val = data?.value_usd_per_metric_ton;
          setGlobalPrice(val.toFixed(2))
        }catch(err){
          console.log("Error fetching global cpo current trend ", err);
        }})(); }, [])

      useEffect(() => {
      (async () => {
       try {
      setFxLoading(true);

      const res = await apiFetch(`${API_URL}/api/fx/current`);
      const data = await res.json();
      const val = data?.value;

      if (typeof val === "number") {
        setFx(val.toFixed(2));
      } else {
        setFx("—");
      }
    } catch (err) {
      console.log("Error fetching fx ", err);
      setFx("—");
    } finally {
      setFxLoading(false);
    }
  })();
}, []);

      
        
    return(
          <div className="min-h-screen bg-slate-100 p-6">
               <div className="max-w-4xl mx-auto space-y-6">
                 <header>
                    <h1 className="text-3xl font-bold text-slate-800">
                        Real Time Market Trends
                    </h1>
                 </header>
                <section className="bg-white rounded-2xl shadow p-6">
                   <h2 className="text-xl font-semibold text-slate-700 mb-4">
                    Global Data
                   </h2>

                   <div className="overflow-x-auto">
                   <table className="w-full text-sm border-collapse">
                   <thead>
                   <tr className="border-b text-slate-500">
                     <th className="text-left py-2 font-medium">Metric</th>
                     <th className="text-right py-2 font-medium">Value</th>
                   </tr>
                   </thead>
                   <tbody>
                      <tr>
                        <td className="py-3 text-slate-700">
                           Global Price($/MT)
                        </td>
                        <td className="py-3 text-right text-black">
                            {globalPrice}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 text-slate-700">
                            Foreign Exchange(USD per INR)
                        </td>
                        <td className="py-3 text-right text-black">
                         {fxLoading ? (
                           <span className="inline-flex items-center gap-2 text-slate-400">
                             <span className="w-3 h-3 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                             Loading…
                           </span>
                           ) : (
                              fx
                           )}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 text-slate-700">
                            Global Production(MT)
                        </td>
                        <td className="py-3 text-right text-black">
                            {currGlobal.values.global_prod}
                        </td>
                      </tr>
                   </tbody>
                   </table>
                </div>
           </section>
           <section className="bg-white rounded-2xl shadow p-6">
                   <h2 className="text-xl font-semibold text-slate-700 mb-4">
                    Domestic Data
                   </h2>

                   <div className="overflow-x-auto">
                   <table className="w-full text-sm border-collapse">
                   <thead>
                   <tr className="border-b text-slate-500">
                     <th className="text-left py-2 font-medium">Metric</th>
                     <th className="text-right py-2 font-medium">Value</th>
                   </tr>
                   </thead>
                   <tbody>
                      {Object.entries(currValues).map(([k,v])=>(
                        <tr>
                            <td className="py-3 text-slate-700">
                               {LABELS[k]}
                            </td>
                            <td className="py-3 text-right text-black">
                               {v.toLocaleString("en-IN")}
                            </td>
                        </tr>
                      ))}
                      <tr>
                        <td className="py-3 text-slate-700">
                            Basic Custom Duty(%)
                        </td>
                        <td className="py-3 text-right text-black">
                            {bcdData.obs[bcdData.obs.length - 1].bcd}
                        </td>
                      </tr>
                   </tbody>
                   </table>
                </div>
           </section>

               </div>
          </div>
    )
}