import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export async function generateTariffSummary({
  inputs,
  market,
  outputs,
  current,
}) {
  const prompt = `
You are an economic policy analyst writing a short briefing note.

TariffSim is a scenario analysis tool used to assess how changes in import tariffs,
global prices, and exchange rates affect India's palm oil market.

Using the information below, write ONE concise paragraph (4–6 sentences)
summarizing the expected economic impact.

Guidelines:
- Focus on direction and relative magnitude of change, not exact numbers
- Explain implications for imports and prices
- Maintain a neutral, analytical tone
- Do NOT mention AI, models, or data sources
- Do NOT use bullet points

Policy Assumptions:
${JSON.stringify(inputs, null, 2)}

Market Conditions:
${JSON.stringify(market, null, 2)}

Current Baseline Values:
${JSON.stringify(current, null, 2)}

Simulated Outcomes:
${JSON.stringify(outputs, null, 2)}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text?.trim() || "";
}