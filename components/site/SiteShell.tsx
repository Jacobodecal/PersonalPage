import Link from 'next/link';
import { SOCIAL_LINKS } from '@/lib/site';

// Header, centered reading column and footer shared by every public page
export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[680px] px-6">
      <header className="flex items-center justify-between pt-7">
        <Link href="/" className="text-[15px] font-semibold text-strong">
          Jacobo De Cal
        </Link>
        <nav className="flex gap-6 text-sm">
          <Link href="/writing" className="text-muted transition-colors hover:text-foreground">
            Writing
          </Link>
          <Link href="/about" className="text-muted transition-colors hover:text-foreground">
            About
          </Link>
        </nav>
      </header>

      <main>{children}</main>

      <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-line pt-10 pb-28 text-[13px] text-muted">
        <div className="flex gap-4">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
