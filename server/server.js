import "dotenv/config";
import express from "express";
import cors from "cors";
import "./db.js";
import cookieParser from "cookie-parser";
import signUpRoute from "./signUp.js"
import signInRoute from "./signIn.js"
import { requireAuth } from "./authMiddleware.js";
import cpoRoute from "./cpoRoutes.js";
import indiaData from "./indiaData.js";
import simulateRoutes from "./simulateRoutes.js";
import summary from "./summary.js"

const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",  
    credentials: true,
  })
);


app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running and DB connected!" });
});

app.use("/api/auth", signUpRoute);

app.use("/api/auth", signInRoute);

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ message: "You are authenticated!", user: req.user });
});

app.use("/api/cpo", cpoRoute);

app.use("/api/cpo", indiaData);

app.use("/api/simulate", simulateRoutes);

app.use("/api/summary", summary)

app.listen(port, () => {
  console.log(` Server running on http://localhost:${port}`);
});