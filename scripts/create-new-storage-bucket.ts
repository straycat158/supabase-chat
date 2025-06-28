import { createClient } from "@supabase/supabase-js"

async function createNewStorageBucket() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ 缺少Supabase环境变量")
    console.log("请确保在 .env 文件中设置了以下环境变量:")
    console.log("- NEXT_PUBLIC_SUPABASE_URL")
    console.log("- SUPABASE_SERVICE_ROLE_KEY")
    process.exit(1)
  }

  console.log("🔗 连接到Supabase...")
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    console.log("🔍 检查现有存储桶...")

    // 获取所有存储桶列表
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error("❌ 获取存储桶列表失败:", listError.message)
      throw listError
    }

    console.log("📋 现有存储桶:")
    if (existingBuckets && existingBuckets.length > 0) {
      existingBuckets.forEach((bucket) => {
        console.log(`  - ${bucket.name} (${bucket.public ? "公开" : "私有"})`)
      })
    } else {
      console.log("  (无)")
    }

    // 生成新的存储桶名称
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)
    const newBucketName = `minecraft-resources-${timestamp}-${randomId}`

    console.log(`📦 创建新的存储桶: ${newBucketName}`)

    // 创建存储桶
    const { data: bucketData, error: createError } = await supabase.storage.createBucket(newBucketName, {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
    })

    if (createError) {
      console.error("❌ 创建存储桶失败:", createError.message)
      throw createError
    }

    console.log("✅ 存储桶创建成功!")
    console.log("📋 存储桶配置:")
    console.log(`  - 名称: ${newBucketName}`)
    console.log("  - 访问权限: 公开")
    console.log("  - 文件大小限制: 10MB")
    console.log("  - 允许的文件类型: JPEG, PNG, GIF, WebP, SVG")

    // 测试存储桶
    console.log("🧪 测试存储桶...")

    const testContent = "这是一个测试文件"
    const testFile = new Blob([testContent], { type: "text/plain" })

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(newBucketName)
      .upload("test/test.txt", testFile)

    if (uploadError) {
      console.error("❌ 测试上传失败:", uploadError.message)
      throw uploadError
    }

    console.log("✅ 测试上传成功")

    // 获取公开URL
    const { data: urlData } = supabase.storage.from(newBucketName).getPublicUrl("test/test.txt")

    console.log("🔗 测试文件URL:", urlData.publicUrl)

    // 删除测试文件
    const { error: deleteError } = await supabase.storage.from(newBucketName).remove(["test/test.txt"])

    if (deleteError) {
      console.warn("⚠️  删除测试文件失败:", deleteError.message)
    } else {
      console.log("🗑️  测试文件已清理")
    }

    console.log("\n🎉 存储桶设置完成!")
    console.log(`📝 请将以下存储桶名称添加到你的应用配置中:`)
    console.log(`STORAGE_BUCKET_NAME=${newBucketName}`)
    console.log("\n现在可以在应用中使用图片上传功能了。")

    return newBucketName
  } catch (error: any) {
    console.error("❌ 操作失败:", error.message)
    console.log("\n🔧 故障排除:")
    console.log("1. 检查网络连接")
    console.log("2. 确认Supabase URL和Service Key正确")
    console.log("3. 确认Service Key有足够的权限")
    console.log("4. 检查Supabase项目是否正常运行")
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  createNewStorageBucket()
}

export { createNewStorageBucket }
