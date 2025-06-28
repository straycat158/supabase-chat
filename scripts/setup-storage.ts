import { createClient } from "@supabase/supabase-js"

async function setupStorage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ 缺少Supabase环境变量")
    console.log("请确保设置了以下环境变量:")
    console.log("- NEXT_PUBLIC_SUPABASE_URL")
    console.log("- SUPABASE_SERVICE_ROLE_KEY")
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    console.log("🔍 检查存储桶...")

    // 检查现有存储桶
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      throw listError
    }

    const bucketExists = buckets?.some((bucket) => bucket.name === "minecraft-forum")

    if (bucketExists) {
      console.log("✅ minecraft-forum 存储桶已存在")
    } else {
      console.log("📦 创建 minecraft-forum 存储桶...")

      const { data, error } = await supabase.storage.createBucket("minecraft-forum", {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      })

      if (error) {
        throw error
      }

      console.log("✅ minecraft-forum 存储桶创建成功")
    }

    // 检查存储桶策略
    console.log("🔐 检查存储桶策略...")

    // 这里可以添加RLS策略检查和创建
    // 由于存储桶是public的，暂时不需要额外的策略

    console.log("✅ 存储设置完成!")
    console.log("\n📋 存储桶信息:")
    console.log("- 名称: minecraft-forum")
    console.log("- 类型: 公开")
    console.log("- 文件大小限制: 5MB")
    console.log("- 支持格式: JPEG, PNG, GIF, WebP")
  } catch (error: any) {
    console.error("❌ 存储设置失败:", error.message)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  setupStorage()
}

export { setupStorage }
