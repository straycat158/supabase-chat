import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Dashboard } from "@/components/dashboard"

export default async function DashboardPage() {
  const supabase = await createClient()

  try {
    // 检查用户认证状态
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()

    if (authError || !session?.user) {
      redirect("/login")
    }

    // 获取用户的帖子
    const { data: userPosts, error: userPostsError } = await supabase
      .from("posts")
      .select(
        `
        *,
        profiles:user_id (username, avatar_url),
        comments (id)
      `,
      )
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    if (userPostsError) {
      console.error("Error fetching user posts:", userPostsError)
    }

    // 获取最新的社区帖子
    const { data: recentPosts, error: recentPostsError } = await supabase
      .from("posts")
      .select(
        `
        *,
        profiles:user_id (username, avatar_url),
        comments (id)
      `,
      )
      .neq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    if (recentPostsError) {
      console.error("Error fetching recent posts:", recentPostsError)
    }

    // 获取统计数据
    const [{ count: usersCount }, { count: postsCount }, { count: commentsCount }] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("posts").select("*", { count: "exact", head: true }),
      supabase.from("comments").select("*", { count: "exact", head: true }),
    ])

    const stats = {
      users: usersCount || 0,
      posts: postsCount || 0,
      comments: commentsCount || 0,
    }

    return <Dashboard userPosts={userPosts || []} recentPosts={recentPosts || []} stats={stats} />
  } catch (error) {
    console.error("Dashboard error:", error)
    redirect("/login")
  }
}
