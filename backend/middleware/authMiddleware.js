const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
  try {
    // Read the Authorization header.
    const authHeader = req.headers.authorization;

    // Check whether the token exists.
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required",
      });
    }

    // Extract the token after "Bearer ".
    const token = authHeader.split(" ")[1];

    // Verify the token using our secret.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Store the authenticated user's ID in the request.
    req.user = {
      userId: decoded.userId,
    };

    // Continue to the protected route.
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = authenticateUser;
