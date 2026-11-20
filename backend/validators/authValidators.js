const { z } = require("zod");

// Validation rules for user registration.
const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must contain at least 3 characters")
    .max(50, "Name cannot exceed 50 characters"),

  email: z.string().trim().email("Please enter a valid email address"),

  password: z
    .string()
    .min(8, "Password must contain at least 8 characters")
    .max(72, "Password cannot exceed 72 characters"),
});

// Validation rules for user login.
const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required")
    .max(72, "Password cannot exceed 72 characters"),
});

module.exports = {
  registerSchema,
  loginSchema,
};
