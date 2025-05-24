import { createClient } from "@/lib/supabase/server"
import { LandingPage } from "@/components/landing-page"

export const revalidate = 0

export default async function Home() {
  const supabase = createClient()

  try {
    // 获取最新的帖子用于首页展示
    const { data: latestPosts, error: postsError } = await supabase
      .from("posts")
      .select(`
        *,
        profiles:user_id (username, avatar_url),
        comments:comments (id)
      `)
      .order("created_at", { ascending: false })
      .limit(8)

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

    // 所有用户都显示着陆页，让用户自己选择去仪表盘
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
