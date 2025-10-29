import express from "express";
import bcrypt from "bcrypt";
import { db } from "./db.js"; 

const router = express.Router();

// allowed government email domains
const ALLOWED_DOMAINS = ["gov.in", "nic.in", "ias.nic.in", "ifs.nic.in"];

// helper: check if email ends with any allowed domain
function isGovEmail(email = "") {
  const lower = email.toLowerCase();
  return ALLOWED_DOMAINS.some((d) => lower.endsWith("@" + d));
}

/**
 * POST /api/auth/signup
 * body: { govt_email: string, password: string }
 */
router.post("/signup", async (req, res) => {
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

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long." });
    }

    // hash password before storing
    const hash = await bcrypt.hash(password, 12);

    // insert into database (avoid duplicates)
    const result = await db.query(
      `
      INSERT INTO users (govt_email, password_hash)
      VALUES ($1, $2)
      ON CONFLICT (govt_email) DO NOTHING
      RETURNING id, govt_email, created_at
      `,
      [govt_email, hash]
    );

    // if user already exists
    if (result.rowCount === 0) {
      return res
        .status(409)
        .json({ error: "An account with this email already exists." });
    }

    // success
    res
      .status(201)
      .json({ message: "User registered successfully", user: result.rows[0] });
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
