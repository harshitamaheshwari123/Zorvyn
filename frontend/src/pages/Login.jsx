import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import { mapUserFromApi } from "../utils/user";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const registerNotice = location.state?.registerNotice;
  const assignedRole = location.state?.assignedRole;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await API.post("/auth/login", { email, password });
      login(res.data.token, mapUserFromApi(res.data.user));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      lead="Sign in to manage records and view financial insights."
    >
      {registerNotice && (
        <div className="flash flash-success" style={{ marginBottom: "1rem" }}>
          {registerNotice}
          {assignedRole && (
            <>
              {" "}
              Your role: <strong>{assignedRole}</strong>.
            </>
          )}
        </div>
      )}
      <form className="form-stack" onSubmit={handleSubmit} style={{ maxWidth: "none" }}>
        {error && <div className="flash flash-error">{error}</div>}
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="input input-lg"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="input input-lg"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <button className="btn btn-primary" type="submit" style={{ marginTop: "0.25rem" }}>
          Log in
        </button>
      </form>
      <p className="muted" style={{ marginTop: "1.25rem", marginBottom: 0 }}>
        No account? <Link to="/register">Create one</Link>
      </p>
    </AuthLayout>
  );
}
