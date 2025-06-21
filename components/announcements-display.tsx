"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { createClient } from "@/lib/supabase/client"
import { MegaphoneIcon, ChevronLeft, ChevronRight, AlertCircle, Clock, Star, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Announcement } from "@/lib/types/database"

export function AnnouncementsDisplay() {
  const supabase = createClient()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("announcements")
          .select("*")
          .lte("published_at", new Date().toISOString())
          .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
          .order("is_important", { ascending: false })
          .order("published_at", { ascending: false })

        if (error) {
          throw error
        }

        setAnnouncements(data || [])
      } catch (error) {
        console.error("获取公告失败:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnnouncements()
  }, [supabase])

  const nextAnnouncement = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length)
  }

  const prevAnnouncement = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + announcements.length) % announcements.length)
  }

  if (isLoading) {
    return (
      <div className="relative overflow-hidden mb-8 border-4 border-black dark:border-white bg-white dark:bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
        {/* 几何装饰 */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-4 right-4 w-8 h-8 border-2 border-black dark:border-white opacity-20 transform rotate-45"></div>
          <div className="absolute bottom-4 left-4 w-6 h-6 bg-black dark:bg-white opacity-10 rounded-full"></div>
        </div>

        <div className="relative z-10 p-6">
          <div className="flex items-center justify-center h-20">
            <div className="animate-pulse flex space-x-4 w-full">
              <div className="w-16 h-16 bg-black dark:bg-white opacity-20"></div>
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-black dark:bg-white opacity-20 w-3/4"></div>
                <div className="h-4 bg-black dark:bg-white opacity-20 w-5/6"></div>
                <div className="h-4 bg-black dark:bg-white opacity-20 w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (announcements.length === 0) {
    return null // 如果没有公告则不显示组件
  }

  const currentAnnouncement = announcements[currentIndex]
  const isImportant = currentAnnouncement.is_important

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden mb-8 border-4 border-black dark:border-white bg-white dark:bg-black ${
        isImportant
          ? "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]"
          : "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
      }`}
    >
      {/* 几何背景装饰 */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute top-4 right-4 w-8 h-8 border-2 border-black dark:border-white opacity-20 transform rotate-45"
          animate={{ rotate: [45, 90, 45] }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-4 left-4 w-6 h-6 bg-black dark:bg-white opacity-10 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 right-8 w-4 h-4 bg-black dark:bg-white opacity-10"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
        {isImportant && (
          <motion.div
            className="absolute top-0 left-0 w-full h-2 bg-black dark:bg-white"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
        )}
      </div>

      {/* 内容 */}
      <div className="relative z-10 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* 图标部分 */}
          <div className="flex-shrink-0">
            <motion.div
              className={`w-20 h-20 flex items-center justify-center ${
                isImportant
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "border-4 border-black dark:border-white text-black dark:text-white"
              }`}
              whileHover={{
                scale: 1.1,
                rotate: isImportant ? [0, -5, 5, 0] : 45,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {isImportant ? <AlertCircle className="h-10 w-10" /> : <MegaphoneIcon className="h-10 w-10" />}
            </motion.div>
          </div>

          {/* 内容部分 */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentAnnouncement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-3xl font-black text-black dark:text-white">{currentAnnouncement.title}</h3>
                    {isImportant && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="flex items-center gap-1"
                      >
                        <div className="bg-black dark:bg-white text-white dark:text-black px-3 py-1 text-sm font-bold flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          重要公告
                        </div>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        >
                          <Sparkles className="h-5 w-5 text-black dark:text-white" />
                        </motion.div>
                      </motion.div>
                    )}
                  </div>
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-300 line-clamp-4 mb-4 leading-relaxed">
                    {currentAnnouncement.content}
                  </p>
                  <div className="flex items-center text-sm font-bold text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4 mr-2" />
                    发布时间：
                    {format(new Date(currentAnnouncement.published_at), "yyyy年MM月dd日 HH:mm", { locale: zhCN })}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 导航按钮 */}
          {announcements.length > 1 && (
            <div className="flex flex-col items-center space-y-4 lg:space-y-6">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevAnnouncement}
                  className="border-4 border-black dark:border-white font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black w-12 h-12 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              </motion.div>

              <div className="text-center">
                <div className="text-lg font-black text-black dark:text-white mb-2">
                  {currentIndex + 1}/{announcements.length}
                </div>
                <div className="flex gap-1">
                  {announcements.map((_, index) => (
                    <motion.button
                      key={index}
                      className={`w-3 h-3 ${
                        index === currentIndex ? "bg-black dark:bg-white" : "border-2 border-black dark:border-white"
                      }`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setCurrentIndex(index)}
                    />
                  ))}
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextAnnouncement}
                  className="border-4 border-black dark:border-white font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black w-12 h-12 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
