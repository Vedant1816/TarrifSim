import express from "express";
const router = express.Router();
import { requireAuth } from "./authMiddleware.js";

const API_KEY = process.env.CURRENCY_API_KEY;
if(!API_KEY){
    console.error("!Missing API Key for currency");
    process.exit(1);
}
const BASE_URL = "https://api.currencyfreaks.com/v2.0/rates/latest";
function currencyURL(){
    const u = new URL(BASE_URL);
    u.searchParams.set("format", "json")
    u.searchParams.set("apikey", API_KEY)
    return u.toString();
}

async function getJson(url) {
    const r = await fetch(url);
    return r.json();
}

async function get_fx() {
    const url = currencyURL();
    const data = await getJson(url);
    const obs = data?.rates?.INR;
    if(!obs) return null;
    return{
        date : data.date,
        value : Number(obs)
    };
}

/* Route */
router.get("/fx/current", requireAuth, async (req, res) => {
  try {
    const fx = await get_fx();

    if (!fx) {
      return res.status(502).json({
        message: "Failed to fetch FX data",
      });
    }

    res.json({
      base: "USD",
      quote: "INR",
      ...fx,
    });
  } catch (err) {
    console.error("FX route error:", err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default router;
export { get_fx };