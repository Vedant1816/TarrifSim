import express from "express";
import { spawn } from "child_process";
import { getLatestCpoPrice } from "./cpoRoutes.js";
import { get_fx } from "./fx.js";
import path from "path";
import { fileURLToPath } from "url";
import { requireAuth } from "./authMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "..");

const fxScript = path.join(
  ROOT_DIR,
  "ml",
  "scripts",
  "predict_fx.py"
);

const cpoScript = path.join(
  ROOT_DIR,
  "ml",
  "scripts",
  "predict_world_price.py"
);

const mainScript = path.join(
  ROOT_DIR,
  "ml",
  "scripts",
  "predict_main_model.py"
);

const prodScript = path.join(
  ROOT_DIR,
  "ml",
  "scripts",
  "predict_prod.py"
);


const router = express.Router();

function parseDate(dateStr){
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? null : d;
}

function runPython(args) {
  return new Promise((resolve, reject) => {
    const PYTHON_CMD = process.platform === "win32" ? "python" : "python3";
    const py = spawn(PYTHON_CMD, args);

    let stdout = "";
    let stderr = "";

    py.stdout.on("data", d => stdout += d.toString());
    py.stderr.on("data", d => stderr += d.toString());

    py.on("close", code => {
      if (code !== 0) {
        return reject(stderr || "Python process failed");
      }

      try {
        resolve(JSON.parse(stdout));
      } catch (err) {
        reject("Invalid JSON from Python:\n" + stdout);
      }
    });
  });
}


function monthsBetween(fromDate, toDate){
   return(
      (toDate.getFullYear() - fromDate.getFullYear())*12 + 
      (toDate.getMonth() - fromDate.getMonth())
   );
}

router.get("/", requireAuth, async (req, res) => {
   try{
      const bcd = Number(req.query.bcd);
      const targetDateStr = req.query.targetDate;
      let monthsAhead = null;
      let targetYear = new Date().getFullYear();
      if (targetDateStr !== undefined) {
          const targetDate = parseDate(targetDateStr);

          if (!targetDate) {
              return res.status(400).json({ error: "Invalid targetDate format" });
          }
          targetYear = targetDate.getFullYear();

          const now = new Date();
          now.setDate(1);
          targetDate.setDate(1);

          monthsAhead = monthsBetween(now, targetDate);

          if (monthsAhead < 0) {
             return res.status(400).json({ error: "targetDate must be in the future" });
          }
       }

      if (Number.isNaN(bcd)) {
        return res.status(400).json({ error: "Invalid or missing BCD value" });
      }

      if (monthsAhead !== null && (Number.isNaN(monthsAhead) || monthsAhead < 0)) {
        return res.status(400).json({ error: "monthsAhead must be >= 0" });
      }
      
      let worldPrice;
      let fxRate;

      if (monthsAhead === null || monthsAhead === 0) {
      // current FX
      const fxData = await get_fx();
      if (!fxData) {
        return res.status(500).json({ error: "FX data unavailable" });
      }
      fxRate = fxData.value;
    } else {
      // forecast FX
      const fxForecast = await runPython([
        fxScript,
        monthsAhead.toString()
      ]);
      fxRate = fxForecast.predictions.at(-1);
    }

    const latestCpo = await getLatestCpoPrice();
    if (!latestCpo) {
      return res.status(500).json({ error: "CPO data unavailable" });
    }

    const cpoDate = new Date(latestCpo.date);
    const now = new Date();

    // normalize both to month-level
    cpoDate.setDate(1);
    now.setDate(1);

    let offsetMonths = monthsBetween(cpoDate, now);

    if (monthsAhead !== null) {
      offsetMonths += monthsAhead;
    }

    if (offsetMonths <= 0) {
      worldPrice = latestCpo.value;
    } else {
      const cpoForecast = await runPython([
        cpoScript,
        offsetMonths.toString()
      ]);
      worldPrice = cpoForecast.predictions.at(-1);
    }

    let domesticProd = null;
  
    if (monthsAhead !== null) {
  const prodResult = await runPython([
    prodScript,
    targetYear.toString()
  ]);
  domesticProd = prodResult.domestic_production;
}
    
    const mainResult = await runPython([
      mainScript,
      bcd.toString(),
      worldPrice.toString(),
      fxRate.toString()
    ]);

    return res.json({
      inputs: {
        bcd,
        worldPrice,
        fxRate,
        monthsAhead: monthsAhead ?? 0,
        targetYear: monthsAhead !== null ? targetYear : new Date().getFullYear()
      },
      outputs: {
       ...mainResult,
       domesticProd
      }
    });

  } catch (err) {
    console.error("Simulation failed:", err);
    return res.status(500).json({ error: "Simulation failed" });
  }
});

export default router;

