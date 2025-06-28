"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Download, User, Calendar, Package, Palette, Lightbulb, Map, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import type { ResourceCategory } from "@/lib/types/database"

interface Resource {
  id: string
  title: string
  description: string | null
  download_link: string
  cover_images: string[] | null
  downloads: number
  created_at: string
  profiles: {
    id: string
    username: string | null
    avatar_url: string | null
  }
}

interface ResourceCategoryPageProps {
  category: ResourceCategory
  resources: Resource[]
}

const categoryIcons = {
  mods: Package,
  texturepacks: Palette,
  shaders: Lightbulb,
  maps: Map,
  others: MoreHorizontal,
}

export function ResourceCategoryPage({ category, resources }: ResourceCategoryPageProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const IconComponent = categoryIcons[category.slug as keyof typeof categoryIcons] || Package

  const filteredResources = resources.filter(
    (resource) =>
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (resource.description && resource.description.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* 页面头部 */}
      <div className="relative overflow-hidden bg-white dark:bg-black border-b-4 border-black dark:border-white">
        {/* 几何背景 */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-20 h-20 border-4 border-black dark:border-white transform rotate-12 opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black dark:bg-white transform -translate-x-12 translate-y-12 opacity-10"></div>
          <div className="absolute top-1/2 left-1/4 w-8 h-8 border-2 border-black dark:border-white transform -rotate-45 opacity-30"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} className="inline-block">
              <div className="w-20 h-20 bg-black dark:bg-white mx-auto mb-6 flex items-center justify-center transform rotate-3">
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
              className="text-xl text-gray-600 dark:text-gray-400 font-medium max-w-2xl mx-auto"
            >
              {category.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link href="/resources">
                <Button
                  variant="outline"
                  className="border-2 border-black dark:border-white font-bold bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  返回资源中心
                </Button>
              </Link>

              <Link href={`/resources/upload?category=${category.slug}`}>
                <Button className="bw-button font-bold">
                  <Package className="h-4 w-4 mr-2" />
                  发布{category.name}
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-md mx-auto"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder={`搜索${category.name}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 font-medium focus:outline-none focus:ring-0"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-black dark:bg-white transform rotate-45"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* 资源列表 */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* 统计信息 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge
                  variant="outline"
                  className="border-2 border-black dark:border-white font-bold text-lg px-4 py-2"
                >
                  共 {filteredResources.length} 个资源
                </Badge>
                {searchTerm && (
                  <Badge variant="secondary" className="font-medium">
                    搜索: "{searchTerm}"
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>

          {/* 资源网格 */}
          {filteredResources.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredResources.map((resource, index) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="bw-card h-full hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] transition-all duration-200 group">
                    <CardHeader className="p-0">
                      {resource.cover_images && resource.cover_images.length > 0 ? (
                        <div className="aspect-video relative overflow-hidden border-b-2 border-black dark:border-white">
                          <Image
                            src={resource.cover_images[0] || "/placeholder.svg"}
                            alt={resource.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-gray-100 dark:bg-gray-800 border-b-2 border-black dark:border-white flex items-center justify-center">
                          <IconComponent className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </CardHeader>

                    <CardContent className="p-6 space-y-4">
                      <div>
                        <CardTitle className="text-xl font-black text-black dark:text-white mb-2 line-clamp-2">
                          {resource.title}
                        </CardTitle>
                        {resource.description && (
                          <CardDescription className="text-gray-600 dark:text-gray-400 line-clamp-3">
                            {resource.description}
                          </CardDescription>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{resource.profiles.username || "匿名用户"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(resource.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t-2 border-black dark:border-white">
                        <div className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                          <Download className="h-4 w-4" />
                          <span>{resource.downloads} 下载</span>
                        </div>

                        <Button asChild className="bw-button font-bold">
                          <a href={resource.download_link} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
                            下载
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 border-2 border-black dark:border-white flex items-center justify-center">
                <IconComponent className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-black text-black dark:text-white mb-4">
                {searchTerm ? "没有找到相关资源" : `暂无${category.name}资源`}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {searchTerm ? "尝试使用其他关键词搜索" : `成为第一个分享${category.name}资源的用户吧！`}
              </p>
              <Link href={`/resources/upload?category=${category.slug}`}>
                <Button className="bw-button font-bold">
                  <Package className="h-4 w-4 mr-2" />
                  发布{category.name}
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
