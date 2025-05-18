import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

// 加载环境变量
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("错误: 缺少Supabase凭据")
  console.error("请确保在.env文件中设置了NEXT_PUBLIC_SUPABASE_URL和SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupSupabase() {
  console.log("开始设置Supabase...")

  // 1. 创建存储桶
  console.log("\n创建存储桶...")
  try {
    // minecraft-forum存储桶
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket("minecraft-forum", {
      public: true,
      fileSizeLimit: 5242880, // 5MB
    })

    if (bucketError) {
      if (bucketError.message.includes("already exists")) {
        console.log("✅ minecraft-forum存储桶已存在")
      } else {
        console.error("❌ 创建minecraft-forum存储桶失败:", bucketError)
      }
    } else {
      console.log("✅ minecraft-forum存储桶创建成功")
    }

    // avatars存储桶
    const { data: avatarsBucketData, error: avatarsBucketError } = await supabase.storage.createBucket("avatars", {
      public: true,
      fileSizeLimit: 2097152, // 2MB
    })

    if (avatarsBucketError) {
      if (avatarsBucketError.message.includes("already exists")) {
        console.log("✅ avatars存储桶已存在")
      } else {
        console.error("❌ 创建avatars存储桶失败:", avatarsBucketError)
      }
    } else {
      console.log("✅ avatars存储桶创建成功")
    }
  } catch (error) {
    console.error("创建存储桶时出错:", error)
  }

  // 2. 检查数据库表
  console.log("\n检查数据库表...")
  try {
    // 检查profiles表
    const { count: profilesCount, error: profilesError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })

    if (profilesError) {
      console.error("❌ profiles表不存在或无法访问:", profilesError)
    } else {
      console.log(`✅ profiles表存在，包含${profilesCount || 0}条记录`)
    }

    // 检查posts表
    const { count: postsCount, error: postsError } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })

    if (postsError) {
      console.error("❌ posts表不存在或无法访问:", postsError)
    } else {
      console.log(`✅ posts表存在，包含${postsCount || 0}条记录`)
    }

    // 检查comments表
    const { count: commentsCount, error: commentsError } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })

    if (commentsError) {
      console.error("❌ comments表不存在或无法访问:", commentsError)
    } else {
      console.log(`✅ comments表存在，包含${commentsCount || 0}条记录`)
    }

    // 检查announcements表
    const { count: announcementsCount, error: announcementsError } = await supabase
      .from("announcements")
      .select("*", { count: "exact", head: true })

    if (announcementsError) {
      console.error("❌ announcements表不存在或无法访问:", announcementsError)
    } else {
      console.log(`✅ announcements表存在，包含${announcementsCount || 0}条记录`)
    }
  } catch (error) {
    console.error("检查数据库表时出错:", error)
  }

  console.log("\n设置完成!")
  console.log("如果有任何表不存在，请参考README.md中的数据库设置说明创建它们。")
}

setupSupabase().catch(console.error)
