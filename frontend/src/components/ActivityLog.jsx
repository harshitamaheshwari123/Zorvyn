function formatDt(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
}

const actionLabel = {
  create: "Created",
  update: "Updated",
  archive: "Archived",
  restore: "Restored",
};

export default function ActivityLog({ entries, loading }) {
  if (loading) {
    return (
      <div className="card card-elevated muted">Loading activity log…</div>
    );
  }

  if (!entries?.length) {
    return (
      <div className="card card-elevated">
        <h2 className="card-title">Admin activity log</h2>
        <p className="muted" style={{ marginBottom: 0 }}>
          No actions recorded yet. Entries appear here when an admin creates,
          edits, archives, or restores a transaction (read-only for everyone).
        </p>
      </div>
    );
  }

  return (
    <div className="card card-elevated">
      <h2 className="card-title">Admin activity log</h2>
      <p className="muted" style={{ marginTop: "-0.5rem", marginBottom: "1rem" }}>
        Read-only history: who changed the ledger and when. New events appear
        after admins save transactions.
      </p>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>When</th>
              <th>Who</th>
              <th>Action</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((row) => (
              <tr key={row._id}>
                <td style={{ whiteSpace: "nowrap", fontSize: "0.875rem" }}>
                  {formatDt(row.createdAt)}
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>
                    {row.actor?.name || row.actor?.email || "—"}
                  </div>
                  {row.actor?.role && (
                    <span className="muted" style={{ fontSize: "0.8rem" }}>
                      {row.actor.role}
                    </span>
                  )}
                </td>
                <td>
                  <span className="badge">
                    {actionLabel[row.action] || row.action}
                  </span>
                </td>
                <td>{row.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
