export default function App() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-body p-10">
      <h1 className="font-display text-5xl font-bold">Theme Tokens Test</h1>

      <p className="mt-4 text-text-secondary">
        Se isso estiver estilizado corretamente, os tokens do Tailwind funcionaram.
      </p>

      <div className="mt-8 rounded-panel border border-border bg-surface p-6 shadow-glow">
        <h2 className="text-2xl font-semibold">Surface Card</h2>
        <p className="mt-2 text-muted">
          Agora você pode usar classes curtas e limpas.
        </p>

        <button className="mt-4 rounded-full bg-accent px-6 py-3 font-semibold text-black transition hover:bg-accent-hover">
          Test button
        </button>
      </div>
    </div>
  )
}