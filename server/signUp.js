import express from "express";
import supabaseAdmin from "./supabase.js"; 

const router = express.Router();

/**
 * POST /api/auth/signup
 * body: { email: string, password: string }
 */
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    // basic validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long." });
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm:true,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const user = data.user;

    await supabaseAdmin
      .from("users")
      .insert({
        id: user.id,
        email: user.email,
      });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(" Signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
