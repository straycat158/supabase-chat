import { createClient } from "@supabase/supabase-js"

// 这个脚本用于初始化Supabase Storage
// 你可以在本地运行这个脚本来创建必要的存储桶
export async function setupStorage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials")
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // 创建minecraft-forum存储桶
  const { data: bucketData, error: bucketError } = await supabase.storage.createBucket("minecraft-forum", {
    public: true,
    fileSizeLimit: 5242880, // 5MB
  })

  if (bucketError) {
    if (bucketError.message.includes("already exists")) {
      console.log("Storage bucket already exists")
    } else {
      console.error("Error creating storage bucket:", bucketError)
    }
  } else {
    console.log("Storage bucket created successfully:", bucketData)
  }

  // 创建avatars存储桶
  const { data: avatarsBucketData, error: avatarsBucketError } = await supabase.storage.createBucket("avatars", {
    public: true,
    fileSizeLimit: 2097152, // 2MB
  })

  if (avatarsBucketError) {
    if (avatarsBucketError.message.includes("already exists")) {
      console.log("Avatars storage bucket already exists")
    } else {
      console.error("Error creating avatars storage bucket:", avatarsBucketError)
    }
  } else {
    console.log("Avatars storage bucket created successfully:", avatarsBucketData)
  }

  // 设置avatars存储桶策略
  const { error: avatarsPolicyError } = await supabase.storage.updateBucket("avatars", {
    public: true,
    fileSizeLimit: 2097152, // 2MB
  })

  if (avatarsPolicyError) {
    console.error("Error updating avatars bucket policy:", avatarsPolicyError)
  } else {
    console.log("Avatars bucket policy updated successfully")
  }

  // 设置存储桶策略
  const { error: policyError } = await supabase.storage.updateBucket("minecraft-forum", {
    public: true,
    fileSizeLimit: 5242880, // 5MB
  })

  if (policyError) {
    console.error("Error updating bucket policy:", policyError)
  } else {
    console.log("Bucket policy updated successfully")
  }
}

// 如果直接运行此文件，则执行设置
if (require.main === module) {
  setupStorage()
    .then(() => console.log("Storage setup complete"))
    .catch((err) => console.error("Storage setup failed:", err))
}
