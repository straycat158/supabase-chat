import { createClient } from "@/lib/supabase/server"
import { Dashboard } from "@/components/dashboard"
import { LandingPage } from "@/components/landing-page"

export const revalidate = 0

export default async function Home() {
  const supabase = createClient()

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // 获取最新的5篇帖子用于首页展示
    const { data: latestPosts, error: postsError } = await supabase
      .from("posts")
      .select(`
        *,
        profiles:user_id (username, avatar_url),
        comments:comments (id)
      `)
      .order("created_at", { ascending: false })
      .limit(5)

    if (postsError) {
      console.error("Error fetching posts:", postsError)
    }

    // 获取统计数据
    const [{ count: userCount }, { count: postCount }, { count: commentCount }] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("posts").select("*", { count: "exact", head: true }),
      supabase.from("comments").select("*", { count: "exact", head: true }),
    ])

    const stats = {
      users: userCount || 0,
      posts: postCount || 0,
      comments: commentCount || 0,
    }

    // 如果用户已登录，显示仪表盘
    if (session) {
      try {
        // 获取用户的帖子
        const { data: userPosts, error: userPostsError } = await supabase
          .from("posts")
          .select(`
            *,
            profiles:user_id (username, avatar_url),
            comments:comments (id)
          `)
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(10)

        if (userPostsError) {
          console.error("Error fetching user posts:", userPostsError)
        }

        // 获取社区最新帖子（排除用户自己的）
        const { data: recentPosts, error: recentPostsError } = await supabase
          .from("posts")
          .select(`
            *,
            profiles:user_id (username, avatar_url),
            comments:comments (id)
          `)
          .neq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(5)

        if (recentPostsError) {
          console.error("Error fetching recent posts:", recentPostsError)
        }

        return <Dashboard userPosts={userPosts || []} recentPosts={recentPosts || []} stats={stats} />
      } catch (error) {
        console.error("Error in dashboard data fetching:", error)
        // 如果仪表盘数据获取失败，回退到基本仪表盘
        return <Dashboard userPosts={[]} recentPosts={latestPosts || []} stats={stats} />
      }
    }

    // 如果用户未登录，显示着陆页
    return <LandingPage latestPosts={latestPosts || []} stats={stats} />
  } catch (error) {
    console.error("Error in home page:", error)

    // 如果发生错误，显示错误页面
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">页面加载出错</h1>
          <p className="text-muted-foreground mb-4">抱歉，页面加载时出现了问题。</p>
          <a href="/" className="inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
            重新加载
          </a>
        </div>
      </div>
    )
  }
}
