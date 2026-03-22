export default function Footer() {
  return (
    <footer className="bg-bg border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Left: Logo + description */}
          <div>
            <a href="#" className="font-serif text-xl font-semibold text-text">
              SkinSync
            </a>
            <p className="text-sm text-text-muted mt-3 leading-relaxed max-w-xs">
              © 2026 SkinSync. Clinical precision for your skin journey.
            </p>
          </div>

          {/* Center: empty on mobile, links on desktop - pushed right */}
          <div />

          {/* Right: Legal links */}
          <div className="flex flex-wrap gap-6 md:justify-end items-start text-xs tracking-wider uppercase text-text-muted">
            <a href="#" className="hover:text-text transition-colors duration-200">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-text transition-colors duration-200">
              Terms of Service
            </a>
            <a href="#" className="hover:text-text transition-colors duration-200">
              Contact Us
            </a>
            <a href="#" className="hover:text-text transition-colors duration-200">
              Scientific Method
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
