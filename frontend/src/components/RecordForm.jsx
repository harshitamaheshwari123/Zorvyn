import { useState } from "react";
import API from "../api/api";

export default function RecordForm({ onSaved }) {
  const [form, setForm] = useState({
    amount: "",
    type: "income",
    category: "",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const amount = Number(form.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      setError("Enter a valid amount");
      return;
    }
    try {
      await API.post("/records", {
        amount,
        type: form.type,
        category: form.category.trim(),
        date: form.date ? new Date(form.date).toISOString() : undefined,
        notes: form.notes,
      });
      setForm({
        amount: "",
        type: "income",
        category: "",
        date: new Date().toISOString().slice(0, 10),
        notes: "",
      });
      onSaved?.();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.details?.join?.(", ") ||
        "Could not save record";
      setError(msg);
    }
  };

  return (
    <div className="card card-elevated">
      <h2 className="card-title">Add transaction</h2>
      <p className="muted" style={{ marginTop: "-0.5rem", marginBottom: "1rem" }}>
        Administrators can create entries for this workspace.
      </p>
      {error && <div className="flash flash-error" style={{ marginBottom: "1rem" }}>{error}</div>}
      <form onSubmit={handleSubmit} className="filter-toolbar" style={{ alignItems: "flex-end" }}>
        <div className="filter-field">
          <label htmlFor="nf-amt">Amount</label>
          <input
            id="nf-amt"
            className="input"
            placeholder="0.00"
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
        </div>
        <div className="filter-field">
          <label htmlFor="nf-type">Type</label>
          <select
            id="nf-type"
            className="input"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div className="filter-field">
          <label htmlFor="nf-cat">Category</label>
          <input
            id="nf-cat"
            className="input"
            placeholder="e.g. Freelance"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
          />
        </div>
        <div className="filter-field">
          <label htmlFor="nf-date">Date</label>
          <input
            id="nf-date"
            className="input"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>
        <div className="filter-field" style={{ flex: "1 1 180px", minWidth: 160 }}>
          <label htmlFor="nf-notes">Notes</label>
          <input
            id="nf-notes"
            className="input"
            placeholder="Optional description"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
        <button className="btn btn-primary" type="submit">
          Add record
        </button>
      </form>
    </div>
  );
}
