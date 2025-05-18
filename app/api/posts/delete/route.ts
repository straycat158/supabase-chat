import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function DELETE(request: Request) {
  try {
    // 解析请求体获取postId
    const body = await request.json()
    const { postId } = body

    if (!postId) {
      return NextResponse.json({ error: "缺少帖子ID" }, { status: 400 })
    }

    // 创建服务端Supabase客户端
    const supabase = createRouteHandlerClient({ cookies })

    // 获取当前用户会话
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    console.log("当前用户ID:", session.user.id)
    console.log("尝试删除帖子ID:", postId)

    // 获取帖子信息，确认是否为帖子作者
    const { data: post, error: fetchError } = await supabase.from("posts").select("user_id").eq("id", postId).single()

    if (fetchError) {
      console.error("获取帖子信息失败:", fetchError)
      return NextResponse.json({ error: "获取帖子信息失败" }, { status: 500 })
    }

    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 })
    }

    console.log("帖子作者ID:", post.user_id)

    // 检查当前用户是否为帖子作者
    if (post.user_id !== session.user.id) {
      return NextResponse.json({ error: "无权删除此帖子" }, { status: 403 })
    }

    // 删除帖子相关的评论
    const { error: commentsError } = await supabase.from("comments").delete().eq("post_id", postId)

    if (commentsError) {
      console.error("删除评论失败:", commentsError)
      return NextResponse.json({ error: "删除评论失败" }, { status: 500 })
    }

    // 删除帖子
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
