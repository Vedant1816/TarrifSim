// signIn.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "./db.js";

const router = express.Router();

// same domain policy as signUp.js
const ALLOWED_DOMAINS = ["gov.in", "nic.in", "ias.nic.in", "ifs.nic.in"];

function isGovEmail(email = "") {
  const lower = email.toLowerCase();
  return ALLOWED_DOMAINS.some((d) => lower.endsWith("@" + d));
}

// JWT config
const JWT_SECRET = process.env.JWT_SECRET || "dev_only_change_me";
const TOKEN_TTL = "2h"; // adjust as needed

function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,     // set true when behind HTTPS
    sameSite: "lax",
    path: "/",
    maxAge: 2 * 60 * 60 * 1000, // 2h in ms
  };
}

/**
 * POST /api/auth/signin
 * body: { govt_email: string, password: string }
 */
router.post("/signin", async (req, res) => {
  try {
    const { govt_email, password } = req.body || {};

    // basic validation
    if (!govt_email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    if (!isGovEmail(govt_email)) {
      return res
        .status(400)
        .json({ error: "Only official government emails are allowed." });
    }

    // look up user
    const result = await db.query(
      `SELECT id, govt_email, password_hash FROM users WHERE govt_email = $1`,
      [govt_email]
    );

    if (result.rowCount === 0) {
      // do not reveal which field was wrong
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const user = result.rows[0];

    // verify password
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // sign token
    const token = jwt.sign(
      { uid: user.id, email: user.govt_email },
      JWT_SECRET,
      { expiresIn: TOKEN_TTL }
    );

    // set httpOnly cookie + also return token in body
    res
      .cookie("access_token", token, cookieOptions())
      .status(200)
      .json({
        message: "Signed in successfully",
        user: { id: user.id, govt_email: user.govt_email },
        token, // optional: for non-browser clients
      });
  } catch (err) {
    console.error("❌ Signin error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/auth/signout
 * Clears the auth cookie.
 */
router.post("/signout", (req, res) => {
  res.clearCookie("access_token", { path: "/" });
  res.status(200).json({ message: "Signed out" });
});

export default router;
