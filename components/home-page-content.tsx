"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PostCard } from "@/components/post-card"
import { Users, MessageSquare, MessagesSquare, Hammer, Sword, Gem, Shield, Blocks } from "lucide-react"
import { AnnouncementsDisplay } from "@/components/announcements-display"

interface HomePageContentProps {
  session: any
  latestPosts: any[]
  stats: {
    users: number
    posts: number
    comments: number
  }
}

const features = [
  {
    icon: <Hammer className="h-10 w-10 text-primary" />,
    title: "分享建筑作品",
    description: "展示您的创意建筑，获取社区反馈和赞赏。",
  },
  {
    icon: <Sword className="h-10 w-10 text-primary" />,
    title: "讨论游戏策略",
    description: "分享您的生存技巧、PVP战术和游戏心得。",
  },
  {
    icon: <Blocks className="h-10 w-10 text-primary" />,
    title: "红石教程",
    description: "学习和分享复杂的红石机械设计和自动化系统。",
  },
  {
    icon: <Gem className="h-10 w-10 text-primary" />,
    title: "资源分享",
    description: "分享和发现优质的材质包、模组和地图种子。",
  },
  {
    icon: <Shield className="h-10 w-10 text-primary" />,
    title: "服务器推荐",
    description: "寻找优质服务器，结交志同道合的玩家。",
  },
  {
    icon: <MessagesSquare className="h-10 w-10 text-primary" />,
    title: "社区互动",
    description: "参与讨论，提问解答，成为活跃的社区成员。",
  },
]

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

export function HomePageContent({ session, latestPosts, stats }: HomePageContentProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="space-y-16 pb-16">
      {/* 公告显示 */}
      <section className="container mx-auto mt-6">
        <AnnouncementsDisplay />
      </section>

      {/* 英雄区域 */}
      <section className="relative overflow-hidden rounded-3xl hero-gradient">
        <div className="relative z-10 px-6 py-16 sm:px-8 sm:py-24 lg:py-32 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              欢迎来到 Minecraft 论坛
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-white/90">
              在这里分享您的 Minecraft 建筑、红石设计、生存技巧和游戏体验。加入我们的社区，与其他玩家交流互动！
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              {session ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button asChild size="lg" className="bg-white text-green-800 hover:bg-white/90 shadow-lg">
                    <Link href="/posts/new">发布帖子</Link>
                  </Button>
                </motion.div>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button asChild size="lg" className="bg-white text-green-800 hover:bg-white/90 shadow-lg">
                    <Link href="/signup">立即加入</Link>
                  </Button>
                </motion.div>
              )}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 backdrop-blur-sm"
                >
                  <Link href="/posts">浏览帖子</Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* 装饰元素 */}
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </section>

      {/* 社区统计 */}
      <section className="container mx-auto">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <motion.div variants={item}>
            <Card className="text-center h-full card-hover border-none shadow-md">
              <CardHeader>
                <div className="mx-auto rounded-full bg-primary/10 p-3 w-fit">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-4xl font-bold mt-4">{stats.users}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg">活跃用户</CardDescription>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="text-center h-full card-hover border-none shadow-md">
              <CardHeader>
                <div className="mx-auto rounded-full bg-primary/10 p-3 w-fit">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-4xl font-bold mt-4">{stats.posts}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg">精彩帖子</CardDescription>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="text-center h-full card-hover border-none shadow-md">
              <CardHeader>
                <div className="mx-auto rounded-full bg-primary/10 p-3 w-fit">
                  <MessagesSquare className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-4xl font-bold mt-4">{stats.comments}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg">热烈评论</CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* 论坛特色 */}
      <section className="container mx-auto section-padding">
        <div className="text-center mb-12">
          <motion.h2
            className="text-3xl font-bold"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            论坛特色
          </motion.h2>
          <motion.p
            className="text-muted-foreground mt-4 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            我们为 Minecraft 玩家提供了丰富的交流平台和功能
          </motion.p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={item}>
              <Card className="h-full card-hover border-none shadow-md">
                <CardHeader>
                  <div className="mb-2">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 最新帖子 */}
      <section className="container mx-auto section-padding">
        <div className="flex justify-between items-center mb-8">
          <motion.h2
            className="text-3xl font-bold"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            最新帖子
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button asChild className="shadow-sm relative overflow-hidden group">
              <Link href="/posts" className="relative z-10">
                <span className="relative z-10">查看全部</span>
                <motion.div
                  className="absolute inset-0 bg-primary/20"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "0%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </Link>
            </Button>
          </motion.div>
        </div>

        {latestPosts && latestPosts.length > 0 ? (
          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {latestPosts.map((post) => (
              <motion.div key={post.id} variants={item}>
                <PostCard post={post} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Card className="border-none shadow-md">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">还没有帖子，成为第一个发帖的用户吧！</p>
              {session && (
                <Button asChild className="mt-4 shadow-sm">
                  <Link href="/posts/new">发布帖子</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </section>

      {/* 加入社区 */}
      <section className="container mx-auto">
        <Card className="bg-primary/5 border-none shadow-md overflow-hidden">
          <CardContent className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold mb-4">加入我们的社区</h2>
                <p className="text-muted-foreground mb-6">
                  无论您是 Minecraft
                  新手还是资深玩家，我们的社区都欢迎您的加入。分享您的创意，结交新朋友，一起探索无限可能的方块世界！
                </p>
                {!session && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button asChild size="lg" className="shadow-lg">
                      <Link href="/signup">立即注册</Link>
                    </Button>
                  </motion.div>
                )}
              </motion.div>
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative w-64 h-64">
                  <Image
                    src="/placeholder.svg?height=256&width=256"
                    alt="Minecraft 社区"
                    fill
                    className="object-cover rounded-lg shadow-xl"
                  />
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
