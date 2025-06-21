"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import {
  MessageSquare,
  Users,
  Plus,
  Clock,
  Calendar,
  Activity,
  Edit3,
  ArrowLeft,
  Trophy,
  Target,
  Square,
  Circle,
  Triangle,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { DashboardClock } from "@/components/dashboard-clock"

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
  const [avatarError, setAvatarError] = useState(false)
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

          const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

          if (profile) {
            setUserProfile(profile)
            setAvatarError(false)
          }

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
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-black dark:border-white animate-spin"></div>
            <div className="absolute inset-2 bg-black dark:bg-white"></div>
          </div>
          <p className="text-black dark:text-white font-bold text-xl">加载仪表盘...</p>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="bw-card p-12 text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-8 bg-black dark:bg-white flex items-center justify-center">
            <Users className="h-10 w-10 text-white dark:text-black" />
          </div>
          <h3 className="text-2xl font-black mb-4 text-black dark:text-white">需要登录</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8">请先登录以查看仪表盘</p>
          <Button asChild className="bw-button font-bold">
            <Link href="/login">立即登录</Link>
          </Button>
        </div>
      </div>
    )
  }

  const displayName = userProfile?.username || user?.user_metadata?.username || user?.email?.split("@")[0] || "用户"

  const getAvatarUrl = () => {
    if (userProfile?.avatar_url && !avatarError) {
      return userProfile.avatar_url
    }
    if (user?.user_metadata?.avatar_url && !avatarError) {
      return user.user_metadata.avatar_url
    }
    return null
  }

  const avatarUrl = getAvatarUrl()

  const handleAvatarError = () => {
    console.log("Avatar failed to load, using fallback")
    setAvatarError(true)
  }

  const getUserLevel = (posts: number, comments: number) => {
    const totalActivity = posts * 3 + comments
    if (totalActivity >= 100) return { level: "钻石玩家", icon: "💎", shape: Square }
    if (totalActivity >= 50) return { level: "黄金玩家", icon: "🏆", shape: Circle }
    if (totalActivity >= 20) return { level: "白银玩家", icon: "🥈", shape: Triangle }
    if (totalActivity >= 5) return { level: "青铜玩家", icon: "🥉", shape: Square }
    return { level: "新手玩家", icon: "🌱", shape: Circle }
  }

  const userLevel = getUserLevel(userStats.totalPosts, userStats.totalComments)

  const quickActions = [
    {
      title: "发布帖子",
      description: "分享您的想法和经验",
      icon: <Plus className="h-8 w-8" />,
      href: "/posts/new",
      shape: Square,
    },
    {
      title: "浏览帖子",
      description: "查看社区最新内容",
      icon: <MessageSquare className="h-8 w-8" />,
      href: "/posts",
      shape: Circle,
    },
    {
      title: "资源中心",
      description: "探索各类Minecraft资源",
      icon: <Trophy className="h-8 w-8" />,
      href: "/resources",
      shape: Triangle,
    },
    {
      title: "个人资料",
      description: "管理您的账户信息",
      icon: <Edit3 className="h-8 w-8" />,
      href: "/profile",
      shape: Square,
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
      {/* 几何背景 */}
      <div className="absolute inset-0 geometric-pattern"></div>

      <div className="relative z-10 container mx-auto px-4 py-8 space-y-12">
        {/* 返回按钮 */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 border-2 border-black dark:border-white font-bold"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
        </motion.div>

        {/* 用户信息卡片 */}
        <motion.div
          className="bw-card p-12 relative overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* 几何装饰 */}
          <div className="absolute top-8 right-8">
            <motion.div
              className="w-8 h-8 bg-black dark:bg-white"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
          </div>
          <div className="absolute bottom-8 left-8">
            <motion.div
              className="w-6 h-6 border-2 border-black dark:border-white"
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* 用户头像 */}
            <motion.div
              className="flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="relative">
                <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-black dark:border-white">
                  {avatarUrl && !avatarError ? (
                    <AvatarImage
                      src={avatarUrl || "/placeholder.svg"}
                      alt={displayName}
                      className="object-cover grayscale"
                      onError={handleAvatarError}
                    />
                  ) : null}
                  <AvatarFallback className="text-4xl md:text-6xl bg-black dark:bg-white text-white dark:text-black font-black">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* 等级徽章 */}
                <div className="absolute -bottom-2 -right-2">
                  <div className="bg-black dark:bg-white text-white dark:text-black px-3 py-1 font-bold text-xs flex items-center gap-1">
                    <userLevel.shape className="h-3 w-3" />
                    {userLevel.level}
                  </div>
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
                <h1 className="text-4xl md:text-6xl font-black mb-4 text-black dark:text-white break-words">
                  欢迎回来
                </h1>
                <h2 className="text-2xl md:text-4xl font-bold mb-6 text-gray-600 dark:text-gray-400 break-words">
                  {displayName}
                </h2>
                <p className="text-lg md:text-xl mb-8 text-gray-600 dark:text-gray-400 leading-relaxed">
                  今天是探索Minecraft世界的好日子，看看您的最新动态吧！
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <motion.div
                    className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 font-bold text-sm"
                    whileHover={{ scale: 1.05 }}
                  >
                    加入时间：{safeFormatJoinTime(userStats.joinedDate)}前
                  </motion.div>
                  <motion.div
                    className="border-2 border-black dark:border-white px-4 py-2 font-bold text-sm break-all"
                    whileHover={{ scale: 1.05 }}
                  >
                    {user.email}
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* 操作按钮 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Button asChild className="bw-button font-bold">
                <Link href="/profile">
                  <Edit3 className="h-4 w-4 mr-2" />
                  编辑资料
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* 时钟模块 */}
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
          {[
            { title: "我的帖子", value: userStats.totalPosts, icon: MessageSquare, shape: Square },
            { title: "我的评论", value: userStats.totalComments, icon: Activity, shape: Circle },
            { title: "社区成员", value: stats.users, icon: Users, shape: Triangle },
            {
              title: "加入时间",
              value: safeFormatJoinTime(userStats.joinedDate),
              icon: Calendar,
              shape: Square,
              isText: true,
            },
          ].map((stat, index) => (
            <motion.div key={stat.title} variants={item}>
              <div className="bw-card p-6 group hover:scale-105 transition-transform">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-black dark:text-white tracking-wide">{stat.title}</h3>
                  <div className="w-8 h-8 bg-black dark:bg-white flex items-center justify-center group-hover:rotate-12 transition-transform">
                    <stat.icon className="h-4 w-4 text-white dark:text-black" />
                  </div>
                </div>
                <div
                  className={`${stat.isText ? "text-lg" : "text-3xl"} font-black text-black dark:text-white break-words`}
                >
                  {stat.isText ? `${stat.value}前` : stat.value}
                </div>
                <div className="mt-2">
                  <stat.shape className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* 快速操作 */}
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <Square className="h-8 w-8 text-black dark:text-white" />
            <h2 className="text-3xl font-black text-black dark:text-white">快速操作</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                variants={item}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Link href={action.href}>
                  <div className="bw-card p-8 cursor-pointer group overflow-hidden relative">
                    <div className="absolute top-4 right-4">
                      <action.shape className="h-4 w-4 text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
                    </div>
                    <div className="space-y-4">
                      <motion.div
                        className="w-16 h-16 bg-black dark:bg-white flex items-center justify-center"
                        whileHover={{ rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      >
                        <div className="text-white dark:text-black">{action.icon}</div>
                      </motion.div>
                      <div>
                        <h3 className="font-black text-xl text-black dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors break-words">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed break-words mt-2">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* 我的最新帖子 */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Trophy className="h-8 w-8 text-black dark:text-white" />
                <h2 className="text-3xl font-black text-black dark:text-white">我的最新帖子</h2>
              </div>
              <Button variant="outline" size="sm" asChild className="border-2 border-black dark:border-white font-bold">
                <Link href="/posts">查看全部</Link>
              </Button>
            </div>

            {userPosts && userPosts.length > 0 ? (
              <div className="space-y-6">
                {userPosts.slice(0, 3).map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.5 }}
                  >
                    <div className="bw-card p-6 group hover:scale-102 transition-transform">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0 pr-4">
                          <Link href={`/posts/${post.id}`}>
                            <h3 className="font-black text-lg hover:text-gray-600 dark:hover:text-gray-400 transition-colors group-hover:translate-x-1 duration-300 break-words line-clamp-2 mb-3">
                              {post.title}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed break-words whitespace-pre-wrap mb-4">
                            {post.content}
                          </p>
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-black dark:text-white">
                              <Clock className="h-4 w-4 flex-shrink-0" />
                              <span className="text-xs font-bold break-words">{safeFormatTime(post.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-black dark:text-white">
                              <MessageSquare className="h-4 w-4 flex-shrink-0" />
                              <span className="text-xs font-bold">{post.comments?.length || 0} 评论</span>
                            </div>
                          </div>
                        </div>
                        {post.image_url && (
                          <div className="flex-shrink-0">
                            <div className="w-20 h-20 border-2 border-black dark:border-white overflow-hidden bg-gray-100 dark:bg-gray-900 group-hover:scale-105 transition-transform duration-300">
                              <img
                                src={post.image_url || "/placeholder.svg"}
                                alt={post.title}
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bw-card p-16 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-24 h-24 mx-auto mb-8 bg-black dark:bg-white flex items-center justify-center">
                    <MessageSquare className="h-12 w-12 text-white dark:text-black" />
                  </div>
                  <h3 className="font-black text-2xl mb-4 text-black dark:text-white">还没有发布帖子</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                    分享您的Minecraft经验和创意吧！
                  </p>
                  <Button asChild className="bw-button font-bold">
                    <Link href="/posts/new">
                      <Plus className="h-4 w-4 mr-2" />
                      发布第一篇帖子
                    </Link>
                  </Button>
                </motion.div>
              </div>
            )}
          </motion.div>

          {/* 社区最新动态 */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Target className="h-8 w-8 text-black dark:text-white" />
                <h2 className="text-3xl font-black text-black dark:text-white">社区最新动态</h2>
              </div>
              <Button variant="outline" size="sm" asChild className="border-2 border-black dark:border-white font-bold">
                <Link href="/posts">查看更多</Link>
              </Button>
            </div>

            {recentPosts && recentPosts.length > 0 ? (
              <div className="space-y-6">
                {recentPosts.slice(0, 3).map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.5 }}
                  >
                    <div className="bw-card p-6 group hover:scale-102 transition-transform">
                      <div className="flex items-start space-x-4">
                        <motion.div
                          className="flex-shrink-0"
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        >
                          <Avatar className="h-12 w-12 border-2 border-black dark:border-white">
                            <AvatarImage
                              src={post.profiles?.avatar_url || ""}
                              alt={post.profiles?.username || "用户"}
                              className="grayscale"
                              onError={(e) => {
                                console.log("Community post avatar failed to load")
                              }}
                            />
                            <AvatarFallback className="bg-black dark:bg-white text-white dark:text-black font-bold">
                              {(post.profiles?.username || "U").charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="font-black text-black dark:text-white break-words">
                              {post.profiles?.username}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 break-words">
                              {safeFormatTime(post.created_at)}
                            </span>
                          </div>
                          <Link href={`/posts/${post.id}`}>
                            <h3 className="font-black hover:text-gray-600 dark:hover:text-gray-400 transition-colors group-hover:translate-x-1 duration-300 break-words line-clamp-2 mb-3">
                              {post.title}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed break-words whitespace-pre-wrap mb-4">
                            {post.content}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-black dark:text-white">
                              <MessageSquare className="h-4 w-4 flex-shrink-0" />
                              <span className="text-xs font-bold">{post.comments?.length || 0} 评论</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bw-card p-16 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-24 h-24 mx-auto mb-8 bg-black dark:bg-white flex items-center justify-center">
                    <Target className="h-12 w-12 text-white dark:text-black" />
                  </div>
                  <h3 className="font-black text-2xl mb-4 text-black dark:text-white">暂无最新动态</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">社区正在等待您的参与！</p>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
