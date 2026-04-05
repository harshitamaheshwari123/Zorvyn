import { useCallback, useEffect, useRef, useState } from "react";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import RecordForm from "../components/RecordForm";
import RecordList from "../components/RecordList";
import FilterBar from "../components/FilterBar";
import ActivityLog from "../components/ActivityLog";

function buildQuery(filters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  });
  const s = params.toString();
  return s ? `?${s}` : "";
}

export default function Dashboard() {
  const { role } = useAuth();
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({});
  const [filters, setFilters] = useState({});
  const [recordsError, setRecordsError] = useState("");
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(true);

  const [adminOrgScope, setAdminOrgScope] = useState(false);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const canSeeRecords = ["viewer", "analyst", "admin"].includes(role);
  const canEditRecords = role === "admin";

  const fetchAuditLogs = useCallback(async () => {
    setAuditLoading(true);
    try {
      const res = await API.get("/audit-logs?limit=50");
      setAuditLogs(res.data?.data ?? []);
    } catch {
      setAuditLogs([]);
    } finally {
      setAuditLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    const scopeQ =
      role === "admin" && adminOrgScope ? "?scope=all" : "";
    const res = await API.get(`/dashboard${scopeQ}`);
    setSummary(res.data);
  }, [role, adminOrgScope]);

  const fetchRecords = useCallback(async () => {
    if (!canSeeRecords) {
      setRecords([]);
      return;
    }
    setRecordsError("");
    try {
      const q = buildQuery(filtersRef.current);
      const res = await API.get(`/records${q}`);
      const list = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setRecords(list);
    } catch (err) {
      if (err.response?.status === 403) {
        setRecords([]);
        const detail = err.response?.data?.message;
        setRecordsError(
          detail
            ? `${detail} If you are a viewer, restart the backend so GET /api/records allows your role, then log in again.`
            : "Access denied for the transaction list (403). Restart the backend after updating code and ensure your user has role viewer, analyst, or admin."
        );
      } else {
        setRecordsError(err.response?.data?.message || "Could not load records");
      }
    }
  }, [canSeeRecords]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  return (
    <Layout>
      <div className="page-head">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          {summary.dashboardScope === "organization"
            ? "Organization-wide totals and trends (all users’ active records)."
            : "Your workspace: balances, category mix, trends, and recent transactions."}
        </p>
        {summary.dashboardScopeNote && (
          <p className="muted" style={{ marginTop: "0.35rem", fontSize: "0.875rem" }}>
            Data scope: {summary.dashboardScopeNote}
          </p>
        )}
        {role === "admin" && (
          <div className="row" style={{ marginTop: "0.75rem" }}>
            <span className="muted" style={{ fontSize: "0.8rem", marginRight: "0.5rem" }}>
              Dashboard view:
            </span>
            <button
              type="button"
              className={`btn btn-sm ${!adminOrgScope ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setAdminOrgScope(false)}
            >
              My records
            </button>
            <button
              type="button"
              className={`btn btn-sm ${adminOrgScope ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setAdminOrgScope(true)}
            >
              Whole organization
            </button>
          </div>
        )}
      </div>

      <div className="section-label">Overview</div>
      <div className="grid-3">
        <div className="stat">
          <span className="muted">Total income</span>
          <strong>₹{Number(summary.totalIncome ?? 0).toLocaleString()}</strong>
        </div>
        <div className="stat stat-expense">
          <span className="muted">Total expenses</span>
          <strong>₹{Number(summary.totalExpense ?? 0).toLocaleString()}</strong>
        </div>
        <div className="stat stat-net">
          <span className="muted">Net balance</span>
          <strong>₹{Number(summary.netBalance ?? 0).toLocaleString()}</strong>
        </div>
      </div>

      <div className="section-label">Activity</div>
      <ActivityLog entries={auditLogs} loading={auditLoading} />

      {summary.categoryWise?.length > 0 && (
        <>
          <div className="section-label">Analytics</div>
          <div className="card card-elevated">
            <h2 className="card-title">Income & expense by category</h2>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Income</th>
                    <th>Expense</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.categoryWise.map((row) => (
                    <tr key={row._id}>
                      <td>{row._id}</td>
                      <td>₹{Number(row.income ?? 0).toLocaleString()}</td>
                      <td>₹{Number(row.expense ?? 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <div className="section-label">Trends</div>
      {summary.monthlyTrends?.length > 0 ? (
        <div className="card card-elevated">
          <h2 className="card-title">Monthly (by transaction date)</h2>
          <p className="muted" style={{ marginTop: "-0.5rem", marginBottom: "1rem" }}>
            Income vs expense per calendar month
          </p>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Month</th>
                  <th>Income</th>
                  <th>Expense</th>
                </tr>
              </thead>
              <tbody>
                {summary.monthlyTrends.map((row) => (
                  <tr key={`${row._id?.y}-${row._id?.m}`}>
                    <td>{row._id?.y}</td>
                    <td>{row._id?.m}</td>
                    <td>₹{Number(row.income ?? 0).toLocaleString()}</td>
                    <td>₹{Number(row.expense ?? 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card muted">No monthly data yet — add transactions to see trends.</div>
      )}

      {summary.weeklyTrends?.length > 0 && (
        <div className="card card-elevated">
          <h2 className="card-title">Weekly (ISO week)</h2>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Week</th>
                  <th>Income</th>
                  <th>Expense</th>
                </tr>
              </thead>
              <tbody>
                {summary.weeklyTrends.map((row) => (
                  <tr key={`${row._id?.year}-${row._id?.week}`}>
                    <td>{row._id?.year}</td>
                    <td>{row._id?.week}</td>
                    <td>₹{Number(row.income ?? 0).toLocaleString()}</td>
                    <td>₹{Number(row.expense ?? 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {summary.recentActivity?.length > 0 && (
        <div className="card card-elevated">
          <h2 className="card-title">Recent activity</h2>
          <ul className="activity-list">
            {summary.recentActivity.map((r) => (
              <li key={r._id}>
                <span className="activity-type">{r.type}</span>
                <span className="activity-meta">
                  {r.category} · ₹{Number(r.amount).toLocaleString()}
                  {r.createdBy?.name && (
                    <span className="muted"> · {r.createdBy.name}</span>
                  )}
                </span>
                <span className="muted activity-date">
                  {new Date(r.date).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {canSeeRecords && (
        <>
          <div className="section-label">Records</div>
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            onApply={() => fetchRecords()}
          />
          {recordsError && (
            <div className="flash flash-error">{recordsError}</div>
          )}
          {canEditRecords && (
            <RecordForm
              onSaved={() => {
                fetchRecords();
                fetchSummary();
                fetchAuditLogs();
              }}
            />
          )}
          <RecordList
            records={records}
            canMutate={canEditRecords}
            onChanged={() => {
              fetchRecords();
              fetchSummary();
              fetchAuditLogs();
            }}
          />
        </>
      )}
    </Layout>
  );
}
