const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ message: "No authentication token, authorization denied." });
    }

    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No authentication token, authorization denied." });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) {
      return res.status(401).json({ message: "Token verification failed, authorization denied." });
    }

    // If this is an admin token, bypass User lookup
    if (verified.role === "admin") {
      req.user = {
        id: "admin",
        role: "admin",
        name: "Admin",
      };
      return next();
    }

    // Fetch the full user so we always have companyId available
    const user = await User.findById(verified.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    req.user = {
      id: user._id.toString(),
      companyId: user.companyId ? user.companyId.toString() : null,
      role: user.role,
      companyName: user.companyName,
      name: user.name,
      universityId: user.universityId ? user.universityId.toString() : null,
    };
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = auth;
