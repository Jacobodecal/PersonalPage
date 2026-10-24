"use client";

import { useRouter } from "next/navigation";
import TerminalShell, { PrintFn } from "@/components/TerminalShell";
import type { PostMetadata } from "@/lib/posts";

export default function BlogTerminal({
  slug,
  title,
  date,
  excerpt,
  posts,
  children,
}: {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  posts: PostMetadata[];
  children: React.ReactNode;
}) {
  const router = useRouter();

  const boot = [`cat ${slug}.md`, "", title, date, "", excerpt, "", "---"];

  const handleCommand = (raw: string, { print, clear }: { print: PrintFn; clear: () => void }) => {
    const cmd = raw.trim();
    const [name, ...rest] = cmd.toLowerCase().split(/\s+/);

    switch (name) {
      case "":
        break;
      case "help":
        print([
          "available commands:",
          "  back        return home",
          "  essays      list all essays",
          "  open <n>    open essay number n",
          "  contact     how to reach me",
          "  play        a real, actually hard little game",
          "  clear       wipe the screen",
        ]);
        break;
      case "back":
      case "home":
      case "exit":
        router.push("/");
        break;
      case "essays":
      case "posts":
      case "ls": {
        const lines = posts.map((p, i) => (
          <a key={p.slug} href={`/blog/${p.slug}`} className="block hover:text-primary transition-colors">
            {`  ${i + 1}. [${p.date.slice(0, 10)}] ${p.title}`}
          </a>
        ));
        print(["", ...lines, "", "type 'open <n>' to read one"]);
        break;
      }
      case "open": {
        const n = Number(rest[0]);
        if (!n || n < 1 || n > posts.length) {
          print([`usage: open <1-${posts.length}> — run 'essays' to see the list`]);
          break;
        }
        router.push(`/blog/${posts[n - 1].slug}`);
        break;
      }
      case "contact":
        print(["email:    j@jacobodecal.com", "linkedin: linkedin.com/in/jacobodecal"]);
        break;
      case "play":
        window.dispatchEvent(new CustomEvent("open-game"));
        print(["launching runner.exe..."]);
        break;
      case "clear":
        clear();
        break;
      default:
        print([`command not found: ${name}. type 'help'.`]);
    }
  };

  return (
    <TerminalShell
      title={`jacobo@site: ~/essays/${slug}`}
      boot={boot}
      onCommand={handleCommand}
      afterBoot={
        <>
          <div className="prose max-w-none">{children}</div>
          <div className="mt-8 text-text-secondary">
            {"--- end ---"}
            <br />
            type &apos;back&apos; to return home, &apos;essays&apos; for more, &apos;help&apos; for commands
          </div>
        </>
      }
    />
  );
}
