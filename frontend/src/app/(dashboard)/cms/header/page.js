export default function CmsHeaderPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Header Manager</h1>
      <p className="text-muted text-sm mb-6">Manage navigation links shown in the public site header</p>
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <p className="text-muted text-sm">Header link builder will be rendered here.</p>
      </div>
    </div>
  );
}
