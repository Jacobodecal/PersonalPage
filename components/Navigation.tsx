'use client';

import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="border-b border-border">
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="text-2xl font-bold text-foreground hover:text-primary transition-colors"
          >
            Jacobo De Cal
          </Link>
          <ul className="flex gap-8 text-lg">
            <li>
              <Link
                href="/#writing"
                className="text-foreground hover:text-primary transition-colors"
              >
                Essays
              </Link>
            </li>
            <li>
              <Link
                href="#contact"
                className="text-foreground hover:text-primary transition-colors"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
