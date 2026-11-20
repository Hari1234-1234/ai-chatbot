const jwt = require("jsonwebtoken");

// Generate a JWT token for an authenticated user.
const generateToken = (userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  return token;
};

module.exports = generateToken;
