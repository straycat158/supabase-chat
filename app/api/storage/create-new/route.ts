import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables")
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST() {
  try {
    // 生成唯一的存储桶名称
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)
    const bucketName = `minecraft-resources-${timestamp}-${randomId}`

    // 创建存储桶
    const { data: createData, error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
    })

    if (createError) {
      throw createError
    }

    // 测试上传功能
    const testFile = new Blob(["test content"], { type: "text/plain" })
    const testFileName = `test-${Date.now()}.txt`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(`test/${testFileName}`, testFile)

    if (!uploadError) {
      // 清理测试文件
      await supabase.storage.from(bucketName).remove([`test/${testFileName}`])
    }

    return NextResponse.json({
      success: true,
      bucketName,
      message: "存储桶创建成功",
    })
  } catch (error: any) {
    console.error("创建存储桶失败:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    // 获取所有存储桶
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      buckets: buckets || [],
    })
  } catch (error: any) {
    console.error("获取存储桶列表失败:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
