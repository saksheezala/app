import { useState, useEffect } from 'react';
import './App.css';

interface HealthStatus {
  status: string;
  environment: string;
  uptime: number;
  version: string;
}

function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000';

  useEffect(() => {
    const fetchHealth = async (): Promise<void> => {
      try {
        setLoading(true);
        const res = await fetch(`${apiBaseUrl}/health`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as HealthStatus;
        setHealth(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    void fetchHealth();
  }, [apiBaseUrl]);

  return (
    <main className="app">
      <header className="app-header">
        <div className="logo-wrapper">
          <div className="logo-icon">⚙️</div>
          <h1 className="logo-text">CICD Monorepo</h1>
        </div>
        <p className="tagline">React + Node.js · Dockerised · Azure DevOps</p>
      </header>

      <section className="status-section" aria-label="API Health Status">
        <h2>Backend Health</h2>
        {loading && (
          <div className="status-card loading" role="status" aria-busy="true">
            <span className="pulse-dot" />
            Connecting to API…
          </div>
        )}
        {error && (
          <div className="status-card error" role="alert">
            <span className="badge error">Error</span>
            <p>{error}</p>
            <small>Make sure the backend is running on <code>{apiBaseUrl}</code></small>
          </div>
        )}
        {health && !loading && (
          <div className="status-card healthy">
            <span className="badge healthy">● {health.status}</span>
            <dl className="health-details">
              <div><dt>Environment</dt><dd>{health.environment}</dd></div>
              <div><dt>Uptime</dt><dd>{health.uptime}s</dd></div>
              <div><dt>Version</dt><dd>v{health.version}</dd></div>
            </dl>
          </div>
        )}
      </section>

      <footer className="app-footer">
        <p>Phase 1 · Project Bootstrap Complete</p>
      </footer>
    </main>
  );
}

export default App;
