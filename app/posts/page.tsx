import { createClient } from "@/lib/supabase/server"
import { PostsPageContent } from "@/components/posts-page-content"

export const revalidate = 0

export default async function PostsPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { data: posts, error } = await supabase
    .from("posts")
    .select(`
      *,
      profiles:user_id (username, avatar_url),
      comments:comments (id)
    `)
    .order("created_at", { ascending: false })

  const { data: tags } = await supabase.from("tags").select("*").order("name")

  if (error) {
    console.error("Error fetching posts:", error)
  }

  return <PostsPageContent session={session} tags={tags || []} posts={posts || []} />
}
