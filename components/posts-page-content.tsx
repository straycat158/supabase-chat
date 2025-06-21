"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { MessageSquare, Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { PostCard } from "@/components/post-card"

interface Tag {
  id: string
  name: string
}

interface Post {
  id: string
  title: string
  content: string
  created_at: string
  tag_id?: string
  tags?: Tag
  profiles?: {
    username: string
    avatar_url?: string
  }
  comments?: any[]
  image_url?: string
}

interface PostsPageContentProps {
  session: any | null
  tags: Tag[]
  posts: Post[]
}

const heroVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeInOut",
    },
  },
}

export function PostsPageContent({ session, tags, posts: initialPosts }: PostsPageContentProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTag, setSelectedTag] = useState<string>("all")
  const [sortBy, setSortBy] = useState("newest")
  const router = useRouter()

  // 筛选和排序帖子
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = initialPosts || []

    // 按标签筛选
    if (selectedTag !== "all") {
      filtered = filtered.filter((post) => post.tag_id === selectedTag)
    }

    // 按搜索词筛选
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchLower) ||
          post.content.toLowerCase().includes(searchLower) ||
          (post.profiles?.username && post.profiles.username.toLowerCase().includes(searchLower)),
      )
    }

    // 排序
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sortBy === "newest" ? dateB - dateA : dateA - dateB
    })

    return filtered
  }, [initialPosts, selectedTag, searchTerm, sortBy])

  // 获取选中标签的名称
  const selectedTagName = useMemo(() => {
    if (selectedTag === "all") return "所有标签"
    const tag = tags.find((t) => t.id === selectedTag)
    return tag?.name || "未知标签"
  }, [selectedTag, tags])

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="space-y-0">
        {/* Hero Section - 黑白几何风格 */}
        <motion.div
          className="relative overflow-hidden bg-white dark:bg-black border-b-4 border-black dark:border-white"
          variants={heroVariants}
          initial="hidden"
          animate="visible"
        >
          {/* 几何背景装饰 */}
          <div className="absolute inset-0">
            <motion.div
              className="absolute top-0 left-0 w-32 h-32 bg-black dark:bg-white transform rotate-45 -translate-x-16 -translate-y-16 opacity-10"
              animate={{
                rotate: [45, 225, 45],
              }}
              transition={{
                duration: 20,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
            <div className="absolute top-20 right-20 w-16 h-16 border-4 border-black dark:border-white opacity-20"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-black dark:bg-white rounded-full -translate-y-12 translate-x-12 opacity-10"></div>
            <motion.div
              className="absolute top-1/2 left-1/4 w-8 h-8 border-2 border-black dark:border-white transform rotate-45"
              animate={{
                rotate: [45, 405, 45],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 15,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          </div>

          <div className="relative z-10 container mx-auto px-4 py-16">
            <div className="text-center space-y-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-block">
                <div className="w-20 h-20 bg-black dark:bg-white mx-auto mb-6 flex items-center justify-center transform rotate-45 shadow-[8px_8px_0px_rgba(0,0,0,0.3)] dark:shadow-[8px_8px_0px_rgba(255,255,255,0.3)]">
                  <MessageSquare className="h-10 w-10 text-white dark:text-black transform -rotate-45" />
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-7xl font-black tracking-tight text-black dark:text-white"
              >
                帖子广场
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto font-bold"
              >
                分享你的 Minecraft 经验，与社区成员交流互动
              </motion.p>

              {session && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <Button
                    className="bw-button font-black text-xl px-10 py-4 h-auto"
                    onClick={() => router.push("/posts/new")}
                  >
                    <Plus className="mr-3 h-6 w-6" />
                    发布新帖子
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* 搜索筛选区域 */}
        <div className="bg-gray-50 dark:bg-gray-950 border-b-2 border-black dark:border-white">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  placeholder="搜索帖子..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2 border-black dark:border-white font-medium"
                />
              </div>

              <div className="flex gap-3">
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className="w-40 border-2 border-black dark:border-white font-medium">
                    <SelectValue placeholder="选择标签" />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-black dark:border-white">
                    <SelectItem value="all" className="font-medium">
                      所有标签
                    </SelectItem>
                    {tags.map((tag) => (
                      <SelectItem key={tag.id} value={tag.id} className="font-medium">
                        {tag.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32 border-2 border-black dark:border-white font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-black dark:border-white">
                    <SelectItem value="newest" className="font-medium">
                      最新
                    </SelectItem>
                    <SelectItem value="oldest" className="font-medium">
                      最旧
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* 帖子列表 */}
        <div className="container mx-auto px-4 py-8">
          {filteredAndSortedPosts && filteredAndSortedPosts.length > 0 ? (
            <>
              {/* 显示筛选信息 */}
              {(selectedTag !== "all" || searchTerm.trim()) && (
                <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-900 border-2 border-black dark:border-white">
                  <p className="text-black dark:text-white font-bold">
                    {searchTerm.trim() && selectedTag !== "all"
                      ? `搜索 "${searchTerm}" 在 "${selectedTagName}" 标签下，找到 ${filteredAndSortedPosts.length} 个结果`
                      : searchTerm.trim()
                        ? `搜索 "${searchTerm}"，找到 ${filteredAndSortedPosts.length} 个结果`
                        : `"${selectedTagName}" 标签下有 ${filteredAndSortedPosts.length} 个帖子`}
                  </p>
                </div>
              )}

              <motion.div
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {filteredAndSortedPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <PostCard post={post} />
                  </motion.div>
                ))}
              </motion.div>
            </>
          ) : (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bw-card p-16 max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-8 bg-black dark:bg-white flex items-center justify-center">
                  <MessageSquare className="h-12 w-12 text-white dark:text-black" />
                </div>
                <h3 className="text-2xl font-black mb-4 text-black dark:text-white">
                  {selectedTag !== "all" || searchTerm.trim() ? "没有找到匹配的帖子" : "还没有帖子"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  {selectedTag !== "all" || searchTerm.trim()
                    ? `在${selectedTag !== "all" ? `"${selectedTagName}"标签` : ""}${searchTerm.trim() ? `搜索"${searchTerm}"` : ""}中没有找到相关帖子，试试发布一个新帖子吧！`
                    : "成为第一个发帖的用户吧！"}
                </p>
                {session && (
                  <Button asChild className="bw-button font-bold">
                    <Link href="/posts/new">
                      <Plus className="h-4 w-4 mr-2" />
                      发布帖子
                    </Link>
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
