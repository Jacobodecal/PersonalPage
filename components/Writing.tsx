const blogPosts = [
  {
    date: "Jan 2025",
    title: "The Next Wave of AI Infrastructure",
    excerpt: "Why the next decade of AI innovation will be built on better infrastructure, not just better models.",
    link: "#"
  },
  {
    date: "Dec 2024",
    title: "Building in Public: Lessons from Portfolio Companies",
    excerpt: "What we've learned from founders who share their journey transparently with their communities.",
    link: "#"
  },
  {
    date: "Nov 2024",
    title: "The Founder's Guide to Seed Fundraising",
    excerpt: "A comprehensive guide to raising your first institutional round, from pitch to term sheet.",
    link: "#"
  }
];

export default function Writing() {
  return (
    <section id="writing" className="py-16">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-foreground mb-12">
          Writing
        </h2>
        <div className="space-y-12">
          {blogPosts.map((post, index) => (
            <article
              key={index}
              className="border-b border-border pb-10 last:border-0"
            >
              <div className="text-sm text-text-light mb-2">
                {post.date}
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3 leading-tight">
                <a href={post.link} className="hover:text-primary transition-colors">
                  {post.title}
                </a>
              </h3>
              <p className="text-text-secondary leading-relaxed">
                {post.excerpt}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
