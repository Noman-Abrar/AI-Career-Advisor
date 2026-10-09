import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Eye, EyeOff, Check, X } from "lucide-react";
import axios from "axios";
import { useState } from "react";

function Register() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Password requirements
  const passwordRequirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const isStrongPassword =
    passwordRequirements.length &&
    passwordRequirements.uppercase &&
    passwordRequirements.lowercase &&
    passwordRequirements.number &&
    passwordRequirements.special;

  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  // Register
  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");

    // First name validation
    if (!firstName.trim()) {
      setError("Please enter your first name.");
      return;
    }

    // Last name validation
    if (!lastName.trim()) {
      setError("Please enter your last name.");
      return;
    }

    // Email validation
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    // Password validation
    if (!isStrongPassword) {
      setError(
        "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character.",
      );
      return;
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Combine first + last name
      const fullName = `${firstName.trim()} ${lastName.trim()}`;

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          name: fullName,
          email: email.trim(),
          password,
        },
      );

      console.log("Registration successful:", response.data);

      // Save JWT token
      const token = response.data.token;

      localStorage.setItem("token", token);

      // Go to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.log("Registration error:", error);

      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Password requirement component
  const Requirement = ({ valid, children }) => {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          color: valid ? "#7ee787" : "#70798c",
        }}
      >
        {valid ? <Check size={12} /> : <X size={12} />}
        <span>{children}</span>
      </div>
    );
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <Sparkles size={22} />
          <span>CareerAI</span>
        </div>

        {/* Heading */}
        <h1>Create your account</h1>

        <p className="auth-subtitle">
          Start building your personalized career path.
        </p>

        {/* Registration Form */}
        <form onSubmit={handleRegister}>
          {/* First Name + Last Name */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            {/* First Name */}
            <div className="input-group">
              <label>First Name</label>

              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                required
              />
            </div>

            {/* Last Name */}
            <div className="input-group">
              <label>Last Name</label>

              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="input-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {/* Password */}
          <div className="input-group">
            <label>Password</label>

            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                style={{
                  width: "100%",
                  paddingRight: "42px",
                }}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "#70798c",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            {/* Password Requirements */}
            {password && (
              <div
                style={{
                  marginTop: "9px",
                  fontSize: "11px",
                  lineHeight: "1.8",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  columnGap: "10px",
                }}
              >
                <Requirement valid={passwordRequirements.length}>
                  8+ characters
                </Requirement>

                <Requirement valid={passwordRequirements.uppercase}>
                  Uppercase letter
                </Requirement>

                <Requirement valid={passwordRequirements.lowercase}>
                  Lowercase letter
                </Requirement>

                <Requirement valid={passwordRequirements.number}>
                  Number
                </Requirement>

                <Requirement valid={passwordRequirements.special}>
                  Special character
                </Requirement>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="input-group">
            <label>Confirm Password</label>

            <div style={{ position: "relative" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                style={{
                  width: "100%",
                  paddingRight: "42px",
                }}
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "#70798c",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            {/* Password Match */}
            {confirmPassword && (
              <div
                style={{
                  marginTop: "7px",
                  fontSize: "11px",
                  color: passwordsMatch ? "#7ee787" : "#ff6b6b",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                {passwordsMatch ? <Check size={12} /> : <X size={12} />}

                {passwordsMatch ? "Passwords match" : "Passwords do not match"}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <p
              style={{
                color: "#ff6b6b",
                fontSize: "12px",
                marginBottom: "15px",
                lineHeight: "1.5",
              }}
            >
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Login */}
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>

        {/* Back Home */}
        <Link to="/" className="back-home">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}

export default Register;
