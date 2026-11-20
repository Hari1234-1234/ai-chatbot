const prisma = require("../config/db");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

// ==============================
// USER REGISTRATION
// ==============================
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check whether the email is already registered.
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // Hash the password before saving it.
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user in PostgreSQL.
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // Generate a JWT token.
    const token = generateToken(user.id);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong during registration",
    });
  }
};

// ==============================
// USER LOGIN
// ==============================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user using their email.
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // Check whether the user exists.
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare entered password with the stored hash.
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate a new JWT token.
    const token = generateToken(user.id);

    // Do not send the password hash to the frontend.
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong during login",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
