import express from "express"
import { generateTariffSummary } from "./generateSummary.js"
import { requireAuth } from "./authMiddleware.js";

const router = express.Router();

router.post("/", requireAuth, async(req, res)=>{
    try{
        const{inputs, market, outputs, current} = req.body
        if(!inputs || !outputs){
            return res.status(400).json({error : "Missing Simulation Data"})
        }
        const summary = await generateTariffSummary({inputs, market, outputs, current});
        res.json(summary);

    }catch(err){
        console.log("Gemini couldnt generate summary", err);
        res.status(500).json({error : "failed to generate summary"});
    }
});

export default router;