import { useEffect, useState } from "react";
import API from "../api/api";
import Layout from "../components/Layout";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load users");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeRole = async (id, role) => {
    try {
      await API.put(`/users/${id}/role`, { role });
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  const toggleActive = async (id, isActive) => {
    try {
      await API.patch(`/users/${id}/status`, { isActive });
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <Layout>
      <div className="page-head">
        <h1 className="page-title">Team & access</h1>
        <p className="page-subtitle">
          Assign roles and activation status. Only administrators can access this
          page.
        </p>
      </div>

      {error && <div className="flash flash-error">{error}</div>}

      <div className="card card-elevated">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      className="input"
                      style={{ minWidth: 120 }}
                      value={u.role}
                      onChange={(e) => changeRole(u._id, e.target.value)}
                    >
                      <option value="viewer">Viewer</option>
                      <option value="analyst">Analyst</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={
                        u.isActive
                          ? undefined
                          : { background: "#fee2e2", color: "#991b1b" }
                      }
                    >
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => toggleActive(u._id, !u.isActive)}
                    >
                      {u.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
