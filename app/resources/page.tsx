import { createClient } from "@/lib/supabase/server"
import { ResourcesMainPage } from "@/components/resources-main-page"

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

  // 获取每个分类的资源数量
  const categoriesWithCounts = await Promise.all(
    (categories || []).map(async (category) => {
      const { count } = await supabase
        .from("resources")
        .select("*", { count: "exact", head: true })
        .eq("category_id", category.id)

      return {
        ...category,
        resourceCount: count || 0,
      }
    }),
  )

  return <ResourcesMainPage session={session} categories={categoriesWithCounts} />
}
