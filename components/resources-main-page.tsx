"use client"

import { motion } from "framer-motion"
import { Package, Palette, Lightbulb, Map, MoreHorizontal, ArrowRight, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { ResourceCategory } from "@/lib/types/database"

interface CategoryWithCount extends ResourceCategory {
  resourceCount: number
}

interface ResourcesMainPageProps {
  categories: CategoryWithCount[]
}

const categoryIcons = {
  mods: Package,
  texturepacks: Palette,
  shaders: Lightbulb,
  maps: Map,
  others: MoreHorizontal,
}

const categoryColors = {
  mods: "bg-blue-500",
  texturepacks: "bg-green-500",
  shaders: "bg-yellow-500",
  maps: "bg-purple-500",
  others: "bg-gray-500",
}

export function ResourcesMainPage({ categories }: ResourcesMainPageProps) {
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
                <Package className="h-10 w-10 text-white dark:text-black" />
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
              className="text-xl text-gray-600 dark:text-gray-400 font-medium max-w-2xl mx-auto"
            >
              发现和分享优质的Minecraft资源，包括模组、材质包、光影包、地图等
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Link href="/resources/upload">
                <Button className="bw-button font-bold text-lg px-8 py-4">
                  <Upload className="h-5 w-5 mr-2" />
                  发布资源
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* 分类网格 */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-black text-black dark:text-white mb-4">浏览分类</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">选择你感兴趣的资源类型</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => {
              const IconComponent = categoryIcons[category.slug as keyof typeof categoryIcons] || Package
              const colorClass = categoryColors[category.slug as keyof typeof categoryColors] || "bg-gray-500"

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="bw-card h-full hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] transition-all duration-200 group cursor-pointer">
                    <Link href={`/resources/${category.slug}`}>
                      <CardHeader className="text-center space-y-4">
                        <div
                          className={`w-16 h-16 ${colorClass} mx-auto flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-200`}
                        >
                          <IconComponent className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-black text-black dark:text-white mb-2">
                            {category.name}
                          </CardTitle>
                          <CardDescription className="text-gray-600 dark:text-gray-400">
                            {category.description}
                          </CardDescription>
                        </div>
                      </CardHeader>

                      <CardContent className="text-center space-y-4">
                        <Badge
                          variant="outline"
                          className="border-2 border-black dark:border-white font-bold text-lg px-4 py-2"
                        >
                          {category.resourceCount} 个资源
                        </Badge>

                        <Button
                          variant="outline"
                          className="w-full border-2 border-black dark:border-white font-bold bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors duration-200"
                        >
                          查看详情
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                        </Button>
                      </CardContent>
                    </Link>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
