"use client"

import { motion } from "framer-motion"
import {
  ArrowLeft,
  Download,
  User,
  Calendar,
  Plus,
  Package,
  Palette,
  Lightbulb,
  Map,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import type { ResourceCategory, Resource } from "@/lib/types/database"

interface ResourceCategoryPageProps {
  session: any
  category: ResourceCategory
  resources: (Resource & { user: { username: string; avatar_url: string | null } })[]
}

const categoryIcons = {
  mods: Package,
  texturepacks: Palette,
  shaders: Lightbulb,
  maps: Map,
  others: MoreHorizontal,
}

export function ResourceCategoryPage({ session, category, resources }: ResourceCategoryPageProps) {
  const IconComponent = categoryIcons[category.slug as keyof typeof categoryIcons] || Package

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* 页面头部 */}
      <div className="relative overflow-hidden bg-white dark:bg-black border-b-4 border-black dark:border-white">
        {/* 几何背景 */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-16 h-16 border-4 border-black dark:border-white transform -rotate-12 opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black dark:bg-white transform -translate-x-16 translate-y-16 opacity-10"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* 返回按钮 */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
              <Link href="/resources">
                <Button
                  variant="outline"
                  className="border-2 border-black dark:border-white font-bold bg-white dark:bg-black text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  返回资源中心
                </Button>
              </Link>
            </motion.div>

            <div className="text-center space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-block"
              >
                <div className="w-20 h-20 bg-black dark:bg-white mx-auto mb-6 flex items-center justify-center">
                  <IconComponent className="h-10 w-10 text-white dark:text-black" />
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl font-black tracking-tight text-black dark:text-white"
              >
                {category.name}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium"
              >
                {category.description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center gap-4"
              >
                <div className="text-center">
                  <div className="text-3xl font-black text-black dark:text-white">{resources.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-bold">个资源</div>
                </div>
                {session && (
                  <Link href={`/resources/upload?category=${category.slug}`}>
                    <Button className="bw-button font-bold">
                      <Plus className="h-4 w-4 mr-2" />
                      发布{category.name}
                    </Button>
                  </Link>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* 资源列表 */}
      <div className="container mx-auto px-4 py-12">
        {resources.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {resources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -4 }}
              >
                <Card className="bw-card h-full bg-white dark:bg-black group hover:shadow-xl transition-all duration-300">
                  {/* 封面图片 */}
                  {resource.cover_images && resource.cover_images.length > 0 && (
                    <div className="aspect-video border-b-2 border-black dark:border-white overflow-hidden">
                      <Image
                        src={resource.cover_images[0] || "/placeholder.svg"}
                        alt={resource.title}
                        width={400}
                        height={225}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = "none"
                        }}
                      />
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-black text-black dark:text-white line-clamp-2">
                      {resource.title}
                    </CardTitle>
                    {resource.description && (
                      <CardDescription className="text-gray-600 dark:text-gray-400 line-clamp-3">
                        {resource.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* 用户信息 */}
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-black dark:bg-white flex items-center justify-center">
                        <User className="h-4 w-4 text-white dark:text-black" />
                      </div>
                      <span className="font-bold text-black dark:text-white">{resource.user.username}</span>
                    </div>

                    {/* 发布时间 */}
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(resource.created_at)}</span>
                    </div>

                    {/* 下载按钮 */}
                    <div className="pt-4 border-t-2 border-black dark:border-white">
                      <Button asChild className="w-full bw-button font-bold">
                        <a href={resource.download_link} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          立即下载
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bw-card p-16 max-w-md mx-auto bg-white dark:bg-black">
              <div className="w-24 h-24 mx-auto mb-8 bg-black dark:bg-white flex items-center justify-center">
                <IconComponent className="h-12 w-12 text-white dark:text-black" />
              </div>
              <h3 className="text-2xl font-black mb-4 text-black dark:text-white">暂无{category.name}资源</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                还没有人发布{category.name}资源，成为第一个分享者吧！
              </p>
              {session && (
                <Link href={`/resources/upload?category=${category.slug}`}>
                  <Button className="bw-button font-bold">
                    <Plus className="h-4 w-4 mr-2" />
                    发布{category.name}
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
