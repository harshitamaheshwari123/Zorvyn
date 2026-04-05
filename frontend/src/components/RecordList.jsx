import { useState } from "react";
import API from "../api/api";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function creatorLabel(createdBy) {
  if (!createdBy) return "—";
  if (typeof createdBy === "object") {
    return createdBy.name || createdBy.email || "—";
  }
  return "—";
}

function toInputDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const emptyEditForm = {
  amount: "",
  type: "income",
  category: "",
  date: "",
  notes: "",
};

export default function RecordList({ records, canMutate, onChanged }) {
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [saveError, setSaveError] = useState("");

  const openEdit = (record) => {
    setSaveError("");
    setEditing(record);
    setEditForm({
      amount: String(record.amount ?? ""),
      type: record.type === "expense" ? "expense" : "income",
      category: record.category ?? "",
      date: toInputDate(record.date),
      notes: record.notes ?? "",
    });
  };

  const closeEdit = () => {
    setEditing(null);
    setEditForm(emptyEditForm);
    setSaveError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editing || !canMutate) return;
    setSaveError("");
    const amount = Number(editForm.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      setSaveError("Enter a valid amount");
      return;
    }
    if (!editForm.category.trim()) {
      setSaveError("Category is required");
      return;
    }
    try {
      await API.put(`/records/${editing._id}`, {
        amount,
        type: editForm.type,
        category: editForm.category.trim(),
        date: editForm.date
          ? new Date(editForm.date).toISOString()
          : undefined,
        notes: editForm.notes,
      });
      closeEdit();
      onChanged?.();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.details?.join?.(", ") ||
        "Update failed";
      setSaveError(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!canMutate) return;
    if (!window.confirm("Delete this record?")) return;
    try {
      const res = await API.delete(`/records/${id}`);
      const msg = res.data?.message || "Archived.";
      alert(msg);
      onChanged?.();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  if (!records?.length) {
    return (
      <div className="card muted">No records match the current filters.</div>
    );
  }

  return (
    <div className="card card-elevated">
      <h2 className="card-title">Transaction list</h2>
      <p className="muted" style={{ marginTop: "-0.5rem", marginBottom: "1rem" }}>
        {canMutate
          ? "Shared ledger: everyone sees the same rows. You can edit or archive any active record."
          : "Shared ledger (read-only): entries created or updated by admins appear here for everyone."}
      </p>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Recorded by</th>
              <th>Last updated</th>
              <th>Notes</th>
              {canMutate && <th />}
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id}>
                <td>{formatDate(r.date)}</td>
                <td>{r.type}</td>
                <td>{r.category}</td>
                <td>₹{Number(r.amount).toLocaleString()}</td>
                <td>{creatorLabel(r.createdBy)}</td>
                <td className="muted" style={{ fontSize: "0.85rem" }}>
                  {formatDate(r.updatedAt)}
                </td>
                <td>{r.notes || "—"}</td>
                {canMutate && (
                  <td>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ marginRight: 6 }}
                      onClick={() => openEdit(r)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(r._id)}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={closeEdit}
        >
          <div
            className="modal"
            role="dialog"
            aria-labelledby="edit-record-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="edit-record-title">Edit record</h3>
            <form onSubmit={handleSave}>
              {saveError && (
                <p style={{ color: "#b91c1c", marginTop: 0 }}>{saveError}</p>
              )}
              <div className="modal-field">
                <label htmlFor="edit-amount">Amount</label>
                <input
                  id="edit-amount"
                  className="input"
                  style={{ width: "100%" }}
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.amount}
                  onChange={(e) =>
                    setEditForm({ ...editForm, amount: e.target.value })
                  }
                  required
                />
              </div>
              <div className="modal-field">
                <label htmlFor="edit-type">Type</label>
                <select
                  id="edit-type"
                  className="input"
                  style={{ width: "100%" }}
                  value={editForm.type}
                  onChange={(e) =>
                    setEditForm({ ...editForm, type: e.target.value })
                  }
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div className="modal-field">
                <label htmlFor="edit-category">Category</label>
                <input
                  id="edit-category"
                  className="input"
                  style={{ width: "100%" }}
                  value={editForm.category}
                  onChange={(e) =>
                    setEditForm({ ...editForm, category: e.target.value })
                  }
                  required
                />
              </div>
              <div className="modal-field">
                <label htmlFor="edit-date">Date</label>
                <input
                  id="edit-date"
                  className="input"
                  style={{ width: "100%" }}
                  type="date"
                  value={editForm.date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, date: e.target.value })
                  }
                />
              </div>
              <div className="modal-field">
                <label htmlFor="edit-notes">Notes</label>
                <textarea
                  id="edit-notes"
                  className="input"
                  style={{ width: "100%", minHeight: 72, resize: "vertical" }}
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={closeEdit}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
