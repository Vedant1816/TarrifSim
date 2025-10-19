import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import databg from "../assets/databg.png";

const DEFAULTS = {
  r_BCD: 5,           // percent
  scenario_time: "",  // optional
};

export default function DataInput() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...DEFAULTS });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  function setField(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function validate() {
    const e = {};
    if (form.r_BCD === "" || isNaN(Number(form.r_BCD))) {
      e.r_BCD = "Enter a valid number";
    } else if (Number(form.r_BCD) < 0 || Number(form.r_BCD) > 100) {
      e.r_BCD = "Duty must be between 0 and 100";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    try {
      const now = new Date();
      const scenarioDate = form.scenario_time ? new Date(form.scenario_time) : now;

      const payload = {
        r_BCD: Number(form.r_BCD) / 100,
        scenario_time_iso: scenarioDate.toISOString(),
        saved_at: now.toISOString(),
      };

      localStorage.setItem("cpo_sim_inputs", JSON.stringify(payload));

      // Fake compute delay for UX (optional): remove or tweak as you wish
      await new Promise((res) => setTimeout(res, 700));

      // ✅ Go straight to output
      navigate("/output");
    } finally {
      // If you navigate away immediately, this won't flash;
      // it's here for safety if navigation is blocked.
      setIsLoading(false);
    }
  }

  function clearAll() {
    setForm({ r_BCD: "", scenario_time: "" });
    setErrors({});
  }

  return (
    <div
      className="min-h-screen text-slate-900 p-6 bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url(${databg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* contrast overlay */}
      <div className="absolute inset-0 bg-slate-900/40" />

      {/* loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
          <svg
            className="animate-spin h-10 w-10 mb-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <div className="text-lg font-semibold">Running simulation…</div>
          <div className="text-slate-200 text-sm mt-1">Preparing your output page</div>
        </div>
      )}

      <div className="relative max-w-3xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-white">Simulation Inputs</h1>
          <p className="text-slate-200 mt-1">
            Provide the customs duty and (optionally) the scenario time.
            Leave time empty to use <span className="font-semibold">current time</span>.
          </p>
        </header>

        <div className="bg-white/85 backdrop-blur-md rounded-2xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="grid gap-4" aria-busy={isLoading}>
            {/* Custom Duty (%) */}
            <div className="bg-white rounded-2xl shadow p-4">
              <label className="text-sm text-slate-600">Custom Duty (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={form.r_BCD}
                onChange={(e) => setField("r_BCD", e.target.value)}
                className="mt-1 w-full border rounded-xl px-3 py-2 font-mono disabled:bg-slate-100"
                placeholder="e.g., 5"
                disabled={isLoading}
              />
              {errors.r_BCD && (
                <p className="text-rose-600 text-sm mt-1">{errors.r_BCD}</p>
              )}
              <p className="text-xs text-slate-500 mt-1">
                Example: enter <code>5</code> for 5%.
              </p>
            </div>

            {/* Scenario Time (optional) */}
            <div className="bg-white rounded-2xl shadow p-4">
              <label className="text-sm text-slate-600">
                Scenario Timeframe (optional)
              </label>
              <input
                type="datetime-local"
                value={form.scenario_time}
                onChange={(e) => setField("scenario_time", e.target.value)}
                className="mt-1 w-full border rounded-xl px-3 py-2 font-mono disabled:bg-slate-100"
                disabled={isLoading}
              />
              <p className="text-xs text-slate-500 mt-1">
                Leave empty to use current time.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`px-5 py-3 rounded-2xl text-black font-semibold shadow transition ${
                  isLoading
                    ? "bg-emerald-600/70 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {isLoading ? "Simulating…" : "Save & Simulate"}
              </button>

              <button
                type="button"
                onClick={clearAll}
                disabled={isLoading}
                className="px-5 py-3 rounded-2xl bg-white border shadow hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            </div>
          </form>

          <section className="mt-6 text-xs text-slate-600">
            <p>
              This page only collects the ad-valorem customs duty and the time at
              which your scenario applies. Other parameters use defaults on the
              output page.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
