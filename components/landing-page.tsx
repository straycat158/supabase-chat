"use client"
import { Button } from "@/components/ui/button"
import { PostCard } from "@/components/post-card"
import { Users, MessageSquare, FileText, ArrowRight, Square, Circle, Triangle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

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
    <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
      {/* 几何背景图案 */}
      <div className="absolute inset-0 geometric-pattern"></div>

      {/* Hero Section - 创新的黑白设计 */}
      <section className="relative py-32 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* 左侧内容 */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <motion.div
                  className="inline-flex items-center gap-3 px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-bold text-sm tracking-wider"
                  whileHover={{ scale: 1.05 }}
                >
                  <Square className="h-4 w-4" />
                  MINECRAFT FORUM
                </motion.div>

                <h1 className="text-6xl md:text-8xl font-black leading-none">
                  <span className="block text-black dark:text-white">BUILD</span>
                  <span className="block text-black dark:text-white">SHARE</span>
                  <span className="block bg-black dark:bg-white text-white dark:text-black px-4 py-2 inline-block transform -rotate-2">
                    EXPLORE
                  </span>
                </h1>

                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed">
                  加入全球最具创意的 Minecraft 社区，分享您的建筑杰作，探索无限可能。
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="bw-button text-lg px-8 py-6 font-bold tracking-wide">
                  <Link href="/signup">
                    立即加入
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="text-lg px-8 py-6 font-bold tracking-wide border-2 border-black dark:border-white"
                >
                  <Link href="/posts">浏览内容</Link>
                </Button>
              </div>
            </motion.div>

            {/* 右侧几何图形 */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative h-96 lg:h-[500px]"
            >
              <motion.div
                className="absolute top-0 right-0 w-32 h-32 bg-black dark:bg-white"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />
              <motion.div
                className="absolute top-20 left-10 w-24 h-24 border-4 border-black dark:border-white"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />
              <motion.div
                className="absolute bottom-20 right-20 w-20 h-20 bg-black dark:bg-white transform rotate-45"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute bottom-0 left-0 w-40 h-40 border-8 border-black dark:border-white rounded-full"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section - 极简设计 */}
      <section className="py-24 px-4 bg-black dark:bg-white text-white dark:text-black">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            {[
              { icon: Users, value: stats.users, label: "活跃用户", shape: Square },
              { icon: MessageSquare, value: stats.posts, label: "精彩帖子", shape: Circle },
              { icon: FileText, value: stats.comments, label: "热烈讨论", shape: Triangle },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="relative mb-6">
                  <motion.div
                    className="w-20 h-20 mx-auto bg-white dark:bg-black flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <stat.icon className="h-10 w-10 text-black dark:text-white" />
                  </motion.div>
                  <motion.div
                    className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-black"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <stat.shape className="h-6 w-6 text-black dark:text-white" />
                  </motion.div>
                </div>
                <div className="text-4xl font-black mb-2">{stat.value}</div>
                <p className="text-lg font-medium tracking-wide">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - 卡片网格 */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-black mb-6 text-black dark:text-white">为什么选择我们？</h2>
            <div className="w-24 h-1 bg-black dark:bg-white mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "快速分享",
                description: "轻松发布你的建筑作品、游戏心得和创意想法",
                pattern: "geometric",
              },
              {
                title: "安全可靠",
                description: "严格的内容审核机制，确保社区环境健康友好",
                pattern: "stripe",
              },
              {
                title: "活跃社区",
                description: "与来自世界各地的 Minecraft 爱好者互动交流",
                pattern: "dots",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bw-card p-8 relative overflow-hidden group"
              >
                <div className="absolute inset-0 stripe-pattern group-hover:opacity-20 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-black dark:bg-white mb-6 flex items-center justify-center">
                    <div className="w-6 h-6 bg-white dark:bg-black"></div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-black dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="py-24 px-4 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-black mb-4 text-black dark:text-white">最新帖子</h2>
              <div className="w-16 h-1 bg-black dark:bg-white"></div>
            </div>
            <Button variant="outline" asChild className="border-2 border-black dark:border-white font-bold">
              <Link href="/posts">
                查看更多
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestPosts && latestPosts.length > 0 ? (
              latestPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <PostCard post={post} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-black dark:bg-white flex items-center justify-center">
                  <MessageSquare className="h-12 w-12 text-white dark:text-black" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-black dark:text-white">暂无帖子</h3>
                <p className="text-gray-600 dark:text-gray-400">成为第一个发布帖子的用户吧！</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 bg-black dark:bg-white text-white dark:text-black relative overflow-hidden">
        <div className="absolute inset-0 stripe-pattern"></div>
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-6xl font-black mb-8">准备好了吗？</h2>
            <p className="text-2xl mb-12 font-medium">立即加入我们的创意社区</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                size="lg"
                asChild
                className="bg-white dark:bg-black text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 text-xl px-12 py-8 font-bold"
              >
                <Link href="/signup">
                  免费注册
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-2 border-white dark:border-black text-xl px-12 py-8 font-bold"
              >
                <Link href="/login">已有账号？登录</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
