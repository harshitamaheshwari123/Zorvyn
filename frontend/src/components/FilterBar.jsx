export default function FilterBar({ filters, setFilters, onApply }) {
  return (
    <div className="card card-elevated filter-toolbar">
      <div className="filter-field">
        <label htmlFor="f-type">Type</label>
        <select
          id="f-type"
          className="input"
          value={filters.type || ""}
          onChange={(e) =>
            setFilters({ ...filters, type: e.target.value || undefined })
          }
        >
          <option value="">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>
      <div className="filter-field">
        <label htmlFor="f-cat">Category</label>
        <input
          id="f-cat"
          className="input"
          placeholder="e.g. Salary"
          value={filters.category || ""}
          onChange={(e) =>
            setFilters({ ...filters, category: e.target.value || undefined })
          }
        />
      </div>
      <div className="filter-field">
        <label htmlFor="f-search">Search</label>
        <input
          id="f-search"
          className="input"
          placeholder="Notes or category"
          value={filters.search || ""}
          onChange={(e) =>
            setFilters({ ...filters, search: e.target.value || undefined })
          }
        />
      </div>
      <div className="filter-field">
        <label htmlFor="f-from">From</label>
        <input
          id="f-from"
          className="input"
          type="date"
          value={filters.startDate || ""}
          onChange={(e) =>
            setFilters({ ...filters, startDate: e.target.value || undefined })
          }
        />
      </div>
      <div className="filter-field">
        <label htmlFor="f-to">To</label>
        <input
          id="f-to"
          className="input"
          type="date"
          value={filters.endDate || ""}
          onChange={(e) =>
            setFilters({ ...filters, endDate: e.target.value || undefined })
          }
        />
      </div>
      <button type="button" className="btn btn-primary" onClick={onApply}>
        Apply filters
      </button>
    </div>
  );
}
