import express from "express";
const router = express.Router();

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

export { get_fx };