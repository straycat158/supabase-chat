import { createClient } from "@supabase/supabase-js"
import { config } from "dotenv"

// 加载环境变量
config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ 缺少必要的环境变量:")
  console.error("   NEXT_PUBLIC_SUPABASE_URL:", !!supabaseUrl)
  console.error("   SUPABASE_SERVICE_ROLE_KEY:", !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createNewStorageBucket() {
  console.log("🚀 开始创建新的存储桶...\n")

  try {
    // 生成唯一的存储桶名称
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)
    const bucketName = `minecraft-resources-${timestamp}-${randomId}`

    console.log(`📦 存储桶名称: ${bucketName}`)

    // 检查存储桶是否已存在
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      throw new Error(`获取存储桶列表失败: ${listError.message}`)
    }

    const bucketExists = existingBuckets?.some((bucket) => bucket.name === bucketName)
    if (bucketExists) {
      throw new Error(`存储桶 ${bucketName} 已存在`)
    }

    // 创建存储桶
    console.log("🔨 正在创建存储桶...")
    const { data: createData, error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
    })

    if (createError) {
      throw new Error(`创建存储桶失败: ${createError.message}`)
    }

    console.log("✅ 存储桶创建成功!")

    // 测试上传功能
    console.log("🧪 测试上传功能...")
    const testContent = "test-image-content"
    const testFileName = "test-upload.txt"

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(testFileName, new Blob([testContent], { type: "text/plain" }))

    if (uploadError) {
      console.warn(`⚠️  上传测试失败: ${uploadError.message}`)
    } else {
      console.log("✅ 上传测试成功!")

      // 清理测试文件
      await supabase.storage.from(bucketName).remove([testFileName])
      console.log("🧹 测试文件已清理")
    }

    // 输出配置信息
    console.log("\n📋 存储桶配置信息:")
    console.log(`   名称: ${bucketName}`)
    console.log(`   访问权限: 公开`)
    console.log(`   文件大小限制: 10MB`)
    console.log(`   支持格式: JPEG, PNG, GIF, WebP, SVG`)

    console.log("\n🔧 使用方法:")
    console.log(`   在组件中使用: bucketName="${bucketName}"`)
    console.log(`   环境变量: NEXT_PUBLIC_STORAGE_BUCKET="${bucketName}"`)

    console.log("\n🎉 存储桶创建完成!")
    return bucketName
  } catch (error: any) {
    console.error("❌ 创建存储桶失败:", error.message)
    process.exit(1)
  }
}

// 运行脚本
if (require.main === module) {
  createNewStorageBucket()
}

export { createNewStorageBucket }
