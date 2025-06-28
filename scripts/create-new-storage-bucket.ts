import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createNewStorageBucket() {
  try {
    console.log("🚀 开始创建新的存储桶...")

    // 生成唯一的存储桶名称
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)
    const bucketName = `minecraft-resources-${timestamp}-${randomId}`

    console.log(`📦 存储桶名称: ${bucketName}`)

    // 创建存储桶
    const { data: createData, error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
    })

    if (createError) {
      throw createError
    }

    console.log("✅ 存储桶创建成功!")

    // 测试上传功能
    console.log("🧪 测试上传功能...")

    const testFile = new Blob(["test content"], { type: "text/plain" })
    const testFileName = `test-${Date.now()}.txt`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(`test/${testFileName}`, testFile)

    if (uploadError) {
      console.warn("⚠️ 上传测试失败:", uploadError.message)
    } else {
      console.log("✅ 上传测试成功!")

      // 清理测试文件
      await supabase.storage.from(bucketName).remove([`test/${testFileName}`])
    }

    // 获取公共URL
    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl("test.jpg")

    console.log("\n📋 存储桶信息:")
    console.log(`名称: ${bucketName}`)
    console.log(`公共访问: 是`)
    console.log(`文件大小限制: 10MB`)
    console.log(`支持格式: JPEG, PNG, GIF, WebP, SVG`)
    console.log(`示例URL: ${urlData.publicUrl}`)

    console.log("\n🔧 使用方法:")
    console.log(`在组件中使用: bucketName="${bucketName}"`)
    console.log(`环境变量: NEXT_PUBLIC_STORAGE_BUCKET="${bucketName}"`)

    return {
      success: true,
      bucketName,
      publicUrl: urlData.publicUrl,
    }
  } catch (error: any) {
    console.error("❌ 创建存储桶失败:", error.message)
    return {
      success: false,
      error: error.message,
    }
  }
}

// 如果直接运行脚本
if (require.main === module) {
  createNewStorageBucket()
    .then((result) => {
      if (result.success) {
        console.log("\n🎉 存储桶创建完成!")
        process.exit(0)
      } else {
        console.error("\n💥 创建失败!")
        process.exit(1)
      }
    })
    .catch((error) => {
      console.error("💥 脚本执行失败:", error)
      process.exit(1)
    })
}

export { createNewStorageBucket }
