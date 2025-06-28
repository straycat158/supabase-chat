import { createClient } from "@/lib/supabase/server"
import { ResourceCategoryPage } from "@/components/resource-category-page"
import { notFound } from "next/navigation"

export const revalidate = 0

interface Props {
  params: {
    category: string
  }
}

export default async function CategoryPage({ params }: Props) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 获取分类信息
  const { data: category, error: categoryError } = await supabase
    .from("resource_categories")
    .select("*")
    .eq("slug", params.category)
    .single()

  if (categoryError || !category) {
    console.error("Category error:", categoryError)
    notFound()
  }

  // 获取该分类下的所有资源，包含用户信息
  const { data: resourcesData, error: resourcesError } = await supabase
    .from("resources")
    .select(`
      *,
      profiles!inner(username, avatar_url)
    `)
    .eq("category_id", category.id)
    .order("created_at", { ascending: false })

  if (resourcesError) {
    console.error("Resources error:", resourcesError)
  }

  // 格式化资源数据
  const resources = (resourcesData || []).map((resource) => ({
    ...resource,
    user: resource.profiles,
  }))

  return <ResourceCategoryPage session={session} category={category} resources={resources} />
}
