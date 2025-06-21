"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Tag {
  id: string
  name: string
}

const tags: Tag[] = [
  { id: "buildings", name: "建筑" },
  { id: "mods", name: "模组" },
  { id: "texturepacks", name: "材质包" },
  { id: "tools", name: "工具" },
]

const ResourcesPageContent = () => {
  const [selectedTag, setSelectedTag] = useState<string>("all")

  return (
    <div>
      {/* 更新页面头部为黑白几何风格： */}
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
              发现和分享优质的 Minecraft 资源，建筑、模组、材质包应有尽有
            </motion.p>
          </div>
        </div>
      </div>

      {/* 更新筛选区域样式： */}
      <div className="bg-gray-50 dark:bg-gray-950 border-b-2 border-black dark:border-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-3 items-center justify-center">
            <Button
              variant={selectedTag === "all" ? "default" : "outline"}
              onClick={() => setSelectedTag("all")}
              className={
                selectedTag === "all" ? "bw-button font-bold" : "border-2 border-black dark:border-white font-bold"
              }
            >
              全部资源
            </Button>
            {tags.map((tag) => (
              <Button
                key={tag.id}
                variant={selectedTag === tag.id ? "default" : "outline"}
                onClick={() => setSelectedTag(tag.id)}
                className={
                  selectedTag === tag.id ? "bw-button font-bold" : "border-2 border-black dark:border-white font-bold"
                }
              >
                {tag.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* 内容展示区域 */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* 示例资源卡片 */}
          {[
            {
              id: 1,
              title: "现代城市建筑包",
              description: "包含各种现代建筑设计，适合城市建设项目",
              category: "建筑",
              downloads: 1234,
              rating: 4.8,
            },
            {
              id: 2,
              title: "工业模组合集",
              description: "增加各种工业机械和自动化设备",
              category: "模组",
              downloads: 856,
              rating: 4.6,
            },
            {
              id: 3,
              title: "高清材质包",
              description: "提升游戏画质的高分辨率材质包",
              category: "材质包",
              downloads: 2341,
              rating: 4.9,
            },
            {
              id: 4,
              title: "建筑工具箱",
              description: "快速建造和编辑的实用工具集合",
              category: "工具",
              downloads: 567,
              rating: 4.5,
            },
            {
              id: 5,
              title: "中世纪城堡",
              description: "精美的中世纪风格城堡建筑",
              category: "建筑",
              downloads: 789,
              rating: 4.7,
            },
            {
              id: 6,
              title: "魔法模组",
              description: "添加魔法系统和法术的模组",
              category: "模组",
              downloads: 1456,
              rating: 4.8,
            },
          ]
            .filter((item) => selectedTag === "all" || item.category === tags.find((t) => t.id === selectedTag)?.name)
            .map((item, index) => (
              <motion.div
                key={item.id}
                className="bw-card p-6 group hover:scale-105 transition-transform cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5 }}
              >
                <div className="space-y-4">
                  {/* 类别标签 */}
                  <div className="flex items-center justify-between">
                    <span className="bg-black dark:bg-white text-white dark:text-black px-3 py-1 text-sm font-bold">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm font-bold">{item.rating}</span>
                    </div>
                  </div>

                  {/* 标题和描述 */}
                  <div>
                    <h3 className="text-xl font-black text-black dark:text-white mb-2 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{item.description}</p>
                  </div>

                  {/* 下载数和操作 */}
                  <div className="flex items-center justify-between pt-4 border-t-2 border-black dark:border-white">
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                      {item.downloads.toLocaleString()} 下载
                    </span>
                    <Button size="sm" className="bw-button font-bold text-xs px-4">
                      查看详情
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
        </motion.div>

        {/* 如果没有匹配的资源 */}
        {[
          {
            id: 1,
            title: "现代城市建筑包",
            description: "包含各种现代建筑设计，适合城市建设项目",
            category: "建筑",
            downloads: 1234,
            rating: 4.8,
          },
          {
            id: 2,
            title: "工业模组合集",
            description: "增加各种工业机械和自动化设备",
            category: "模组",
            downloads: 856,
            rating: 4.6,
          },
          {
            id: 3,
            title: "高清材质包",
            description: "提升游戏画质的高分辨率材质包",
            category: "材质包",
            downloads: 2341,
            rating: 4.9,
          },
          {
            id: 4,
            title: "建筑工具箱",
            description: "快速建造和编辑的实用工具集合",
            category: "工具",
            downloads: 567,
            rating: 4.5,
          },
          {
            id: 5,
            title: "中世纪城堡",
            description: "精美的中世纪风格城堡建筑",
            category: "建筑",
            downloads: 789,
            rating: 4.7,
          },
          {
            id: 6,
            title: "魔法模组",
            description: "添加魔法系统和法术的模组",
            category: "模组",
            downloads: 1456,
            rating: 4.8,
          },
        ].filter((item) => selectedTag === "all" || item.category === tags.find((t) => t.id === selectedTag)?.name)
          .length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bw-card p-16 max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-8 bg-black dark:bg-white flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-white dark:text-black" />
              </div>
              <h3 className="text-2xl font-black mb-4 text-black dark:text-white">暂无资源</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">该分类下暂时没有资源，请尝试其他分类</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default ResourcesPageContent
export { ResourcesPageContent }
