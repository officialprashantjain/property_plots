export default function PropertyDetailPage({ params }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Property Detail</h1>
      <p className="text-muted text-sm mb-6">Editing property ID: <span className="text-primary font-medium">{params.id}</span></p>

      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <p className="text-muted text-sm">Property form will be rendered here dynamically.</p>
      </div>
    </div>
  );
}
