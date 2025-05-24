"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { MessageSquare, Users, Plus, TrendingUp, Clock, Calendar, Activity, Star, Edit3, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { useRouter } from "next/navigation"

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

    return formatDistanceToNow(date, { addSuffix: true, locale: zhCN })
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

    return formatDistanceToNow(date, { locale: zhCN })
  } catch (error) {
    console.error("Join time formatting error:", error)
    return "日期格式错误"
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
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState({
    totalPosts: 0,
    totalComments: 0,
    joinedDate: "",
  })
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function getUser() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          setUser(session.user)

          // 获取用户详细资料
          const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

          if (profile) {
            setUserProfile(profile)
          }

          // 获取用户统计数据
          const { count: postsCount } = await supabase
            .from("posts")
            .select("*", { count: "exact", head: true })
            .eq("user_id", session.user.id)

          const { count: commentsCount } = await supabase
            .from("comments")
            .select("*", { count: "exact", head: true })
            .eq("user_id", session.user.id)

          setUserStats({
            totalPosts: postsCount || 0,
            totalComments: commentsCount || 0,
            joinedDate: profile?.created_at || session.user.created_at || "",
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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center">
          <CardContent>
            <p className="text-muted-foreground">请先登录以查看仪表盘</p>
            <Button asChild className="mt-4">
              <Link href="/login">立即登录</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const displayName = userProfile?.username || user?.user_metadata?.username || user?.email?.split("@")[0] || "用户"
  const avatarUrl = userProfile?.avatar_url || user?.user_metadata?.avatar_url || ""

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
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* 返回按钮 */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>
      </motion.div>

      {/* 用户信息卡片 */}
      <motion.div
        className="hero-gradient rounded-xl p-8 text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* 用户头像 - 更大更突出 */}
          <div className="flex-shrink-0">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white/20 shadow-lg">
              <AvatarImage
                src={avatarUrl || "/placeholder.svg"}
                alt={displayName}
                className="object-cover"
                onError={(e) => {
                  console.log("Avatar load error:", e)
                }}
              />
              <AvatarFallback className="text-2xl md:text-4xl bg-white/20 text-white font-bold">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* 用户信息 */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">欢迎回来，{displayName}！</h1>
            <p className="text-white/90 text-lg mb-4">今天是探索Minecraft世界的好日子，看看您的最新动态吧！</p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
              <div className="bg-white/10 rounded-lg px-3 py-1">
                <span className="text-white/70">加入时间：</span>
                <span className="font-medium">{safeFormatJoinTime(userStats.joinedDate)}前</span>
              </div>
              <div className="bg-white/10 rounded-lg px-3 py-1">
                <span className="text-white/70">邮箱：</span>
                <span className="font-medium">{user.email}</span>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button variant="secondary" asChild>
              <Link href="/profile">
                <Edit3 className="h-4 w-4 mr-2" />
                编辑资料
              </Link>
            </Button>
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
              <div className="text-lg font-bold">{safeFormatJoinTime(userStats.joinedDate)}</div>
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
              <Link href="/posts">查看全部</Link>
            </Button>
          </div>

          {userPosts && userPosts.length > 0 ? (
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
                          <span className="text-xs text-muted-foreground">{safeFormatTime(post.created_at)}</span>
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

          {recentPosts && recentPosts.length > 0 ? (
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
                          <span className="text-xs text-muted-foreground">{safeFormatTime(post.created_at)}</span>
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
