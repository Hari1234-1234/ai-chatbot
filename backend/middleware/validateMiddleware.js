const validateRequest = (schema) => {
  return (req, res, next) => {
    // Validate the request body using the supplied Zod schema.
    const result = schema.safeParse(req.body);

    // If validation fails, return the validation errors.
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    // Replace request body with validated data.
    req.body = result.data;

    // Continue to the controller.
    next();
  };
};

module.exports = validateRequest;
