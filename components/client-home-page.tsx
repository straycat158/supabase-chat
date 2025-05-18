"use client"

import { useState } from "react"
import { PostCard } from "@/components/post-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AuthDebugger } from "@/components/auth-debugger"

interface ClientHomePageProps {
  initialPosts: any[]
  initialSession: any
}

export default function ClientHomePage({ initialPosts, initialSession }: ClientHomePageProps) {
  const [posts] = useState(initialPosts)
  const [session] = useState(initialSession)

  return (
    <div className="space-y-6">
      {/* 添加认证调试器 */}
      <AuthDebugger />

      <div className="relative bg-gradient-to-b from-green-600 to-green-800 rounded-lg p-8 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">欢迎来到Minecraft论坛</h1>
          <p className="text-lg mb-6 max-w-2xl">
            在这里分享您的Minecraft建筑、红石设计、生存技巧和游戏体验。加入我们的社区，与其他玩家交流互动！
          </p>
          {session ? (
            <Button asChild size="lg" className="bg-white text-green-800 hover:bg-gray-100">
              <Link href="/posts/new">
                <Plus className="h-5 w-5 mr-2" />
                发布帖子
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="bg-white text-green-800 hover:bg-gray-100">
              <Link href="/signup">立即加入</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">最新帖子</h2>
        <div className="flex items-center gap-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="搜索帖子..." className="pl-8" />
          </div>
          {session && (
            <Button asChild>
              <Link href="/posts/new">
                <Plus className="h-4 w-4 mr-2" />
                发布帖子
              </Link>
            </Button>
          )}
        </div>
      </div>

      {posts && posts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <h3 className="text-lg font-medium">还没有帖子</h3>
          <p className="text-muted-foreground mt-1">成为第一个发帖的用户吧！</p>
          {session && (
            <Button asChild className="mt-4">
              <Link href="/posts/new">
                <Plus className="h-4 w-4 mr-2" />
                发布帖子
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
