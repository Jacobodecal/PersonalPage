import HomeTerminal from "@/components/HomeTerminal";
import { getAllPosts } from "@/lib/posts";

export default function Home() {
  const posts = getAllPosts();
  return <HomeTerminal posts={posts} />;
}
