'use client';

export default function Navigation() {
  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-border z-50">
      <div className="max-w-3xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <a
            href="#"
            className="text-xl font-bold text-foreground hover:text-primary transition-colors"
          >
            Jacobo De Cal
          </a>
          <ul className="flex gap-6">
            <li>
              <a
                href="#writing"
                className="text-text-secondary hover:text-foreground font-medium transition-colors"
              >
                Writing
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className="text-text-secondary hover:text-foreground font-medium transition-colors"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
