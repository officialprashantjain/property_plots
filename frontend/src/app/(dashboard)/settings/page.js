export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Settings</h1>
      <p className="text-muted text-sm mb-6">Manage system configuration and admin preferences</p>

      <div className="grid grid-cols-1 gap-4">
        {[
          { title: "Site Settings", desc: "Update site name, logo, timezone, and language." },
          { title: "Admin Accounts", desc: "Manage admin users and their access levels." },
          { title: "API Keys", desc: "Manage backend API keys and integrations." },
        ].map((s) => (
          <div key={s.title} className="bg-surface border border-border rounded-xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">{s.title}</p>
              <p className="text-xs text-muted mt-0.5">{s.desc}</p>
            </div>
            <button className="text-xs text-primary hover:underline font-medium">Configure →</button>
          </div>
        ))}
      </div>
    </div>
  );
}
