import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        {
          error: "缺少Supabase环境变量",
          bucketExists: false,
        },
        { status: 500 },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 检查存储桶是否存在
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      return NextResponse.json(
        {
          error: `获取存储桶列表失败: ${listError.message}`,
          bucketExists: false,
        },
        { status: 500 },
      )
    }

    const bucketExists = buckets?.some((bucket) => bucket.name === "minecraft-forum")

    if (!bucketExists) {
      // 尝试创建存储桶
      const { data, error: createError } = await supabase.storage.createBucket("minecraft-forum", {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      })

      if (createError) {
        return NextResponse.json(
          {
            error: `创建存储桶失败: ${createError.message}`,
            bucketExists: false,
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        message: "存储桶创建成功",
        bucketExists: true,
        created: true,
      })
    }

    return NextResponse.json({
      message: "存储桶已存在",
      bucketExists: true,
      created: false,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: `服务器错误: ${error.message}`,
        bucketExists: false,
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  return GET() // 使用相同的逻辑
}
