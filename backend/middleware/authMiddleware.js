const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    req.userRole = decoded.role; // Add this line to set the role
    console.log('[verifyToken] User:', { id: decoded.id, email: decoded.email, role: decoded.role });
    next();
  } catch (error) {
    console.error('[verifyToken] Error:', error);
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Check if user is staff
exports.isStaff = (req, res, next) => {
  console.log('[isStaff] Checking role:', req.userRole);
  if (req.userRole !== "staff") {
    return res.status(403).json({ error: "Access denied. Staff only." });
  }
  next();
};

// Check if user is customer
exports.isCustomer = (req, res, next) => {
  console.log('[isCustomer] Checking role:', req.userRole);
  if (req.userRole !== "customer") {
    return res.status(403).json({ error: "Access denied. Customers only." });
  }
  next();
};