export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Portfolio API</h1>
      <p>Backend API for the portfolio website is running successfully!</p>

      <h2>API Endpoints</h2>

      <h3>Authentication</h3>
      <ul>
        <li><code>POST /api/auth/login</code> - Admin login</li>
        <li><code>POST /api/auth/logout</code> - Logout</li>
        <li><code>GET /api/auth/session</code> - Check session</li>
      </ul>

      <h3>Projects</h3>
      <ul>
        <li><code>GET /api/projects</code> - List projects</li>
        <li><code>GET /api/projects/featured</code> - Featured projects</li>
        <li><code>GET /api/projects/[slug]</code> - Get project by slug</li>
        <li><code>POST /api/projects</code> - Create project (Admin)</li>
        <li><code>PUT /api/projects/[slug]</code> - Update project (Admin)</li>
        <li><code>DELETE /api/projects/[slug]</code> - Delete project (Admin)</li>
      </ul>

      <h3>Publications</h3>
      <ul>
        <li><code>GET /api/publications</code> - List publications</li>
        <li><code>GET /api/publications/featured</code> - Featured publications</li>
        <li><code>GET /api/publications/[slug]</code> - Get publication by slug</li>
        <li><code>POST /api/publications/sync</code> - Sync from external platforms (Admin)</li>
      </ul>

      <h3>Guidebooks</h3>
      <ul>
        <li><code>GET /api/guidebooks</code> - List guidebooks</li>
        <li><code>GET /api/guidebooks/featured</code> - Featured guidebooks</li>
        <li><code>GET /api/guidebooks/[slug]</code> - Get guidebook with articles</li>
      </ul>

      <h3>Other</h3>
      <ul>
        <li><code>GET /api/timeline</code> - Content timeline</li>
        <li><code>GET /api/tags</code> - All tags</li>
        <li><code>GET /api/tags/categories</code> - Tags by category</li>
        <li><code>POST /api/contact</code> - Contact form</li>
        <li><code>GET /api/admin/stats</code> - Dashboard stats (Admin)</li>
      </ul>

      <h2>Documentation</h2>
      <p>For detailed API documentation, see <code>/Docs/architecture/api-architecture.md</code></p>

      <h2>Quick Start</h2>
      <ol>
        <li>Ensure database is set up: <code>npm run db:migrate</code></li>
        <li>Seed initial data: <code>npm run db:seed</code></li>
        <li>Start development server: <code>npm run dev</code></li>
      </ol>
    </main>
  );
}
