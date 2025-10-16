'use client';

export default function Navigation() {
  return (
    <nav className="border-b border-border">
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <a
            href="/"
            className="text-2xl font-bold text-foreground hover:text-primary transition-colors"
          >
            Jacobo De Cal
          </a>
          <ul className="flex gap-8 text-lg">
            <li>
              <a
                href="/#writing"
                className="text-foreground hover:text-primary transition-colors"
              >
                Essays
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className="text-foreground hover:text-primary transition-colors"
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
