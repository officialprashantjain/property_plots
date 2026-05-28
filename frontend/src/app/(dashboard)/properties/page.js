export default function PropertiesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Properties</h1>
          <p className="text-muted text-sm">Manage all property listings</p>
        </div>
        <button className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          + Add Property
        </button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          placeholder="Search properties..."
          className="px-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-dark focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select className="px-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
          <option>All Types</option>
          <option>For Sale</option>
          <option>For Rent</option>
        </select>
        <select className="px-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>

      {/* Table Placeholder */}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-background border-b border-border">
            <tr>
              {["Title", "Type", "Price", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-muted text-sm">
                Properties will load from the API here.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
