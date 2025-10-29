import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const token = req.cookies?.access_token; // read cookie from request

  // If no cookie, user not logged in
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    // Verify JWT signature using secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to request object
    req.user = decoded;
    
    // Move on to the next middleware or route
    next();
  } catch (err) {
    // Token invalid, expired, or tampered with
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}