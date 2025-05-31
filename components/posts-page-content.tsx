"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PostCard } from "@/components/post-card"
import { Plus, Search, Filter, Sparkles, TrendingUp } from "lucide-react"
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
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
}

const heroVariants = {
  hidden: { opacity: 0, y: -50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      duration: 0.8,
    },
  },
}

const filterVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 20,
      delay: 0.2,
    },
  },
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

  useEffect(() => {
    const fetchFilteredPosts = async () => {
      if (!selectedTagSlug && initialPosts) {
        setPosts(initialPosts)
        return
      }

      setIsLoading(true)
      try {
        let tagId = null
        if (selectedTagSlug) {
          const { data: tagData } = await supabase.from("tags").select("id").eq("slug", selectedTagSlug).single()
          if (tagData) tagId = tagData.id
        }

        const query = supabase
          .from("posts")
          .select(
            `
            *,
            profiles:user_id (id, username, avatar_url),
            comments:comments (id),
            tags:tag_id (*)
          `
          )
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

  const handleTagClick = (slug: string) => {
    if (selectedTagSlug === slug) {
      setSelectedTagSlug(null)
      router.push("/posts")
    } else {
      setSelectedTagSlug(slug)
      router.push(`/posts?tag=${slug}`)
    }
  }

  const clearTagFilter = () => {
    setSelectedTagSlug(null)
    router.push("/posts")
  }

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20">
      <div className="space-y-8 pb-8">
        {/* Hero Section */}
        <motion.div
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-8 text-white shadow-2xl"
          variants={heroVariants}
          initial="hidden"
          animate="visible"
        >
          {/* 背景装饰 */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-white/10 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 20,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
            <motion.div
              className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-white/10 blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                rotate: [360, 180, 0],
              }}
              transition={{
                duration: 25,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
          </div>

          <div className="relative z-10 max-w-3xl">
            <motion.div
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <Sparkles className="h-4 w-4" />
              社区帖子
            </motion.div>
            <motion.h1
              className="mb-4 text-4xl font-bold md:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              探索精彩内容
            </motion.h1>
            <motion.p
              className="mb-6 text-lg text-white/90 md:text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              浏览社区中的精彩帖子，分享您的想法和经验，与其他玩家交流互动。
            </motion.p>
            {session && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  className="bg-white text-green-700 hover:bg-white/90 shadow-lg transition-all duration-300"
                  onClick={() => router.push("/posts/new")}
                  size="lg"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  发布帖子
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* 标签筛选区域 */}
        <motion.div className="flex flex-wrap gap-3" variants={filterVariants} initial="hidden" animate="visible">
          <AnimatePresence>
            {tags.map((tag, index) => (
              <motion.div
                key={tag.id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge
                  variant={selectedTagSlug === tag.slug ? "default" : "outline"}
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedTagSlug === tag.slug
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                      : "hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-950/20"
                  }`}
                  onClick={() => handleTagClick(tag.slug)}
                >
                  {tag.name}
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>

          {selectedTagSlug && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={clearTagFilter}
                className="h-6 px-3 text-xs hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
              >
                清除筛选
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* 搜索和筛选区域 */}
        <motion.div
          className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="relative w-full md:w-auto md:min-w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜索帖子..."
              className="pl-10 border-green-200 focus:border-green-400 focus:ring-green-400/20 dark:border-green-800 dark:focus:border-green-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[75%] border-green-200 focus:border-green-400 focus:ring-green-400/20 dark:border-green-800 dark:focus:border-green-600">
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
                <Button
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg transition-all duration-300"
                  onClick={() => router.push("/posts/new")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  发布帖子
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-r-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />
              <p className="mt-4 text-muted-foreground">加载中...</p>
            </motion.div>
          ) : sortedPosts.length > 0 ? (
            <motion.div
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {sortedPosts.map((post) => (
                <motion.div
                  key={post.id}
                  variants={item}
                  whileHover={{
                    y: -8,
                    transition: { type: "spring", stiffness: 300, damping: 20 },
                  }}
                  layout
                >
                  <PostCard
                    post={post}
                    className="bg-white dark:bg-green-950/40 border border-green-100 dark:border-green-800 rounded-2xl p-4 shadow-md dark:shadow-none overflow-hidden"
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-16 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/10 dark:to-emerald-950/10 rounded-2xl border border-green-200/50 dark:border-green-800/50"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <TrendingUp className="h-16 w-16 text-green-400 mx-auto mb-6" />
                {searchTerm || selectedTagSlug ? (
                  <>
                    <h3 className="text-xl font-semibold mb-2 text-green-800 dark:text-green-200">
                      没有找到匹配的帖子
                    </h3>
                    <p className="text-green-600 dark:text-green-400 mb-6">尝试使用其他关键词或标签</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold mb-2 text-green-800 dark:text-green-200">还没有帖子</h3>
                    <p className="text-green-600 dark:text-green-400 mb-6">成为第一个发帖的用户吧！</p>
                  </>
                )}
                {session && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg"
                      onClick={() => router.push("/posts/new")}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      发布帖子
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}