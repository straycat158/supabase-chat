import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "../types/database"

// 创建一个单例客户端实例
let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

export const createClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient<Database>()
  }
  return supabaseClient
}
