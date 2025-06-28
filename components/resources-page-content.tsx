"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BookOpen, Download, Calendar, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import Link from "next/link"
import Image from "next/image"
import type { ResourceCategory } from "@/lib/types/database"

interface ResourcesPageContentProps {
  session: any
  categories: ResourceCategory[]
  resources: any[]
}

export function ResourcesPageContent({ session, categories, resources }: ResourcesPageContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const filteredResources =
    selectedCategory === "all" ? resources : resources.filter((resource) => resource.category_id === selectedCategory)

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* 页面头部 */}
      <div className="relative overflow-hidden bg-white dark:bg-black border-b-4 border-black dark:border-white">
        {/* 几何背景 */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 border-4 border-black dark:border-white transform rotate-12 opacity-20"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-black dark:bg-white transform -translate-y-20 translate-x-20 opacity-10"></div>
          <div className="absolute bottom-0 left-1/3 w-12 h-12 bg-black dark:bg-white rounded-full opacity-20"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className="text-center space-y-6">
            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} className="inline-block">
              <div className="w-16 h-16 bg-black dark:bg-white mx-auto mb-6 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-white dark:text-black" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl font-black tracking-tight text-black dark:text-white"
            >
              资源中心
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium"
            >
              发现和分享优质的 Minecraft 资源，模组、材质包、光影、地图应有尽有
            </motion.p>

            {session && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center"
              >
                <Button asChild className="bw-button font-bold">
                  <Link href="/resources/upload">
                    <Plus className="h-4 w-4 mr-2" />
                    发布资源
                  </Link>
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* 分类筛选区域 */}
      <div className="bg-gray-50 dark:bg-gray-950 border-b-2 border-black dark:border-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-3 items-center justify-center">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className={
                selectedCategory === "all"
                  ? "bw-button font-bold"
                  : "border-2 border-black dark:border-white font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
              }
            >
              全部资源
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={
                  selectedCategory === category.id
                    ? "bw-button font-bold"
                    : "border-2 border-black dark:border-white font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                }
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* 资源展示区域 */}
      <div className="container mx-auto px-4 py-12">
        {filteredResources.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {filteredResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                className="bw-card p-6 group hover:scale-105 transition-transform cursor-pointer bg-white dark:bg-black"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5 }}
              >
                <div className="space-y-4">
                  {/* 封面图片 */}
                  {resource.cover_images && resource.cover_images.length > 0 && (
                    <div className="relative aspect-video w-full overflow-hidden border-2 border-black dark:border-white">
                      <Image
                        src={resource.cover_images[0] || "/placeholder.svg"}
                        alt={resource.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {resource.cover_images.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black dark:bg-white text-white dark:text-black px-2 py-1 text-xs font-bold">
                          +{resource.cover_images.length - 1}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 分类标签 */}
                  <div className="flex items-center justify-between">
                    <span className="bg-black dark:bg-white text-white dark:text-black px-3 py-1 text-sm font-bold">
                      {resource.resource_categories?.name}
                    </span>
                  </div>

                  {/* 标题和描述 */}
                  <div>
                    <h3 className="text-xl font-black text-black dark:text-white mb-2 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors line-clamp-2">
                      {resource.title}
                    </h3>
                    {resource.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3">
                        {resource.description}
                      </p>
                    )}
                  </div>

                  {/* 用户信息和时间 */}
                  <div className="flex items-center gap-3 pt-2">
                    <Avatar className="h-8 w-8 border-2 border-black dark:border-white">
                      <AvatarImage
                        src={resource.profiles?.avatar_url || ""}
                        alt={resource.profiles?.username || "用户"}
                      />
                      <AvatarFallback className="text-xs bg-black dark:bg-white text-white dark:text-black font-bold">
                        {(resource.profiles?.username || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1">
                      <span className="text-xs font-bold text-black dark:text-white">
                        {resource.profiles?.username}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(resource.created_at), {
                          addSuffix: true,
                          locale: zhCN,
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 下载按钮 */}
                  <div className="pt-4 border-t-2 border-black dark:border-white">
                    <Button asChild className="w-full bw-button font-bold text-sm">
                      <a
                        href={resource.download_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        下载资源
                      </a>
                    </Button>
                  </div>
                </div>
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
                <BookOpen className="h-12 w-12 text-white dark:text-black" />
              </div>
              <h3 className="text-2xl font-black mb-4 text-black dark:text-white">暂无资源</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                {selectedCategory === "all" ? "还没有任何资源" : "该分类下暂时没有资源"}
              </p>
              {session && (
                <Button asChild className="bw-button font-bold">
                  <Link href="/resources/upload">
                    <Plus className="h-4 w-4 mr-2" />
                    成为第一个发布者
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
