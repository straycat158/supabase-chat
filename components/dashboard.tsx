"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { MessageSquare, Users, FileText, Plus, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"

interface DashboardProps {
  userPosts: any[]
  recentPosts: any[]
  stats: {
    users: number
    posts: number
    comments: number
  }
}

// 安全的时间格式化函数
function safeFormatTime(dateString: string | null | undefined): string {
  if (!dateString) return "未知时间"

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "无效时间"

    return new Intl.RelativeTimeFormat("zh-CN", { numeric: "auto" }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      "day",
    )
  } catch (error) {
    console.error("Time formatting error:", error)
    return "时间格式错误"
  }
}

// 安全的加入时间格式化
function safeFormatJoinTime(dateString: string | null | undefined): string {
  if (!dateString) return "未知"

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "无效日期"

    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
    })
  } catch (error) {
    console.error("Join time formatting error:", error)
    return "日期格式错误"
  }
}

export function Dashboard({ userPosts, recentPosts, stats }: DashboardProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session?.user) {
          // 获取用户详细信息
          const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

          setUser({
            ...session.user,
            profile: profile || {},
          })
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const displayName = user?.profile?.username || user?.email?.split("@")[0] || "用户"
  const userCommentCount = userPosts?.reduce((total, post) => total + (post.comments?.length || 0), 0) || 0

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* 欢迎区域 */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.profile?.avatar_url || "/placeholder.svg"} />
            <AvatarFallback className="text-lg">{displayName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">欢迎回来，{displayName}！</h1>
            <p className="text-muted-foreground">加入于 {safeFormatJoinTime(user?.profile?.created_at)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/posts/new">
              <Plus className="h-4 w-4 mr-2" />
              发布新帖
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/profile">编辑资料</Link>
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">我的帖子</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userPosts?.length || 0}</div>
            <p className="text-xs text-muted-foreground">获得 {userCommentCount} 条评论</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">社区用户</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
            <p className="text-xs text-muted-foreground">活跃的社区成员</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总帖子数</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.posts}</div>
            <p className="text-xs text-muted-foreground">社区讨论话题</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总评论数</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.comments}</div>
            <p className="text-xs text-muted-foreground">互动交流次数</p>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 我的帖子 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    我的最新帖子
                  </CardTitle>
                  <CardDescription>查看和管理您发布的内容</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/posts?author=me">查看全部</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {userPosts && userPosts.length > 0 ? (
                userPosts.slice(0, 5).map((post) => (
                  <div key={post.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link href={`/posts/${post.id}`} className="font-medium hover:text-primary transition-colors">
                          {post.title}
                        </Link>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {post.comments?.length || 0} 评论
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {safeFormatTime(post.created_at)}
                          </span>
                        </div>
                      </div>
                      <Badge variant={post.type === "discussion" ? "default" : "secondary"}>
                        {post.type === "discussion" ? "讨论" : "资源"}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">还没有发布帖子</h3>
                  <p className="text-muted-foreground mb-4">开始分享您的想法和资源吧！</p>
                  <Button asChild>
                    <Link href="/posts/new">
                      <Plus className="h-4 w-4 mr-2" />
                      发布第一个帖子
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 快速操作 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">快速操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" asChild>
                <Link href="/posts/new">
                  <Plus className="h-4 w-4 mr-2" />
                  发布新帖子
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/resources">
                  <FileText className="h-4 w-4 mr-2" />
                  浏览资源
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/posts">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  查看讨论
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* 社区动态 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                社区动态
              </CardTitle>
              <CardDescription>最新的社区活动</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentPosts && recentPosts.length > 0 ? (
                recentPosts.slice(0, 3).map((post) => (
                  <div key={post.id} className="space-y-2">
                    <Link
                      href={`/posts/${post.id}`}
                      className="text-sm font-medium hover:text-primary transition-colors line-clamp-2"
                    >
                      {post.title}
                    </Link>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>by {post.profiles?.username || "匿名用户"}</span>
                      <span>{safeFormatTime(post.created_at)}</span>
                    </div>
                    <Separator />
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">暂无最新动态</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
