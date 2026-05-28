export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Dashboard Overview</h1>
      <p className="text-muted text-sm mb-6">Welcome back, Admin.</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Properties", value: "124", color: "text-primary" },
          { label: "Active Agents", value: "18", color: "text-success" },
          { label: "Blogs Published", value: "37", color: "text-secondary" },
          { label: "Pending Reviews", value: "9", color: "text-danger" },
        ].map((card) => (
          <div key={card.label} className="bg-surface border border-border rounded-xl p-5 shadow-sm">
            <p className="text-sm text-muted mb-1">{card.label}</p>
            <p className={`text-3xl font-extrabold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Placeholder recent activity */}
      <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
        <h2 className="text-base font-semibold text-foreground mb-3">Recent Activity</h2>
        <p className="text-muted text-sm">Activity feed will be dynamically loaded here.</p>
      </div>
    </div>
  );
}
