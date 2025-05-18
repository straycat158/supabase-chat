import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    // 使用服务端角色密钥创建Supabase客户端
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

    const bucketName = "minecraft-forum"
    const bucketExists = buckets.some((bucket) => bucket.name === bucketName)

    if (bucketExists) {
      // 如果存储桶已存在，更新其策略
      const { error: updateError } = await supabase.storage.updateBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      })

      if (updateError) {
        return NextResponse.json({ error: `更新存储桶策略失败: ${updateError.message}` }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: "存储桶已存在并更新了策略" })
    }

    // 创建新的存储桶
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 5242880, // 5MB
    })

    if (error) {
      return NextResponse.json({ error: `创建存储桶失败: ${error.message}` }, { status: 500 })
    }

    // 检查avatars存储桶是否存在
    const avatarsBucketName = "avatars"
    const avatarsBucketExists = buckets.some((bucket) => bucket.name === avatarsBucketName)

    if (avatarsBucketExists) {
      // 如果存储桶已存在，更新其策略
      const { error: updateAvatarsError } = await supabase.storage.updateBucket(avatarsBucketName, {
        public: true,
        fileSizeLimit: 2097152, // 2MB
      })

      if (updateAvatarsError) {
        console.error("Error updating avatars bucket policy:", updateAvatarsError)
      } else {
        console.log("Avatars bucket policy updated successfully")
      }
    } else {
      // 创建新的avatars存储桶
      const { error: createAvatarsError } = await supabase.storage.createBucket(avatarsBucketName, {
        public: true,
        fileSizeLimit: 2097152, // 2MB
      })

      if (createAvatarsError) {
        console.error("Error creating avatars bucket:", createAvatarsError)
      } else {
        console.log("Avatars bucket created successfully")
      }
    }

    return NextResponse.json({ success: true, message: "存储桶创建成功" })
  } catch (error: any) {
    return NextResponse.json({ error: `服务器错误: ${error.message}` }, { status: 500 })
  }
}
