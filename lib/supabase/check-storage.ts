import { createClient } from "@supabase/supabase-js"

// 这个脚本用于检查Supabase中的帖子表和存储桶
export async function checkSupabaseSetup() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("缺少Supabase凭据")
    return {
      postsTable: false,
      storageBucket: false,
      error: "缺少Supabase凭据",
    }
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const results = {
    postsTable: false,
    storageBucket: false,
    error: null as string | null,
  }

  try {
    // 检查posts表
    const { data: postsData, error: postsError } = await supabase.from("posts").select("count()").limit(1)

    if (postsError) {
      results.error = `检查posts表失败: ${postsError.message}`
    } else {
      results.postsTable = true
      console.log("posts表存在，记录数:", postsData[0]?.count || 0)
    }

    // 检查存储桶
    const { data: bucketData, error: bucketError } = await supabase.storage.listBuckets()

    if (bucketError) {
      results.error = `检查存储桶失败: ${bucketError.message}`
    } else {
      const minecraftBucket = bucketData.find((bucket) => bucket.name === "minecraft-forum")
      results.storageBucket = !!minecraftBucket

      if (minecraftBucket) {
        console.log("minecraft-forum存储桶存在")

        // 检查存储桶中的文件
        const { data: files, error: filesError } = await supabase.storage.from("minecraft-forum").list()

        if (filesError) {
          console.error("获取存储桶文件失败:", filesError)
        } else {
          console.log(`存储桶中有${files.length}个文件`)
        }
      } else {
        console.log("minecraft-forum存储桶不存在")

        // 创建存储桶
        console.log("尝试创建存储桶...")
        const { data: createData, error: createError } = await supabase.storage.createBucket("minecraft-forum", {
          public: true,
        })

        if (createError) {
          console.error("创建存储桶失败:", createError)
        } else {
          console.log("存储桶创建成功")
          results.storageBucket = true
        }
      }
    }
  } catch (error: any) {
    results.error = `检查失败: ${error.message}`
    console.error("检查失败:", error)
  }

  return results
}

// 如果直接运行此文件，则执行检查
if (require.main === module) {
  checkSupabaseSetup()
    .then((results) => {
      console.log("检查结果:", results)
      process.exit(0)
    })
    .catch((err) => {
      console.error("检查失败:", err)
      process.exit(1)
    })
}
