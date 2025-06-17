"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import {
  MessageSquare,
  Users,
  Plus,
  TrendingUp,
  Clock,
  Calendar,
  Activity,
  Star,
  Edit3,
  ArrowLeft,
  Sparkles,
  Trophy,
  Target,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { DashboardClock } from "@/components/dashboard-clock"
import { Badge } from "@/components/ui/badge"

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
      staggerChildren: 0.08,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
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
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 opacity-20 blur-xl"></div>
          </div>
          <p className="text-green-600 font-medium">加载仪表盘...</p>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center border-0 bg-white/80 backdrop-blur-sm shadow-2xl">
          <CardContent>
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <p className="text-muted-foreground mb-4">请先登录以查看仪表盘</p>
            <Button
              asChild
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Link href="/login">立即登录</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const displayName = userProfile?.username || user?.user_metadata?.username || user?.email?.split("@")[0] || "用户"
  const avatarUrl = userProfile?.avatar_url || user?.user_metadata?.avatar_url || ""

  // 计算用户等级
  const getUserLevel = (posts: number, comments: number) => {
    const totalActivity = posts * 3 + comments
    if (totalActivity >= 100) return { level: "钻石玩家", color: "from-cyan-400 to-blue-500", icon: "💎" }
    if (totalActivity >= 50) return { level: "黄金玩家", color: "from-yellow-400 to-orange-500", icon: "🏆" }
    if (totalActivity >= 20) return { level: "白银玩家", color: "from-gray-300 to-gray-500", icon: "🥈" }
    if (totalActivity >= 5) return { level: "青铜玩家", color: "from-orange-400 to-red-500", icon: "🥉" }
    return { level: "新手玩家", color: "from-green-400 to-emerald-500", icon: "🌱" }
  }

  const userLevel = getUserLevel(userStats.totalPosts, userStats.totalComments)

  const quickActions = [
    {
      title: "发布帖子",
      description: "分享您的想法和经验",
      icon: <Plus className="h-6 w-6" />,
      href: "/posts/new",
      color: "from-blue-500 to-blue-600",
      hoverColor: "from-blue-600 to-blue-700",
    },
    {
      title: "浏览帖子",
      description: "查看社区最新内容",
      icon: <MessageSquare className="h-6 w-6" />,
      href: "/posts",
      color: "from-green-500 to-green-600",
      hoverColor: "from-green-600 to-green-700",
    },
    {
      title: "资源中心",
      description: "探索各类Minecraft资源",
      icon: <Star className="h-6 w-6" />,
      href: "/resources",
      color: "from-purple-500 to-purple-600",
      hoverColor: "from-purple-600 to-purple-700",
    },
    {
      title: "个人资料",
      description: "管理您的账户信息",
      icon: <Edit3 className="h-6 w-6" />,
      href: "/profile",
      color: "from-orange-500 to-orange-600",
      hoverColor: "from-orange-600 to-orange-700",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full blur-3xl"
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
          className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-br from-teal-200/30 to-cyan-200/30 rounded-full blur-3xl"
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

      <div className="relative z-10 container mx-auto px-4 py-8 space-y-8">
        {/* 返回按钮 */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 hover:bg-green-100 dark:hover:bg-green-900/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
        </motion.div>

        {/* 用户信息卡片 */}
        <motion.div
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-8 text-white shadow-2xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* 背景装饰 */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -bottom-12 -left-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"
              animate={{
                scale: [1.3, 1, 1.3],
                opacity: [0.6, 0.3, 0.6],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 2,
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* 用户头像 */}
            <motion.div
              className="flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="relative">
                <Avatar className="h-28 w-28 md:h-36 md:w-36 border-4 border-white/30 shadow-2xl">
                  <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={displayName} className="object-cover" />
                  <AvatarFallback className="text-3xl md:text-5xl bg-white/20 text-white font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* 等级徽章 */}
                <div className="absolute -bottom-2 -right-2">
                  <Badge className={`bg-gradient-to-r ${userLevel.color} text-white border-0 shadow-lg px-2 py-1`}>
                    <span className="mr-1">{userLevel.icon}</span>
                    <span className="text-xs font-medium">{userLevel.level}</span>
                  </Badge>
                </div>
              </div>
            </motion.div>

            {/* 用户信息 */}
            <div className="flex-1 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <h1 className="text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-white to-white/80 bg-clip-text">
                  欢迎回来，{displayName}！
                </h1>
                <p className="text-white/90 text-lg md:text-xl mb-6 leading-relaxed">
                  今天是探索Minecraft世界的好日子，看看您的最新动态吧！
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <motion.div
                    className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20"
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
                  >
                    <span className="text-white/70 text-sm">加入时间：</span>
                    <span className="font-semibold ml-1">{safeFormatJoinTime(userStats.joinedDate)}前</span>
                  </motion.div>
                  <motion.div
                    className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20"
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
                  >
                    <span className="text-white/70 text-sm">邮箱：</span>
                    <span className="font-semibold ml-1">{user.email}</span>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* 操作按钮 */}
            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Button
                variant="secondary"
                asChild
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
              >
                <Link href="/profile">
                  <Edit3 className="h-4 w-4 mr-2" />
                  编辑资料
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* 时钟模块 - 单独一行 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <DashboardClock />
        </motion.div>

        {/* 统计卡片 */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item}>
            <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">我的帖子</CardTitle>
                <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-lg group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-800 dark:text-green-200">{userStats.totalPosts}</div>
                <p className="text-xs text-muted-foreground">+{userPosts.length} 最近发布</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">我的评论</CardTitle>
                <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-lg group-hover:scale-110 transition-transform">
                  <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-800 dark:text-blue-200">{userStats.totalComments}</div>
                <p className="text-xs text-muted-foreground">参与讨论</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">社区成员</CardTitle>
                <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg group-hover:scale-110 transition-transform">
                  <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-800 dark:text-purple-200">{stats.users}</div>
                <p className="text-xs text-muted-foreground">活跃玩家</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">加入时间</CardTitle>
                <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-lg group-hover:scale-110 transition-transform">
                  <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-orange-800 dark:text-orange-200">
                  {safeFormatJoinTime(userStats.joinedDate)}
                </div>
                <p className="text-xs text-muted-foreground">前加入</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* 快速操作 */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-green-600" />
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-200">快速操作</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                variants={item}
                whileHover={{
                  scale: 1.05,
                  y: -5,
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Link href={action.href}>
                  <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <motion.div
                          className={`bg-gradient-to-r ${action.color} group-hover:${action.hoverColor} p-4 rounded-xl text-white shadow-lg`}
                          whileHover={{ rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        >
                          {action.icon}
                        </motion.div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{action.description}</p>
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
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="h-6 w-6 text-green-600" />
                <h2 className="text-2xl font-bold text-green-800 dark:text-green-200">我的最新帖子</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950/20"
              >
                <Link href="/posts">查看全部</Link>
              </Button>
            </div>

            {userPosts && userPosts.length > 0 ? (
              <div className="space-y-4">
                {userPosts.slice(0, 3).map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.5 }}
                  >
                    <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <Link href={`/posts/${post.id}`}>
                              <h3 className="font-semibold text-lg hover:text-green-600 dark:hover:text-green-400 transition-colors group-hover:translate-x-1 duration-300">
                                {post.title}
                              </h3>
                            </Link>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                              {post.content}
                            </p>
                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex items-center gap-1 text-green-600">
                                <Clock className="h-3 w-3" />
                                <span className="text-xs">{safeFormatTime(post.created_at)}</span>
                              </div>
                              <div className="flex items-center gap-1 text-blue-600">
                                <MessageSquare className="h-3 w-3" />
                                <span className="text-xs">{post.comments?.length || 0} 评论</span>
                              </div>
                            </div>
                          </div>
                          {post.image_url && (
                            <div className="ml-6">
                              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 group-hover:scale-105 transition-transform duration-300">
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
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg">
                <CardContent className="p-12 text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-green-800 dark:text-green-200">还没有发布帖子</h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">分享您的Minecraft经验和创意吧！</p>
                    <Button
                      asChild
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      <Link href="/posts/new">
                        <Plus className="h-4 w-4 mr-2" />
                        发布第一篇帖子
                      </Link>
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* 社区最新动态 */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="h-6 w-6 text-green-600" />
                <h2 className="text-2xl font-bold text-green-800 dark:text-green-200">社区最新动态</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950/20"
              >
                <Link href="/posts">查看更多</Link>
              </Button>
            </div>

            {recentPosts && recentPosts.length > 0 ? (
              <div className="space-y-4">
                {recentPosts.slice(0, 3).map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.5 }}
                  >
                    <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          >
                            <Avatar className="h-10 w-10 ring-2 ring-green-200 dark:ring-green-800">
                              <AvatarImage
                                src={post.profiles?.avatar_url || ""}
                                alt={post.profiles?.username || "用户"}
                              />
                              <AvatarFallback className="bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 dark:from-green-900 dark:to-emerald-900 dark:text-green-300">
                                {(post.profiles?.username || "U").charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </motion.div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-green-700 dark:text-green-300">
                                {post.profiles?.username}
                              </span>
                              <span className="text-xs text-muted-foreground">{safeFormatTime(post.created_at)}</span>
                            </div>
                            <Link href={`/posts/${post.id}`}>
                              <h3 className="font-semibold hover:text-green-600 dark:hover:text-green-400 transition-colors group-hover:translate-x-1 duration-300">
                                {post.title}
                              </h3>
                            </Link>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                              {post.content}
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                              <div className="flex items-center gap-1 text-blue-600">
                                <MessageSquare className="h-3 w-3" />
                                <span className="text-xs">{post.comments?.length || 0} 评论</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg">
                <CardContent className="p-12 text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-green-800 dark:text-green-200">暂无最新动态</h3>
                    <p className="text-muted-foreground leading-relaxed">社区正在等待您的参与！</p>
                  </motion.div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
