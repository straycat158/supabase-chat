"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, MessageSquare, Users, TrendingUp, Clock, Edit3, Calendar, Star, Activity } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { AnnouncementsDisplay } from "@/components/announcements-display"

interface DashboardProps {
  userPosts: any[]
  recentPosts: any[]
  stats: {
    users: number
    posts: number
    comments: number
  }
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function Dashboard({ userPosts, recentPosts, stats }: DashboardProps) {
  const { user } = useAuth()
  const supabase = createClient()
  const [userStats, setUserStats] = useState({
    totalPosts: 0,
    totalComments: 0,
    joinedDate: "",
  })

  useEffect(() => {
    if (!user) return

    const fetchUserStats = async () => {
      try {
        // 获取用户帖子数量
        const { count: postsCount } = await supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)

        // 获取用户评论数量
        const { count: commentsCount } = await supabase
          .from("comments")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)

        // 获取用户资料信息
        const { data: profile } = await supabase.from("profiles").select("created_at").eq("id", user.id).single()

        setUserStats({
          totalPosts: postsCount || 0,
          totalComments: commentsCount || 0,
          joinedDate: profile?.created_at || user.created_at,
        })
      } catch (error) {
        console.error("获取用户统计失败:", error)
      }
    }

    fetchUserStats()
  }, [user, supabase])

  const quickActions = [
    {
      title: "发布帖子",
      description: "分享您的想法和经验",
      icon: <Plus className="h-6 w-6" />,
      href: "/posts/new",
      color: "bg-blue-500",
    },
    {
      title: "浏览帖子",
      description: "查看社区最新内容",
      icon: <MessageSquare className="h-6 w-6" />,
      href: "/posts",
      color: "bg-green-500",
    },
    {
      title: "资源中心",
      description: "探索各类Minecraft资源",
      icon: <Star className="h-6 w-6" />,
      href: "/resources",
      color: "bg-purple-500",
    },
    {
      title: "个人资料",
      description: "管理您的账户信息",
      icon: <Edit3 className="h-6 w-6" />,
      href: "/profile",
      color: "bg-orange-500",
    },
  ]

  return (
    <div className="space-y-8">
      {/* 公告显示 */}
      <AnnouncementsDisplay />

      {/* 欢迎区域 */}
      <motion.div
        className="hero-gradient rounded-xl p-8 text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">欢迎回来，{user?.user_metadata?.username || "玩家"}！</h1>
            <p className="text-white/90">今天是探索Minecraft世界的好日子，看看社区里有什么新鲜事吧！</p>
          </div>
          <div className="hidden md:block">
            <Avatar className="h-20 w-20 border-4 border-white/20">
              <AvatarImage src={user?.user_metadata?.avatar_url || ""} alt={user?.user_metadata?.username || "用户"} />
              <AvatarFallback className="text-2xl bg-white/20 text-white">
                {(user?.user_metadata?.username || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </motion.div>

      {/* 统计卡片 */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
          <Card className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">我的帖子</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.totalPosts}</div>
              <p className="text-xs text-muted-foreground">+{userPosts.length} 最近发布</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">我的评论</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.totalComments}</div>
              <p className="text-xs text-muted-foreground">参与讨论</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">社区成员</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users}</div>
              <p className="text-xs text-muted-foreground">活跃玩家</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">加入时间</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDistanceToNow(new Date(userStats.joinedDate), { locale: zhCN })}
              </div>
              <p className="text-xs text-muted-foreground">前加入</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* 快速操作 */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold">快速操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div key={action.title} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href={action.href}>
                <Card className="border-none shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`${action.color} p-3 rounded-lg text-white`}>{action.icon}</div>
                      <div>
                        <h3 className="font-semibold">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 我的最新帖子 */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">我的最新帖子</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/posts?author=me">查看全部</Link>
            </Button>
          </div>

          {userPosts.length > 0 ? (
            <div className="space-y-4">
              {userPosts.slice(0, 3).map((post) => (
                <Card key={post.id} className="border-none shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Link href={`/posts/${post.id}`}>
                          <h3 className="font-semibold hover:text-primary transition-colors">{post.title}</h3>
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(post.created_at), {
                              addSuffix: true,
                              locale: zhCN,
                            })}
                          </span>
                          <MessageSquare className="h-3 w-3 text-muted-foreground ml-2" />
                          <span className="text-xs text-muted-foreground">{post.comments?.length || 0}</span>
                        </div>
                      </div>
                      {post.image_url && (
                        <div className="ml-4">
                          <div className="w-16 h-16 rounded-md overflow-hidden">
                            <img
                              src={post.image_url || "/placeholder.svg"}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-md">
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">还没有发布帖子</h3>
                <p className="text-muted-foreground mb-4">分享您的Minecraft经验和创意吧！</p>
                <Button asChild>
                  <Link href="/posts/new">
                    <Plus className="h-4 w-4 mr-2" />
                    发布第一篇帖子
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* 社区最新动态 */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">社区最新动态</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/posts">查看更多</Link>
            </Button>
          </div>

          {recentPosts.length > 0 ? (
            <div className="space-y-4">
              {recentPosts.slice(0, 3).map((post) => (
                <Card key={post.id} className="border-none shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={post.profiles?.avatar_url || ""} alt={post.profiles?.username || "用户"} />
                        <AvatarFallback>{(post.profiles?.username || "U").charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{post.profiles?.username}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(post.created_at), {
                              addSuffix: true,
                              locale: zhCN,
                            })}
                          </span>
                        </div>
                        <Link href={`/posts/${post.id}`}>
                          <h3 className="font-semibold mt-1 hover:text-primary transition-colors">{post.title}</h3>
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <MessageSquare className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{post.comments?.length || 0} 评论</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-md">
              <CardContent className="p-8 text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">暂无最新动态</h3>
                <p className="text-muted-foreground">社区正在等待您的参与！</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  )
}
