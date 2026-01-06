import React, {useEffect, useState, useRef} from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import MonthlyGlobalCPOChart from "../components/MonthlyGlobalCPOChart"
import useScrollVisibility from "../hooks/useScrollVisibility";
import SimProd from "../components/SimProd";
import CurrData from "../data/currData.json";
import { supabase } from "../supabaseClient";
import { apiFetch } from "../apiFetch";

function RevealOnScroll({ children, height = 340, offset = 120 }) {
  const { ref, visible } = useScrollVisibility(offset, true);
  return (
    <div ref={ref} className="mb-6">
      {!visible ? (
        <div
          style={{ height }}
          className="bg-slate-100 rounded-2xl shadow pointer-events-none"
        />
      ) : (
        children
      )}
    </div>
  );
}


export default function Output(){
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [summary, setSummary] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const pdfRef = useRef(null);
  const currentValues = CurrData.values ?? {};
  const OUTPUT_LABELS = {
  imports_mt: "Imports (MT)",
  domestic_retail_rs_per_kg: "Domestic Retail Price (₹/kg)",
  farmgate_ffb_rs_per_kg: "Farmgate FFB Price (₹/kg)",
  domesticProd: "Domestic Production (MT)",
};
  const PDF_LABELS ={
  imports_mt: "Imports (MT)",
  domestic_retail_rs_per_kg: "Domestic Retail Price (Rs/kg)",
  farmgate_ffb_rs_per_kg: "Farmgate FFB Price (Rs/kg)",
  domesticProd: "Domestic Production (MT)",
  }
  const INPUT_LABELS = {
    bcd: "Basic Custom Duty(%)",
    worldPrice: "World Price of CPO(USD per MT)",
    fxRate: "Foreign Exchange(USD per INR)",
    monthsAhead: "Months Ahead",
    targetYear: "Target Year"
  }

  function renderExpectedValue(current, expected) {
  if (expected == null) return "—";

  if (current == null) {
    return expected.toLocaleString("en-IN");
  }

  const diff = expected - current;
  const isUp = diff > 0;
  const pctChange = (Math.abs(diff)/current)*100;

  return (
    <span className={`inline-flex items-center gap-1 font-mono
      ${isUp ? "text-green-600" : "text-red-600"}`}>
      {expected.toLocaleString("en-IN")}
      <span className="text-xs">
        {isUp ? "▲" : "▼"}
      </span>
      <span className="text-xs">
        {pctChange.toFixed(2)}%
      </span>
    </span>
  ) }

  function computeTargetMonth(monthsAhead, targetYear) {
     const now = new Date();
     const baseMonth = now.getMonth() + 1; // because now.getMonth() is 0 based
     const date = new Date(targetYear, baseMonth + monthsAhead, 1);
     return date.toISOString().slice(0, 7); // YYYY-MM
}

  useEffect(()=> {
    const stored = localStorage.getItem("cpo_sim_result");
    if(!stored){
      navigate("/");
      return;
    }
    try{
      const parsed = JSON.parse(stored);
      setResult(parsed);
    }catch(err){
      console.error("Invalid result stored of simulation ", err)
      navigate("/")
    }
  }, [navigate]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Loading simulation result…
      </div>
    );
  }
  const { inputs, outputs } = result;
  const targetMonth = computeTargetMonth(
     inputs.monthsAhead,
     inputs.targetYear
);

  async function generateSummary(){
    try{
      setIsGenerating(true);
      setSummaryError("");
      const res = await apiFetch(`${API_URL}/api/summary`,{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body:JSON.stringify({
          inputs : {bcd : inputs.bcd, targetYear: inputs.targetYear, targetMonth : targetMonth},
          market : {fxRate : inputs.fxRate, worldPrice : inputs.worldPrice },
          current :  currentValues,
          outputs
        })
      })
      if(!res.ok){
        throw new Error("Failed to generate summary")
      }
      const data = await res.text();
      setSummary(data);
    }catch(err){
       setSummaryError("Unable to get the Summary")
    }finally{
      setIsGenerating(false);
    }
  }

  
