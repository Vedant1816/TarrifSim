import supabaseAdmin from "./supabase.js";

export async function requireAuth(req, res, next) {
  try {
    // Expect token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.replace("Bearer ", "");

    // Ask Supabase to verify the token
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Attach authenticated user to request
    req.user = {
      id: data.user.id,
      email: data.user.email,
      role: data.user.role,
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ error: "Unauthorized" });
  }
}
