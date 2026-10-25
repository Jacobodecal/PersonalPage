export default function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-5 font-mono text-xs uppercase tracking-[0.08em] text-muted">{children}</h2>
  );
}
