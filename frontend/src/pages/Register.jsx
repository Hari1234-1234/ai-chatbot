import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Update form fields when the user types.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  // Submit registration data to the backend.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await registerUser(formData);

      // Save the returned user and JWT token.
      login(response.user, response.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const passwordLength = formData.password.length;
  const passwordLongEnough = passwordLength >= 8;

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Upload documents and ask questions about them."
      footer={
        <>
          Already have an account? <Link to="/login">Log in</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Your full name"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            minLength={3}
            maxLength={50}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <div className="password-wrap">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              aria-describedby="password-hint"
              value={formData.password}
              onChange={handleChange}
              minLength={8}
              maxLength={72}
              required
            />
            <button
              type="button"
              className="toggle-visibility"
              onClick={() => setShowPassword((s) => !s)}
              aria-pressed={showPassword}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <p
            id="password-hint"
            className={`field-hint ${passwordLongEnough ? "is-met" : ""}`}
          >
            {passwordLongEnough
              ? "Long enough"
              : `${passwordLength} of 8 characters minimum`}
          </p>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Register;
