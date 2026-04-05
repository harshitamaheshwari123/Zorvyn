import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import AuthLayout from "../components/AuthLayout";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await API.post("/auth/register", form);
      navigate("/login", {
        replace: true,
        state: {
          registerNotice: res.data?.notice,
          assignedRole: res.data?.role,
        },
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.details?.join?.(", ") ||
        "Registration failed";
      setError(msg);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      lead="Start with a personal workspace. The first user in a new database becomes an admin."
    >
      <form className="form-stack" onSubmit={handleRegister} style={{ maxWidth: "none" }}>
        {error && <div className="flash flash-error">{error}</div>}
        <div>
          <label className="label" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            className="input input-lg"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            autoComplete="name"
          />
        </div>
        <div>
          <label className="label" htmlFor="email">
            Work email
          </label>
          <input
            id="email"
            className="input input-lg"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label className="label" htmlFor="password">
            Password (min 6 characters)
          </label>
          <input
            id="password"
            className="input input-lg"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            minLength={6}
            required
            autoComplete="new-password"
          />
        </div>
        <button className="btn btn-primary" type="submit" style={{ marginTop: "0.25rem" }}>
          Create account
        </button>
      </form>
      <p className="muted" style={{ marginTop: "1.25rem", marginBottom: 0 }}>
        Already registered? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}
