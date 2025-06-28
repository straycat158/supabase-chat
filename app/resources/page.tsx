import { createClient } from "@/lib/supabase/server"
import { ResourcesPageContent } from "@/components/resources-page-content"

export const revalidate = 0

export default async function ResourcesPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 获取所有资源分类
  const { data: categories, error: categoriesError } = await supabase
    .from("resource_categories")
    .select("*")
    .order("name")

  if (categoriesError) {
    console.error("Error fetching categories:", categoriesError)
  }

  // 获取所有资源（包含分类和用户信息）
  const { data: resources, error: resourcesError } = await supabase
    .from("resources")
    .select(`
      *,
      profiles:user_id (username, avatar_url),
      resource_categories:category_id (*)
    `)
    .order("created_at", { ascending: false })

  if (resourcesError) {
    console.error("Error fetching resources:", resourcesError)
  }

  return <ResourcesPageContent session={session} categories={categories || []} resources={resources || []} />
}
