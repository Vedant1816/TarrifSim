import CurrData from "../data/currData.json"
export default function Dashboard(){
    const currValues = CurrData.values ?? {};
    const LABELS = {
        imports_mt: "Imports (MT)",
        domestic_retail_rs_per_kg: "Domestic Retail Price (₹/kg)",
        farmgate_ffb_rs_per_kg: "Farmgate FFB Price (₹/kg)",
        domesticProd: "Domestic Production (MT)",
    }
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
                           Global Price
                        </td>
                        <td className="py-3 text-right">
                            2
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 text-slate-700">
                            Foreign Exchange(USD per INR)
                        </td>
                        <td className="py-3 text-right">
                            4
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 text-slate-700">
                            Global Production
                        </td>
                        <td className="py-3 text-right">
                            6
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
                            <td className="py-3 text-right">
                               {v.toLocaleString("en-IN")}
                            </td>
                        </tr>
                      ))}
                      <tr>
                        <td className="py-3 text-slate-700">
                            Basic Custom Duty
                        </td>
                        <td className="py-3 text-right">
                            10%
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