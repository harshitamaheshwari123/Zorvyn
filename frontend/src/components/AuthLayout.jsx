export default function AuthLayout({ title, lead, children }) {
  return (
    <div className="auth-shell">
      <div className="auth-hero">
        <div className="nav-mark" style={{ marginBottom: "1.5rem" }}>
          Z
        </div>
        <p className="auth-hero-brand">Zorvyn</p>
        <p>
          Role-based finance dashboard: track income and expenses, insights by
          category, and secure access for your team.
        </p>
      </div>
      <div className="auth-panel">
        <div className="auth-card">
          <h1>{title}</h1>
          {lead && <p className="auth-lead">{lead}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
