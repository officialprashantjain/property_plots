export default function CmsBlogsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blogs</h1>
          <p className="text-muted text-sm">Create and manage blog posts</p>
        </div>
        <button className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          + New Post
        </button>
      </div>
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <p className="text-muted text-sm">Blog posts table will load here.</p>
      </div>
    </div>
  );
}
