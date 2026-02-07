import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/api";
import "../styles/App.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginUser({ email, password });

      if (res.message === "Login successful" && res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("userName", res.full_name);
        navigate("/dashboard");
      } else {
        setError(res.message || "Login failed");
      }
    } catch (err) {
      setError("Server error. Please check if the backend is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p>
        No account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}

export default Login;