function downloadPdfFromData({ inputs, outputs, currentValues, summary }) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(16);
  doc.text("CPO Tariff Simulation Report", 14, 20);

  // Section: Inputs
  doc.setFontSize(12);
  doc.text("Inputs", 14, 30);

  autoTable(doc, {
    startY: 35,
    head: [["Metric", "Value"]],
    body: Object.entries(inputs)
      .filter(([k]) => ["bcd", "monthsAhead", "targetYear"].includes(k))
      .map(([k, v]) => [INPUT_LABELS[k], String(v)]),
  });

  // Section: Market Assumptions
  doc.text("Market Assumptions", 14, doc.lastAutoTable.finalY + 10);
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 15,
    head: [["Metric", "Predicted/Current Value"]],
    body: Object.entries(inputs)
          .filter(([k]) => ["worldPrice", "fxRate"].includes(k))
          .map(([k, v]) => [INPUT_LABELS[k], String(v.toFixed(2))])
  })

  // Section: Outputs
  doc.text("Expected Results", 14, doc.lastAutoTable.finalY + 10);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 15,
    head: [["Metric", "Current Value", "Expected Value"]],
    body: Object.entries(outputs).map(([k, v]) => [
      PDF_LABELS[k],
      currentValues[k].toLocaleString("en-IN"),
      v.toLocaleString("en-IN"),
    ]),
  });

  // AI Summary (optional)
  if (summary) {
    doc.text("AI Insight Summary", 14, doc.lastAutoTable.finalY + 15);
    doc.setFontSize(10);
    doc.text(summary, 14, doc.lastAutoTable.finalY + 22, {
      maxWidth: 180,
    });
  }

  doc.save("CPO_Tariff_Simulation_Report.pdf");
}

   return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold text-slate-800">
            Simulation Output
          </h1>
          <p className="text-slate-600 mt-1">
            Results based on your selected tariff and target date.
          </p>
        </header>

        {/* Inputs Section */}
        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">
            Inputs
          </h2>

          <div className="hidden md:block overflow-x-auto">
             <table className="w-full text-sm border-collapse">
               <thead>
                 <tr className="border-b text-slate-500">
                  <th className="text-left py-2 font-medium">Metric</th>
                  <th className="text-right py-2 font-medium">Entered Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(inputs).map(([key, value]) => {
                  if (key == "bcd" || key == "monthsAhead" || key == "targetYear"){
                return(    
                <tr
                  key={key}
                  className="border-b last:border-b-0 hover:bg-slate-50"
                >
                 {/* Metric */}
                 <td className="py-3 text-slate-700">
                   {INPUT_LABELS[key] ?? key}
                 </td>

                 {/* New value */}
                 <td className="py-3 text-right">
                    {value}
                 </td>
               </tr>)}
                 return null;
                })}
             </tbody>
            </table>
          </div>
          {/* Mobile Inputs (stacked) */}
           <div className="md:hidden space-y-4">
            {Object.entries(inputs).map(([key, value]) => {
              if (!["bcd", "monthsAhead", "targetYear"].includes(key)) return null;

              return (
               <div
                key={key}
                className="bg-slate-50 rounded-xl p-4 border"
               >
               <h3 className="text-sm font-semibold text-slate-700">
                {INPUT_LABELS[key]}
               </h3>

               <p className="mt-2 text-right text-slate-900 font-mono">
                {value}
               </p>
              </div>
               );
              })}
           </div>

        </section>

        <section className="bg-white rounded-2xl shadow p-6">
           <h2 className="text-xl font-semibold text-slate-700 mb-4">
              Market Assumptions
           </h2>

           <div className="hidden md:block overflow-x-auto">
             <table className="w-full text-sm border-collapse">
               <thead>
                 <tr className="border-b text-slate-500">
                  <th className="text-left py-2 font-medium">Metric</th>
                  <th className="text-right py-2 font-medium">Predicted/Current Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(inputs).map(([key, value]) => {
                  if (key == "worldPrice" || key == "fxRate"){
                return(    
                <tr
                  key={key}
                  className="border-b last:border-b-0 hover:bg-slate-50"
                >
                 {/* Metric */}
                 <td className="py-3 text-slate-700">
                   {INPUT_LABELS[key] ?? key}
                 </td>

                 {/* New value */}
                 <td className="py-3 text-right">
                    {value.toFixed(2)}
                 </td>
               </tr>)}
                 return null;
                })}
             </tbody>
            </table>
          </div> 
          {/* Mobile Market Assumptions */}
          <div className="md:hidden space-y-4">
            {Object.entries(inputs).map(([key, value]) => {
              if (!["worldPrice", "fxRate"].includes(key)) return null;

              return (
                <div
                  key={key}
                  className="bg-slate-50 rounded-xl p-4 border"
                >
                  <h3 className="text-sm font-semibold text-slate-700">
                    {INPUT_LABELS[key]}
                  </h3>

                  <p className="mt-2 text-right text-slate-900 font-mono">
                    {value.toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>

        </section>   

        {/* Outputs Section */}
        <section className="bg-white rounded-2xl shadow p-6">
           <h2 className="text-xl font-semibold text-slate-700 mb-4">
              Expected Results
           </h2>

         <div className="hidden md:block overflow-x-auto">
             <table className="w-full text-sm border-collapse">
               <thead>
                 <tr className="border-b text-slate-500">
                  <th className="text-left py-2 font-medium">Metric</th>
                  <th className="text-right py-2 font-medium">Current Value</th>
                  <th className="text-right py-2 font-medium">Expected Value</th>
                </tr>
              </thead>

              <tbody>
                {Object.entries(outputs).map(([key, value]) => (
                <tr
                  key={key}
                  className="border-b last:border-b-0 hover:bg-slate-50"
                >
                 {/* Metric */}
                 <td className="py-3 text-slate-700">
                   {OUTPUT_LABELS[key] ?? key}
                 </td>

                 {/* Current value */}
                 <td className="py-3 text-right text-slate-600 font-mono">
                     {currentValues[key] != null
                        ? currentValues[key].toLocaleString("en-IN")
                     : "—"}
                 </td>


                 {/* New value */}
                 <td className="py-3 text-right">
                    {renderExpectedValue(currentValues[key], value)}
                 </td>
               </tr>
                ))}
             </tbody>
            </table>
         </div>
         {/* Mobile Expected Results */}
          <div className="md:hidden space-y-4">
            {Object.entries(outputs).map(([key, value]) => (
              <div
                key={key}
                className="bg-slate-50 rounded-xl p-4 border"
              >
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  {OUTPUT_LABELS[key] ?? key}
                </h3>

                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">Current</span>
                  <span className="font-mono text-slate-700">
                    {currentValues[key] != null
                      ? currentValues[key].toLocaleString("en-IN")
                      : "—"}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Expected</span>
                  <span>
                    {renderExpectedValue(currentValues[key], value)}
                  </span>
                </div>
              </div>
            ))}
          </div>

       </section>

        <RevealOnScroll>
          <div>
          <MonthlyGlobalCPOChart
            worldCpoPrice={inputs.worldPrice}
            targetMonth={targetMonth}
          />
          </div>
        </RevealOnScroll>
        <RevealOnScroll>
          <div>
          <SimProd
            domestic_Prod={outputs.domesticProd}
            targetYear={inputs.targetYear}
          />
          </div>
        </RevealOnScroll>  
        <section data-ai-summary className="bg-white rounded-2xl shadow p-6">
           <div className="flex items-center justify-between mb-3">
             <h2 className="text-xl font-semibold text-slate-700">
              AI Insight Summary
             </h2>
              <button
              onClick={generateSummary}
              disabled={isGenerating}
              className="px-6! py-2! rounded-xl! border! border-slate-800! bg-white! text-slate-900! font-medium! hover:bg-slate-900! hover:text-white! transition-colors"
              >
               {isGenerating ? "Generating.." : summary ? "Regenerate" : "Generate"}
              </button>
              </div>
              {summaryError && (
                <p className="text-sm text-red-600">{summaryError}</p>
              )}

              {summary && (
                 <p className="text-slate-700 leading-relaxed">
                  {summary}
                 </p>
              )}

            {!summary && !isGenerating && !summaryError && (
             <p className="text-sm text-slate-400">
               Click “Generate” to get an AI-assisted explanation of the results.
             </p>
            )}

            <p className="text-xs text-slate-400 mt-2">
           AI-generated summary for interpretative purposes only.
           </p>
       </section>
        
        <div className="flex gap-3">
          <button
            className="px-6! py-2! rounded-xl! border! border-slate-800! bg-white! text-slate-900! font-medium! hover:bg-slate-900! hover:text-white! transition-colors"
            onClick={() =>
            downloadPdfFromData({
            inputs,
            outputs,
            currentValues,
            summary,
          })
          }
         >
           Download Report (PDF)
         </button>
         <button
            onClick={() => navigate("/")}
            className="px-6! py-2! rounded-xl! border! border-slate-800! bg-white! text-slate-900! font-medium! hover:bg-slate-900! hover:text-white! transition-colors">
           Simulate Again
         </button>

          
        </div>   
      </div>
    </div>
  );
}
