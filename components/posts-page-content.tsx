"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PostCard } from "@/components/post-card"
import { Plus, Search, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

export function PostsPageContent({ session, posts }: PostsPageContentProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")

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

      {sortedPosts.length > 0 ? (
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
          {searchTerm ? (
            <>
              <h3 className="text-lg font-medium">没有找到匹配的帖子</h3>
              <p className="text-muted-foreground mt-1">尝试使用其他关键词搜索</p>
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
