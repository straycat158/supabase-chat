import { createClient } from "@/lib/supabase/server"
import { ResourcesMainPage } from "@/components/resources-main-page"

export const revalidate = 0

export default async function ResourcesPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 获取所有分类和对应的资源数量
  const { data: categories, error } = await supabase
    .from("resource_categories")
    .select(`
      *,
      resources(count)
    `)
    .order("name")

  if (error) {
    console.error("Error fetching categories:", error)
  }

  // 处理数据格式
  const categoriesWithCount = (categories || []).map((category) => ({
    ...category,
    resourceCount: Array.isArray(category.resources) ? category.resources.length : 0,
  }))

  return <ResourcesMainPage session={session} categories={categoriesWithCount} />
}
