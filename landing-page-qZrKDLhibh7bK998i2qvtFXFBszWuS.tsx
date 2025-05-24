"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PostCard } from "@/components/post-card"
import { Users, MessageSquare, FileText, ArrowRight, Sparkles, Shield, Zap } from "lucide-react"
import Link from "next/link"

interface LandingPageProps {
  latestPosts: any[]
  stats: {
    users: number
    posts: number
    comments: number
  }
}

export function LandingPage({ latestPosts, stats }: LandingPageProps) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            欢迎来到 Minecraft 社区论坛
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            探索无限可能的
            <br />
            Minecraft 世界
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            与全球 Minecraft 玩家分享创意、交流技巧、下载资源。 加入我们的社区，开启你的方块世界冒险之旅！
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">
                立即加入社区
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/posts">浏览帖子</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold mb-2">{stats.users}</div>
                <p className="text-muted-foreground">活跃用户</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold mb-2">{stats.posts}</div>
                <p className="text-muted-foreground">精彩帖子</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold mb-2">{stats.comments}</div>
                <p className="text-muted-foreground">热烈讨论</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">为什么选择我们的社区？</h2>
            <p className="text-muted-foreground text-lg">专为 Minecraft 玩家打造的专业交流平台</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-primary mb-2" />
                <CardTitle>快速分享</CardTitle>
                <CardDescription>轻松发布你的建筑作品、游戏心得和创意想法</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle>安全可靠</CardTitle>
                <CardDescription>严格的内容审核机制，确保社区环境健康友好</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>活跃社区</CardTitle>
                <CardDescription>与来自世界各地的 Minecraft 爱好者互动交流</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">最新帖子</h2>
              <p className="text-muted-foreground">看看社区成员们在讨论什么</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/posts">
                查看更多
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestPosts && latestPosts.length > 0 ? (
              latestPosts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <div className="col-span-full text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">暂无帖子</h3>
                <p className="text-muted-foreground">成为第一个发布帖子的用户吧！</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-4">准备好加入我们了吗？</h2>
          <p className="text-xl text-muted-foreground mb-8">立即注册，开始你的 Minecraft 社区之旅</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">
                免费注册
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">已有账号？登录</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
