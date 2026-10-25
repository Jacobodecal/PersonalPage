// Site-wide copy and links, shared by the pages, footer and metadata.

export const BIO_INTRO = 'Spanish, raised in Brazil. Computer engineer from POLI-USP, ex-BTG Pactual, ex-VC.';
export const BIO_NOW = 'Now COO at Lumx, a global fintech helping companies operate globally.';
export const BIO = `${BIO_INTRO} ${BIO_NOW}`;

export const NEWSLETTER_TAGLINE =
  "I write about whatever I'm into: tech, coding, AI, startups, VC and crypto. No spam.";

export const SOCIAL_LINKS = [
  { label: 'X', href: 'https://x.com/jacobodecal' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/jacobodecal' },
  { label: 'GitHub', href: 'https://github.com/jacobodecal' },
  { label: 'Email', href: 'mailto:jacobo@jacobodecal.com' },
];

// Post dates are stored as UTC ISO strings; format in UTC so "2026-02-21" never shows as Feb 20
export const formatMonthYear = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });

export const formatLongDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
