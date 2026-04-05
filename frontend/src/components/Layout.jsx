import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function initials(name) {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Layout({ children }) {
  const { user, role, logout, token } = useAuth();

  return (
    <div className="layout">
      <header className="topbar">
        <div className="row" style={{ gap: "1.25rem" }}>
          <Link to="/dashboard" className="nav-brand">
            <span className="nav-mark" aria-hidden>
              Z
            </span>
            Zorvyn
          </Link>
          {token && (
            <nav className="nav-links" aria-label="Main">
              <NavLink
                to="/dashboard"
                className={({ isActive }) => (isActive ? "active" : "")}
                end
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Profile
              </NavLink>
              {role === "admin" && (
                <NavLink
                  to="/users"
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  Team
                </NavLink>
              )}
            </nav>
          )}
        </div>
        <div className="nav-user">
          {user && token && (
            <>
              <Link
                to="/profile"
                className="row"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="avatar" title={user.name}>
                  {initials(user.name)}
                </span>
                <span className="muted" style={{ fontSize: "0.875rem" }}>
                  <span
                    style={{
                      color: "var(--text)",
                      fontWeight: 600,
                      display: "block",
                      lineHeight: 1.2,
                    }}
                  >
                    {user.name}
                  </span>
                  <span className={`role-pill role-${role ?? "viewer"}`}>
                    {role}
                  </span>
                </span>
              </Link>
            </>
          )}
          {token ? (
            <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
              Log out
            </button>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              Log in
            </Link>
          )}
        </div>
      </header>
      <main className="main">{children}</main>
    </div>
  );
}
