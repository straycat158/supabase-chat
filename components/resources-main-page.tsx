"use client"

import { motion } from "framer-motion"
import { BookOpen, ArrowRight, Plus, Package, Palette, Lightbulb, Map, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { ResourceCategory } from "@/lib/types/database"

interface ResourcesMainPageProps {
  session: any
  categories: (ResourceCategory & { resourceCount: number })[]
}

const categoryIcons = {
  mods: Package,
  texturepacks: Palette,
  shaders: Lightbulb,
  maps: Map,
  others: MoreHorizontal,
}

const categoryColors = {
  mods: "from-blue-500 to-purple-600",
  texturepacks: "from-green-500 to-teal-600",
  shaders: "from-yellow-500 to-orange-600",
  maps: "from-red-500 to-pink-600",
  others: "from-gray-500 to-slate-600",
}

export function ResourcesMainPage({ session, categories }: ResourcesMainPageProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* 页面头部 */}
      <div className="relative overflow-hidden bg-white dark:bg-black border-b-4 border-black dark:border-white">
        {/* 几何背景 */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 border-4 border-black dark:border-white transform rotate-12 opacity-20"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-black dark:bg-white transform -translate-y-20 translate-x-20 opacity-10"></div>
          <div className="absolute bottom-0 left-1/3 w-12 h-12 bg-black dark:bg-white rounded-full opacity-20"></div>
          <div className="absolute bottom-10 right-20 w-16 h-16 border-4 border-black dark:border-white transform -rotate-45 opacity-15"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="text-center space-y-8">
            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} className="inline-block">
              <div className="w-20 h-20 bg-black dark:bg-white mx-auto mb-8 flex items-center justify-center transform rotate-3">
                <BookOpen className="h-10 w-10 text-white dark:text-black" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-7xl font-black tracking-tight text-black dark:text-white"
            >
              资源中心
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto font-medium leading-relaxed"
            >
              发现和分享优质的 Minecraft 资源
              <br />
              模组、材质包、光影、地图应有尽有
            </motion.p>

            {session && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center"
              >
                <Button asChild className="bw-button font-bold text-lg px-8 py-4">
                  <Link href="/resources/upload">
                    <Plus className="h-5 w-5 mr-2" />
                    发布资源
                  </Link>
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* 分类展示区域 */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {categories.map((category, index) => {
            const IconComponent = categoryIcons[category.slug as keyof typeof categoryIcons] || Package
            const gradientClass = categoryColors[category.slug as keyof typeof categoryColors] || categoryColors.others

            return (
              <motion.div
                key={category.id}
                className="group"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -8 }}
              >
                <div className="bw-card p-8 h-full bg-white dark:bg-black group-hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                  {/* 装饰性几何图案 */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-black dark:bg-white opacity-5 transform translate-x-12 -translate-y-12 rotate-45"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 border-4 border-black dark:border-white opacity-10 transform -translate-x-8 translate-y-8 rotate-12"></div>

                  <div className="relative z-10 space-y-6">
                    {/* 图标和标题 */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="w-16 h-16 bg-black dark:bg-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <IconComponent className="h-8 w-8 text-white dark:text-black" />
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-black text-black dark:text-white">{category.resourceCount}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 font-bold">资源</div>
                        </div>
                      </div>

                      <h3 className="text-3xl font-black text-black dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors">
                        {category.name}
                      </h3>
                    </div>

                    {/* 描述 */}
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg font-medium">
                      {category.description}
                    </p>

                    {/* 查看详情按钮 */}
                    <div className="pt-6 border-t-2 border-black dark:border-white">
                      <Button
                        asChild
                        className="w-full bw-button font-bold text-lg py-4 group-hover:scale-105 transition-transform duration-300"
                      >
                        <Link href={`/resources/${category.slug}`} className="flex items-center justify-center gap-2">
                          查看详情
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* 如果没有分类 */}
        {categories.length === 0 && (
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
              <h3 className="text-2xl font-black mb-4 text-black dark:text-white">暂无分类</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">系统正在初始化资源分类，请稍后再试</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
