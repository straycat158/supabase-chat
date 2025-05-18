"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PostCard } from "@/components/post-card"
import { Plus, Search, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import type { Tag } from "@/lib/types/database"

interface PostsPageContentProps {
  session: any
  posts: any[]
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function PostsPageContent({ session, posts: initialPosts }: PostsPageContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tagParam = searchParams.get("tag")

  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedTagSlug, setSelectedTagSlug] = useState<string | null>(tagParam)
  const [tags, setTags] = useState<Tag[]>([])
  const [posts, setPosts] = useState(initialPosts)
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()

  // 获取所有标签
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const { data, error } = await supabase.from("tags").select("*").order("name")

        if (error) throw error
        setTags(data || [])
      } catch (error) {
        console.error("获取标签失败:", error)
      }
    }

    fetchTags()
  }, [supabase])

  // 根据标签筛选帖子
  useEffect(() => {
    const fetchFilteredPosts = async () => {
      if (!selectedTagSlug && initialPosts) {
        setPosts(initialPosts)
        return
      }

      setIsLoading(true)
      try {
        // 先获取标签ID
        let tagId = null
        if (selectedTagSlug) {
          const { data: tagData } = await supabase.from("tags").select("id").eq("slug", selectedTagSlug).single()

          if (tagData) {
            tagId = tagData.id
          }
        }

        // 根据标签ID筛选帖子
        const query = supabase
          .from("posts")
          .select(`
            *,
            profiles:user_id (id, username, avatar_url),
            comments:comments (id),
            tags:tag_id (*)
          `)
          .order("created_at", { ascending: false })

        if (tagId) {
          query.eq("tag_id", tagId)
        }

        const { data, error } = await query

        if (error) throw error
        setPosts(data || [])
      } catch (error) {
        console.error("获取帖子失败:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFilteredPosts()
  }, [selectedTagSlug, initialPosts, supabase])

  // 处理标签点击
  const handleTagClick = (slug: string) => {
    if (selectedTagSlug === slug) {
      setSelectedTagSlug(null)
      router.push("/posts")
    } else {
      setSelectedTagSlug(slug)
      router.push(`/posts?tag=${slug}`)
    }
  }

  // 清除标签筛选
  const clearTagFilter = () => {
    setSelectedTagSlug(null)
    router.push("/posts")
  }

  // 过滤和排序帖子
  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    } else if (sortBy === "oldest") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    } else if (sortBy === "comments") {
      return (b.comments?.length || 0) - (a.comments?.length || 0)
    }
    return 0
  })

  return (
    <div className="space-y-8">
      <motion.div
        className="hero-gradient rounded-lg p-8 text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-2">社区帖子</h1>
          <p className="text-white/90 mb-6">浏览社区中的精彩帖子，分享您的想法和经验，与其他玩家交流互动。</p>
          {session && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild className="bg-white text-green-800 hover:bg-white/90 shadow-md">
                <Link href="/posts/new">
                  <Plus className="h-4 w-4 mr-2" />
                  发布帖子
                </Link>
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* 标签筛选区域 */}
      <motion.div
        className="flex flex-wrap gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {tags.map((tag) => (
          <Badge
            key={tag.id}
            variant={selectedTagSlug === tag.slug ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handleTagClick(tag.slug)}
          >
            {tag.name}
          </Badge>
        ))}

        {selectedTagSlug && (
          <Button variant="ghost" size="sm" onClick={clearTagFilter} className="h-6 px-2">
            清除筛选
          </Button>
        )}
      </motion.div>

      <motion.div
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="relative w-full md:w-auto md:min-w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜索帖子..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="排序方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">最新发布</SelectItem>
                <SelectItem value="oldest">最早发布</SelectItem>
                <SelectItem value="comments">评论最多</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {session && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="ml-auto md:ml-0">
              <Button asChild className="shadow-sm">
                <Link href="/posts/new">
                  <Plus className="h-4 w-4 mr-2" />
                  发布帖子
                </Link>
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      ) : sortedPosts.length > 0 ? (
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {sortedPosts.map((post) => (
            <motion.div key={post.id} variants={item}>
              <PostCard post={post} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          className="text-center py-12 bg-muted/30 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {searchTerm || selectedTagSlug ? (
            <>
              <h3 className="text-lg font-medium">没有找到匹配的帖子</h3>
              <p className="text-muted-foreground mt-1">尝试使用其他关键词或标签</p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium">还没有帖子</h3>
              <p className="text-muted-foreground mt-1">成为第一个发帖的用户吧！</p>
            </>
          )}
          {session && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block mt-4">
              <Button asChild className="shadow-sm">
                <Link href="/posts/new">
                  <Plus className="h-4 w-4 mr-2" />
                  发布帖子
                </Link>
              </Button>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}
