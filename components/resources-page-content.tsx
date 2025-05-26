"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { PostCard } from "@/components/post-card"
import { Plus, Search, TagIcon, BookOpen, Package, Zap } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { TagBadge } from "@/components/tag-badge"
import type { Tag } from "@/lib/types/database"

interface ResourcesPageContentProps {
  session: any
  tags: Tag[]
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

export function ResourcesPageContent({ session, tags, posts }: ResourcesPageContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tagParam = searchParams.get("tag")

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTagSlug, setSelectedTagSlug] = useState<string | null>(tagParam)
  const [activeTab, setActiveTab] = useState<string>("all")

  // 根据标签分组帖子
  const postsByTag = tags.reduce(
    (acc, tag) => {
      acc[tag.id] = posts.filter((post) => post.tag_id === tag.id)
      return acc
    },
    {} as Record<string, any[]>,
  )

  // 处理标签点击
  const handleTagClick = (slug: string) => {
    setSelectedTagSlug(slug)
    router.push(`/resources?tag=${slug}`)

    // 找到对应的标签ID，设置为当前活动标签
    const tag = tags.find((t) => t.slug === slug)
    if (tag) {
      setActiveTab(tag.id)
    }
  }

  // 初始化活动标签
  useEffect(() => {
    if (tagParam) {
      const tag = tags.find((t) => t.slug === tagParam)
      if (tag) {
        setActiveTab(tag.id)
      }
    }
  }, [tagParam, tags])

  // 过滤帖子
  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
              <Package className="h-4 w-4" />
              资源中心
            </motion.div>
            <motion.h1
              className="mb-4 text-4xl font-bold md:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Minecraft 资源宝库
            </motion.h1>
            <motion.p
              className="mb-6 text-lg text-white/90 md:text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              探索社区分享的各类Minecraft资源，包括服务器、模组、资源包、建筑设计等。
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
                  分享资源
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* 搜索栏 */}
        <motion.div
          className="relative w-full max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜索资源..."
            className="pl-10 border-green-200 focus:border-green-400 focus:ring-green-400/20 dark:border-green-800 dark:focus:border-green-600 bg-white/80 backdrop-blur-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </motion.div>

        {/* 标签导航 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto pb-2">
              <TabsList className="h-auto p-1 flex flex-nowrap min-w-max bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-green-200/50 dark:border-green-800/50">
                <TabsTrigger
                  value="all"
                  className="h-10 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white"
                  onClick={() => {
                    setSelectedTagSlug(null)
                    router.push("/resources")
                  }}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  全部资源
                </TabsTrigger>

                {tags.map((tag, index) => (
                  <TabsTrigger
                    key={tag.id}
                    value={tag.id}
                    className="h-10 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white"
                    onClick={() => handleTagClick(tag.slug)}
                  >
                    <TagIcon className="h-4 w-4 mr-2" />
                    {tag.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* 全部资源标签内容 */}
            <TabsContent value="all" className="mt-8">
              {searchTerm ? (
                <div className="mb-4">
                  <h2 className="text-2xl font-bold mb-6 text-green-800 dark:text-green-200">搜索结果</h2>
                  {filteredPosts.length > 0 ? (
                    <motion.div
                      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                      variants={container}
                      initial="hidden"
                      animate="show"
                    >
                      {filteredPosts.map((post, index) => (
                        <motion.div key={post.id} variants={item}>
                          <PostCard post={post} />
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-green-200/50 dark:border-green-800/50">
                      <CardContent className="py-12 text-center">
                        <Zap className="h-16 w-16 text-green-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2 text-green-800 dark:text-green-200">
                          没有找到匹配的资源
                        </h3>
                        <p className="text-green-600 dark:text-green-400">尝试使用其他关键词搜索</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="space-y-12">
                  {tags.map((tag, tagIndex) => {
                    const tagPosts = postsByTag[tag.id] || []
                    if (tagPosts.length === 0) return null

                    return (
                      <motion.div
                        key={tag.id}
                        className="space-y-6"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: tagIndex * 0.1, duration: 0.6 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <TagBadge tag={tag} size="lg" />
                            <span className="text-sm text-muted-foreground bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                              {tagPosts.length} 个资源
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-950/20"
                          >
                            <Link href={`/resources?tag=${tag.slug}`}>查看全部</Link>
                          </Button>
                        </div>

                        <motion.div
                          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                          variants={container}
                          initial="hidden"
                          animate="show"
                        >
                          {tagPosts.slice(0, 3).map((post, postIndex) => (
                            <motion.div key={post.id} variants={item}>
                              <PostCard post={post} />
                            </motion.div>
                          ))}
                        </motion.div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            {/* 各标签内容 */}
            {tags.map((tag) => {
              const tagPosts = postsByTag[tag.id] || []
              const filteredTagPosts = tagPosts.filter(
                (post) =>
                  post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  post.content.toLowerCase().includes(searchTerm.toLowerCase()),
              )

              return (
                <TabsContent key={tag.id} value={tag.id} className="mt-8">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <TagBadge tag={tag} size="lg" />
                        <span className="text-sm text-muted-foreground bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                          {searchTerm ? filteredTagPosts.length : tagPosts.length} 个资源
                        </span>
                      </div>
                    </div>

                    {tag.description && (
                      <p className="text-muted-foreground bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200/50 dark:border-green-800/50">
                        {tag.description}
                      </p>
                    )}
                  </div>

                  {searchTerm ? (
                    filteredTagPosts.length > 0 ? (
                      <motion.div
                        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                        variants={container}
                        initial="hidden"
                        animate="show"
                      >
                        {filteredTagPosts.map((post) => (
                          <motion.div key={post.id} variants={item}>
                            <PostCard post={post} />
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-green-200/50 dark:border-green-800/50">
                        <CardContent className="py-12 text-center">
                          <Zap className="h-16 w-16 text-green-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2 text-green-800 dark:text-green-200">
                            没有找到匹配的资源
                          </h3>
                          <p className="text-green-600 dark:text-green-400">尝试使用其他关键词搜索</p>
                        </CardContent>
                      </Card>
                    )
                  ) : tagPosts.length > 0 ? (
                    <motion.div
                      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                      variants={container}
                      initial="hidden"
                      animate="show"
                    >
                      {tagPosts.map((post) => (
                        <motion.div key={post.id} variants={item}>
                          <PostCard post={post} />
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-green-200/50 dark:border-green-800/50">
                      <CardContent className="py-12 text-center">
                        <Package className="h-16 w-16 text-green-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2 text-green-800 dark:text-green-200">暂无相关资源</h3>
                        <p className="text-green-600 dark:text-green-400 mb-4">成为第一个分享此类资源的用户吧！</p>
                        {session && (
                          <Button
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                            onClick={() => router.push("/posts/new")}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            分享资源
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              )
            })}
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
