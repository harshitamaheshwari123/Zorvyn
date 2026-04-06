import { useEffect, useState } from "react";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { mapUserFromApi } from "../utils/user";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setMessage({ type: "", text: "" });
        const res = await API.get("/users/me");
        if (cancelled) return;
        const mapped = mapUserFromApi(res.data);
        if (!mapped?.email) {
          throw new Error("Invalid profile response");
        }
        setUser(mapped);
        localStorage.setItem("user", JSON.stringify(mapped));
        setName(mapped.name ?? "");
      } catch (err) {
        if (cancelled) return;
        try {
          const raw = localStorage.getItem("user");
          if (raw) {
            const cached = JSON.parse(raw);
            setName(cached.name ?? "");
            if (!cached.email) {
              setMessage({
                type: "error",
                text: "Could not load profile. Try logging in again.",
              });
            }
          } else {
            setMessage({
              type: "error",
              text:
                err.response?.data?.message ||
                "Could not load profile. Check that the API is running.",
            });
          }
        } catch {
          setMessage({
            type: "error",
            text: "Could not load profile.",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  const saveName = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    const trimmed = name.trim();
    if (!trimmed) {
      setMessage({ type: "error", text: "Name cannot be empty." });
      return;
    }
    setSavingProfile(true);
    try {
      const res = await API.patch("/users/me", { name: trimmed });
      const mapped = mapUserFromApi(res.data);
      setUser(mapped);
      localStorage.setItem("user", JSON.stringify(mapped));
      setMessage({ type: "ok", text: "Profile updated." });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Could not save.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "New password must be at least 6 characters.",
      });
      return;
    }
    setSavingPassword(true);
    try {
      await API.patch("/users/me", {
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage({ type: "ok", text: "Password changed. Use it next time you log in." });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Could not change password.",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const roleLabel = {
    admin: "Administrator",
    analyst: "Analyst",
    viewer: "Viewer",
  };

  if (loading && !user) {
    return (
      <Layout>
        <p className="muted">Loading profile…</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-head">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">
          Manage your account details and security.
        </p>
      </div>

      {message.text && (
        <div
          className={
            message.type === "ok" ? "flash flash-success" : "flash flash-error"
          }
        >
          {message.text}
        </div>
      )}

      <div className="profile-grid">
        <section className="card card-elevated">
          <h2 className="card-title">Account</h2>
          <dl className="dl-grid">
            <dt>Email</dt>
            <dd>{user?.email}</dd>
            <dt>Role</dt>
            <dd>
              <span className={`role-pill role-${user?.role ?? "viewer"}`}>
                {roleLabel[user?.role] ?? user?.role}
              </span>
            </dd>
            <dt>Status</dt>
            <dd>{user?.isActive ? "Active" : "Inactive"}</dd>
          </dl>
        </section>

        <section className="card card-elevated">
          <h2 className="card-title">Display name</h2>
          <form onSubmit={saveName} className="form-stack">
            <label className="label" htmlFor="profile-name">
              Name
            </label>
            <input
              id="profile-name"
              className="input input-lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingProfile}
            >
              {savingProfile ? "Saving…" : "Save name"}
            </button>
          </form>
        </section>

        <section className="card card-elevated profile-wide">
          <h2 className="card-title">Change password</h2>
          <form onSubmit={savePassword} className="form-stack">
            <label className="label" htmlFor="cur-pw">
              Current password
            </label>
            <input
              id="cur-pw"
              className="input input-lg"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <label className="label" htmlFor="new-pw">
              New password
            </label>
            <input
              id="new-pw"
              className="input input-lg"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <label className="label" htmlFor="conf-pw">
              Confirm new password
            </label>
            <input
              id="conf-pw"
              className="input input-lg"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingPassword}
            >
              {savingPassword ? "Updating…" : "Update password"}
            </button>
          </form>
        </section>
      </div>
    </Layout>
  );
}
