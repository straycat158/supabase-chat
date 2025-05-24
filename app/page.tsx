import { createClient } from "@/lib/supabase/server"
import { Dashboard } from "@/components/dashboard"
import { LandingPage } from "@/components/landing-page"

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

  const stats = {
    users: userCount || 0,
    posts: postCount || 0,
    comments: commentCount || 0,
  }

  // 如果用户已登录，显示仪表盘
  if (session) {
    // 获取用户的帖子
    const { data: userPosts } = await supabase
      .from("posts")
      .select(`
        *,
        profiles:user_id (username, avatar_url),
        comments:comments (id)
      `)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    // 获取社区最新帖子（排除用户自己的）
    const { data: recentPosts } = await supabase
      .from("posts")
      .select(`
        *,
        profiles:user_id (username, avatar_url),
        comments:comments (id)
      `)
      .neq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(5)

    return <Dashboard userPosts={userPosts || []} recentPosts={recentPosts || []} stats={stats} />
  }

  // 如果用户未登录，显示着陆页
  return <LandingPage latestPosts={latestPosts || []} stats={stats} />
}
