import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set() {
            // 忽略设置 cookie（只读，不写）
          },
          remove() {
            // 忽略移除 cookie（只读，不写）
          },
        },
      },
    )

    const body = await req.json()
    const { postId } = body

    if (!postId) {
      return NextResponse.json({ error: "缺少帖子ID" }, { status: 400 })
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const userId = session.user.id

    const { data: post, error: fetchError } = await supabase.from("posts").select("user_id").eq("id", postId).single()

    if (fetchError) {
      console.error("获取帖子信息失败:", fetchError)
      return NextResponse.json({ error: "获取帖子信息失败" }, { status: 500 })
    }

    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 })
    }

    if (post.user_id !== userId) {
      return NextResponse.json({ error: "无权删除此帖子" }, { status: 403 })
    }

    const { error: commentsError } = await supabase.from("comments").delete().eq("post_id", postId)

    if (commentsError) {
      console.error("删除评论失败:", commentsError)
      return NextResponse.json({ error: "删除评论失败" }, { status: 500 })
    }

    const { error: deleteError } = await supabase.from("posts").delete().eq("id", postId)

    if (deleteError) {
      console.error("删除帖子失败:", deleteError)
      return NextResponse.json({ error: "删除帖子失败" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "帖子删除成功" })
  } catch (error: any) {
    console.error("删除帖子时出错:", error)
    return NextResponse.json({ error: error.message || "服务器错误" }, { status: 500 })
  }
}
