"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { PostCard } from "@/components/post-card"
import { Plus, Search, TagIcon, BookOpen } from "lucide-react"
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
      staggerChildren: 0.05,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
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
    <div className="space-y-8">
      <motion.div
        className="hero-gradient rounded-lg p-8 text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-2">Minecraft资源中心</h1>
          <p className="text-white/90 mb-6">探索社区分享的各类Minecraft资源，包括服务器、模组、资源包、建筑设计等。</p>
          {session && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="bg-white text-green-800 hover:bg-white/90 shadow-md"
                onClick={() => router.push("/posts/new")}
              >
                <Plus className="h-4 w-4 mr-2" />
                分享资源
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* 搜索栏 */}
      <div className="relative w-full max-w-md mx-auto">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="搜索资源..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 标签导航 */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="h-auto p-1 flex flex-nowrap min-w-max">
            <TabsTrigger
              value="all"
              className="h-9 px-4"
              onClick={() => {
                setSelectedTagSlug(null)
                router.push("/resources")
              }}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              全部资源
            </TabsTrigger>

            {tags.map((tag) => (
              <TabsTrigger key={tag.id} value={tag.id} className="h-9 px-4" onClick={() => handleTagClick(tag.slug)}>
                <TagIcon className="h-4 w-4 mr-2" />
                {tag.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* 全部资源标签内容 */}
        <TabsContent value="all" className="mt-6">
          {searchTerm ? (
            <div className="mb-4">
              <h2 className="text-xl font-bold mb-4">搜索结果</h2>
              {filteredPosts.length > 0 ? (
                <motion.div
                  className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {filteredPosts.map((post) => (
                    <motion.div key={post.id} variants={item}>
                      <PostCard post={post} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <Card>
                  <CardContent className="py-10 text-center">
                    <p className="text-muted-foreground">没有找到匹配的资源</p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="space-y-10">
              {tags.map((tag) => {
                const tagPosts = postsByTag[tag.id] || []
                if (tagPosts.length === 0) return null

                return (
                  <div key={tag.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TagBadge tag={tag} size="lg" />
                        <span className="text-sm text-muted-foreground">({tagPosts.length})</span>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/resources?tag=${tag.slug}`}>查看全部</Link>
                      </Button>
                    </div>

                    <motion.div
                      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                      variants={container}
                      initial="hidden"
                      animate="show"
                    >
                      {tagPosts.slice(0, 3).map((post) => (
                        <motion.div key={post.id} variants={item}>
                          <PostCard post={post} />
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
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
            <TabsContent key={tag.id} value={tag.id} className="mt-6">
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TagBadge tag={tag} size="lg" />
                    <span className="text-sm text-muted-foreground">
                      ({searchTerm ? filteredTagPosts.length : tagPosts.length})
                    </span>
                  </div>
                </div>

                <p className="text-muted-foreground mt-2">{tag.description}</p>
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
                  <Card>
                    <CardContent className="py-10 text-center">
                      <p className="text-muted-foreground">没有找到匹配的资源</p>
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
                <Card>
                  <CardContent className="py-10 text-center">
                    <p className="text-muted-foreground">暂无相关资源</p>
                    {session && (
                      <Button className="mt-4" onClick={() => router.push("/posts/new")}>
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
    </div>
  )
}
