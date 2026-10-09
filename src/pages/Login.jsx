import { Link, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import axios from "axios";
import { useState } from "react";

function Login() {
  // Page redirect karne ke liye
  const navigate = useNavigate();

  // Email aur password store karne ke liye
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Error message ke liye
  const [error, setError] = useState("");

  // Loading state
  const [loading, setLoading] = useState(false);

  // Login function
  const handleLogin = async (e) => {
    // Form ka default page reload rokna
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // Backend login API ko email/password bhejna
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          email,
          password,
        },
      );

      // Backend se JWT token lena
      const token = response.data.token;

      // JWT browser ke localStorage mein save karna
      localStorage.setItem("token", token);

      console.log("Login successful:", response.data);

      // Login ke baad Dashboard par jana
      navigate("/dashboard");
    } catch (error) {
      console.log("Login error:", error);

      // Backend ka error message show karna
      setError(
        error.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Sparkles size={22} />
          <span>CareerAI</span>
        </div>

        <h1>Welcome back</h1>

        <p className="auth-subtitle">
          Sign in to continue your career journey.
        </p>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Error message */}

          {error && (
            <p
              style={{
                color: "#ff6b6b",
                marginBottom: "15px",
              }}
            >
              {error}
            </p>
          )}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create account</Link>
        </p>

        <Link to="/" className="back-home">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}

export default Login;
