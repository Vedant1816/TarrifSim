import express from "express";
const router = express.Router();

const GOV_API_KEY = process.env.GOV_API_KEY;
if(!GOV_API_KEY){
    console.log("! Missing GOV_API_KEY in process.env");
    process.exit(1);
}

const BASE_URL = "https://api.data.gov.in/resource/ac515a95-66fa-4620-b9f1-303d73b0beab";

function govUrl(params = {}){
    const u = new URL(BASE_URL);
    u.searchParams.set("api-key", GOV_API_KEY);
    u.searchParams.set("format", "json");
    for (const[k, v] of Object.entries(params)) u.searchParams.set(k , v);
    return u.toString();
}

async function getJson(url){
    const r = await fetch(url);
    return r.json();
}

router.get("/india-trend", async(_req, res)=> {
    try{
        const data = await getJson(govUrl());
        const size = data?.records?.length;
        const value = data?.records?.[size-1]?.production_of_crude_palm_oil__cpo___in_metric_tons_;
        const year = data?.records?.[size-1]?._year;
        const prev_value = data?.records?.[size-2]?.production_of_crude_palm_oil__cpo___in_metric_tons_;
        const pch = value && prev_value? ((value- prev_value) * (100/prev_value)) : null;

        res.json({
            value,
            pch,
            year
        });
    } catch(e) {
        console.log("Error fetching from GOV_API", e);
    }
});

export default router;