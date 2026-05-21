function App() {
  return (
    <div className="min-h-screen bg-background-primary flex flex-col items-center justify-center p-4">
      <div className="relative group">
        <div className="absolute -inset-1 bg-purple-neon rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative px-8 py-6 bg-card-elevated rounded-lg leading-none flex items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-bold text-text-primary text-center">
            Investment <span className="text-purple-bright">Platform</span>
          </h1>
        </div>
      </div>

      <p className="mt-8 text-text-secondary text-lg text-center max-w-md">
        Phase 1: Foundation Initialization. Verified theme and global styles.
      </p>

      <button className="mt-12 btn-gradient glow-purple">
        Get Started
      </button>

      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
        <div className="p-4 bg-card rounded-lg border border-purple-primary/20 text-center">
          <div className="text-purple-soft font-mono">#050508</div>
          <div className="text-xs text-text-muted mt-1 uppercase">Primary</div>
        </div>
        <div className="p-4 bg-card-elevated rounded-lg border border-purple-primary/20 text-center">
          <div className="text-purple-soft font-mono">#1A1A28</div>
          <div className="text-xs text-text-muted mt-1 uppercase">Elevated</div>
        </div>
        <div className="p-4 bg-purple-primary rounded-lg text-center">
          <div className="text-white font-mono">#7C3AED</div>
          <div className="text-xs text-purple-soft mt-1 uppercase">Purple</div>
        </div>
        <div className="p-4 bg-success rounded-lg text-center">
          <div className="text-white font-mono">#22C55E</div>
          <div className="text-xs text-green-100 mt-1 uppercase">Success</div>
        </div>
      </div>
    </div>
  )
}

export default App
