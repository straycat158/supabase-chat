import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createClient()

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
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  try {
    const supabase = createClient()

    // 生成唯一的存储桶名称
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)
    const bucketName = `minecraft-resources-${timestamp}-${randomId}`

    // 创建存储桶
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
    })

    if (error) {
      throw error
    }

    // 测试上传
    const testContent = "test-upload"
    const testFileName = "test.txt"

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(testFileName, new Blob([testContent], { type: "text/plain" }))

    if (!uploadError) {
      // 清理测试文件
      await supabase.storage.from(bucketName).remove([testFileName])
    }

    return NextResponse.json({
      success: true,
      bucketName,
      message: "存储桶创建成功",
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
