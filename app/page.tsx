import { createClient } from "@/lib/supabase/server"
import { HomePageContent } from "@/components/home-page-content"

export const revalidate = 0

export default async function Home() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 获取最新的5篇帖子用于首页展示
  const { data: latestPosts, error } = await supabase
    .from("posts")
    .select(`
      *,
      profiles:user_id (username, avatar_url),
      comments:comments (id)
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  if (error) {
    console.error("Error fetching posts:", error)
  }

  // 获取用户数量
  const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  // 获取帖子数量
  const { count: postCount } = await supabase.from("posts").select("*", { count: "exact", head: true })

  // 获取评论数量
  const { count: commentCount } = await supabase.from("comments").select("*", { count: "exact", head: true })

  // 传递数据到客户端组件
  return (
    <HomePageContent
      session={session}
      latestPosts={latestPosts || []}
      stats={{
        users: userCount || 0,
        posts: postCount || 0,
        comments: commentCount || 0,
      }}
    />
  )
}
