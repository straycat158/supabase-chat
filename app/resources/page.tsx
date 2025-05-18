import { createClient } from "@/lib/supabase/server"
import { ResourcesPageContent } from "@/components/resources-page-content"

export const revalidate = 0

export default async function ResourcesPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 获取所有标签
  const { data: tags, error: tagsError } = await supabase.from("tags").select("*").order("name")

  if (tagsError) {
    console.error("Error fetching tags:", tagsError)
  }

  // 获取所有帖子（包含标签信息）
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select(`
      *,
      profiles:user_id (username, avatar_url),
      comments:comments (id),
      tags:tag_id (*)
    `)
    .order("created_at", { ascending: false })

  if (postsError) {
    console.error("Error fetching posts:", postsError)
  }

  return <ResourcesPageContent session={session} tags={tags || []} posts={posts || []} />
}
