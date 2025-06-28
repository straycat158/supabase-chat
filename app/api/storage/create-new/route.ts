import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "缺少Supabase环境变量" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // 生成新的存储桶名称
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)
    const newBucketName = `minecraft-resources-${timestamp}-${randomId}`

    // 创建新的存储桶
    const { data: bucketData, error: createError } = await supabase.storage.createBucket(newBucketName, {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
    })

    if (createError) {
      return NextResponse.json({ error: `创建存储桶失败: ${createError.message}` }, { status: 500 })
    }

    // 测试存储桶
    const testContent = "测试文件"
    const testFile = new Blob([testContent], { type: "text/plain" })

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(newBucketName)
      .upload("test/test.txt", testFile)

    if (uploadError) {
      // 存储桶创建成功但测试失败
      return NextResponse.json({
        success: true,
        message: "存储桶创建成功，但测试上传失败",
        bucketName: newBucketName,
        warning: uploadError.message,
      })
    }

    // 清理测试文件
    await supabase.storage.from(newBucketName).remove(["test/test.txt"])

    return NextResponse.json({
      success: true,
      message: "存储桶创建并测试成功",
      bucketName: newBucketName,
      config: {
        public: true,
        fileSizeLimit: "10MB",
        allowedTypes: ["JPEG", "PNG", "GIF", "WebP", "SVG"],
      },
    })
  } catch (error: any) {
    console.error("存储桶创建API错误:", error)
    return NextResponse.json({ error: `服务器错误: ${error.message}` }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "缺少Supabase环境变量" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // 获取所有存储桶
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      return NextResponse.json({ error: `获取存储桶列表失败: ${listError.message}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      buckets:
        buckets?.map((bucket) => ({
          name: bucket.name,
          public: bucket.public,
          createdAt: bucket.created_at,
          updatedAt: bucket.updated_at,
        })) || [],
    })
  } catch (error: any) {
    console.error("获取存储桶信息API错误:", error)
    return NextResponse.json({ error: `服务器错误: ${error.message}` }, { status: 500 })
  }
}
