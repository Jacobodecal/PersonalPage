import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Writing from "@/components/Writing";
import Newsletter from "@/components/Newsletter";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="bg-white">
        <Hero />
        <Writing />
        <Newsletter />
        <Contact />
      </main>
      <footer className="py-8 text-center border-t border-border bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-text-light text-sm">
            &copy; 2025 Jacobo De Cal
          </p>
        </div>
      </footer>
    </>
  );
}
