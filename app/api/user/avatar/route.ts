import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const avatarFile = formData.get("avatar") as File

    if (!avatarFile) {
      return NextResponse.json({ error: "没有提供头像文件" }, { status: 400 })
    }

    // 检查文件类型
    if (!avatarFile.type.startsWith("image/")) {
      return NextResponse.json({ error: "文件类型必须是图片" }, { status: 400 })
    }

    // 检查文件大小 (2MB)
    if (avatarFile.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "文件大小不能超过2MB" }, { status: 400 })
    }

    // 创建Supabase客户端
    const supabase = createRouteHandlerClient({ cookies })

    // 获取当前用户会话
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const userId = session.user.id

    // 生成唯一文件名
    const fileExt = avatarFile.name.split(".").pop()
    const fileName = `${userId}_${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // 将文件转换为ArrayBuffer
    const arrayBuffer = await avatarFile.arrayBuffer()

    // 上传到Supabase Storage
    const { data, error } = await supabase.storage.from("minecraft-forum").upload(filePath, arrayBuffer, {
      contentType: avatarFile.type,
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      return NextResponse.json({ error: `上传失败: ${error.message}` }, { status: 500 })
    }

    // 获取公共URL
    const { data: publicUrlData } = supabase.storage.from("minecraft-forum").getPublicUrl(filePath)

    const publicUrl = publicUrlData.publicUrl

    // 更新用户资料
    const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId)

    if (updateError) {
      return NextResponse.json({ error: `更新资料失败: ${updateError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, avatarUrl: publicUrl })
  } catch (error: any) {
    return NextResponse.json({ error: `服务器错误: ${error.message}` }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    // 创建Supabase客户端
    const supabase = createRouteHandlerClient({ cookies })

    // 获取当前用户会话
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const userId = session.user.id

    // 获取用户当前头像URL
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", userId)
      .single()

    if (profileError) {
      return NextResponse.json({ error: `获取用户资料失败: ${profileError.message}` }, { status: 500 })
    }

    // 如果有头像，删除它
    if (profile?.avatar_url) {
      const urlParts = profile.avatar_url.split("minecraft-forum/")
      if (urlParts.length > 1) {
        const filePath = urlParts[1]
        const { error: deleteError } = await supabase.storage.from("minecraft-forum").remove([filePath])

        if (deleteError) {
          console.error("删除头像文件失败:", deleteError)
        }
      }
    }

    // 更新用户资料，设置头像为null
    const { error: updateError } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", userId)

    if (updateError) {
      return NextResponse.json({ error: `更新资料失败: ${updateError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: `服务器错误: ${error.message}` }, { status: 500 })
  }
}
