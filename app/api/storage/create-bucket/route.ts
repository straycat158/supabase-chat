import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "缺少Supabase凭据" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 检查存储桶是否存在
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      return NextResponse.json({ error: `获取存储桶列表失败: ${bucketsError.message}` }, { status: 500 })
    }

    const bucketExists = buckets.some((bucket) => bucket.name === "minecraft-forum")

    if (bucketExists) {
      return NextResponse.json({ success: true, message: "存储桶已存在" })
    }

    // 创建存储桶
    const { data, error } = await supabase.storage.createBucket("minecraft-forum", {
      public: true,
      fileSizeLimit: 5242880, // 5MB
    })

    if (error) {
      return NextResponse.json({ error: `创建存储桶失败: ${error.message}` }, { status: 500 })
    }

    // 设置存储桶策略
    const { error: policyError } = await supabase.storage.updateBucket("minecraft-forum", {
      public: true,
      fileSizeLimit: 5242880, // 5MB
    })

    if (policyError) {
      return NextResponse.json({ error: `更新存储桶策略失败: ${policyError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "存储桶创建成功" })
  } catch (error: any) {
    return NextResponse.json({ error: `服务器错误: ${error.message}` }, { status: 500 })
  }
}
