import { createClient } from "@supabase/supabase-js"

export async function ensureStorageBucket() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("缺少Supabase环境变量")
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    // 检查存储桶是否存在
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      // 如果是权限错误，说明存储桶可能存在但用户没有列出权限
      if (listError.message.includes("permission") || listError.message.includes("unauthorized")) {
        // 尝试直接上传一个测试文件来验证存储桶是否存在
        const testFile = new Blob(["test"], { type: "text/plain" })
        const { error: testError } = await supabase.storage.from("minecraft-forum").upload("test/test.txt", testFile)

        if (!testError || testError.message.includes("already exists")) {
          // 存储桶存在，删除测试文件
          await supabase.storage.from("minecraft-forum").remove(["test/test.txt"])
          return true
        }
      }
      throw listError
    }

    const bucketExists = buckets?.some((bucket) => bucket.name === "minecraft-forum")
    return bucketExists
  } catch (error: any) {
    console.error("检查存储桶失败:", error)
    throw error
  }
}

export async function createStorageBucket() {
  // 这个函数需要服务端权限，通过API路由调用
  try {
    const response = await fetch("/api/storage/check", {
      method: "POST",
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "创建存储桶失败")
    }

    return result.bucketExists
  } catch (error: any) {
    console.error("创建存储桶失败:", error)
    throw error
  }
}
