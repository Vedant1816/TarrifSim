import express from "express";
const router = express.Router();

// Your secret FRED key from .env
const FRED_KEY = process.env.FRED_API_KEY;
if (!FRED_KEY) {
  console.error("! Missing FRED_API_KEY in .env");
  process.exit(1);
}

const BASE = "https://api.stlouisfed.org/fred/series/observations";
const SERIES_MONTHLY = "PPOILUSDM"; // Global Palm Oil price (USD/MT)
const SERIES_ANNUAL = "PPOILUSDA";

// Simple helper to build a FRED API URL
function fredUrl(seriesId, params = {}) {
  const u = new URL(BASE);
  u.searchParams.set("series_id", seriesId);
  u.searchParams.set("file_type", "json");
  u.searchParams.set("api_key", FRED_KEY);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  return u.toString();
}

// Utility to fetch and handle FRED’s "." missing values
async function getJson(url) {
  const r = await fetch(url);
  return r.json();
}

// ---- ROUTE: returns both price + MoM change ----
router.get("/trend", async (_req, res) => {
  try {
    // 1️⃣ latest price
    const latestData = await getJson(
      fredUrl(SERIES_MONTHLY,{ limit: "1", sort_order: "desc" })
    );

    const latestObs = latestData?.observations?.[0];
    const value =
      latestObs?.value && latestObs.value !== "." ? Number(latestObs.value) : null;
    const date = latestObs?.date ?? null;

    // 2️⃣ month-over-month % change
    const momData = await getJson(
      fredUrl(SERIES_MONTHLY,{ units: "pch", limit: "1", sort_order: "desc" })
    );
    const momObs = momData?.observations?.[0];
    const percentChange =
      momObs?.value && momObs.value !== "." ? Number(momObs.value) : null;

    // 3️⃣ send clean JSON
    res.json({
      date,                           
      value_usd_per_metric_ton: value, 
      percent_change_mom: percentChange 
    });
  } catch (e) {
    console.error("CPO trend fetch failed:", e);
    res.status(500).json({ error: "FRED fetch failed" });
  }
});

router.get("/annual-trend", async(_req, res) => {
  try{
    const data = await getJson(
      fredUrl(SERIES_ANNUAL, {limit: "10", sort_order: "desc"})
    );
    const obs = data?.observations.reverse();
  
    res.json({
      obs
    });
  } catch(e) {
    console.log("Error fetching annual global CPO data from FRED", e);
  }
})

router.get("/monthly-trend", async(_req, res) => {
  try{
    const data = await getJson(
      fredUrl(SERIES_MONTHLY, {limit: "10", sort_order: "desc"})
    );
    const obs = data?.observations.reverse();
    res.json({
      obs
    });
  } catch(e){
    console.log("Error fetching monthly trends of Global CPO from Fred", e);
  }
})

async function getLatestCpoPrice() {
  const url = fredUrl(SERIES_MONTHLY, {
    limit: "1",
    sort_order: "desc"
  });
  const data = await getJson(url);
  const obs = data?.observations?.[0];
  if (!obs || obs.value === ".") return null;
  return{
    date: obs.date,
    value: Number(obs.value)
  };

}

export { getLatestCpoPrice };
export default router;
