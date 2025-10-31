import "dotenv/config";
import express from "express";
import cors from "cors";
import "./db.js";
import cookieParser from "cookie-parser";
import signUpRoute from "./signUp.js"
import signInRoute from "./signIn.js"
import { requireAuth } from "./authMiddleware.js";
import cpoRoute from "./cpoRoutes.js";

const app = express();
const port = process.env.port || 3000;


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

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});