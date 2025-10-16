export default function Contact() {
  return (
    <section id="contact" className="py-20 border-t border-border">
      <div className="max-w-3xl mx-auto px-6">
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Get in touch
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              You can reach me at{' '}
              <a
                href="mailto:jacobo@indicator.capital"
                className="text-foreground underline decoration-border hover:decoration-foreground transition-colors"
              >
                jacobo@indicator.capital
              </a>
            </p>
            <div className="flex gap-6 text-sm">
              <a
                href="https://linkedin.com/in/jacobodecal"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-foreground transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
