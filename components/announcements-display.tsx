"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { createClient } from "@/lib/supabase/client"
import { MegaphoneIcon, ChevronLeft, ChevronRight, AlertCircle, Clock } from "lucide-react"
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
      <div className="relative overflow-hidden rounded-xl mb-8 backdrop-blur-md bg-white/30 dark:bg-black/30 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 z-0"></div>
        <div className="relative z-10 p-6">
          <div className="flex items-center justify-center h-20">
            <div className="animate-pulse flex space-x-4 w-full">
              <div className="rounded-full bg-primary/20 h-12 w-12"></div>
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-primary/20 rounded w-3/4"></div>
                <div className="h-4 bg-primary/20 rounded w-5/6"></div>
                <div className="h-4 bg-primary/20 rounded w-1/2"></div>
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
    <div
      className={`relative overflow-hidden mb-8 border-4 border-black dark:border-white bg-white dark:bg-black
  ${
    isImportant
      ? "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]"
      : "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
  }`}
    >
      {/* 几何背景装饰 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-4 right-4 w-8 h-8 border-2 border-black dark:border-white opacity-20 transform rotate-45"></div>
        <div className="absolute bottom-4 left-4 w-6 h-6 bg-black dark:bg-white opacity-10 rounded-full"></div>
        {isImportant && <div className="absolute top-0 left-0 w-full h-2 bg-black dark:bg-white"></div>}
      </div>

      {/* 内容 */}
      <div className="relative z-10 p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* 图标部分 */}
          <div className="flex-shrink-0">
            <motion.div
              className={`w-16 h-16 flex items-center justify-center ${
                isImportant
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "border-4 border-black dark:border-white text-black dark:text-white"
              }`}
              whileHover={{ rotate: isImportant ? 0 : 45 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {isImportant ? <AlertCircle className="h-8 w-8" /> : <MegaphoneIcon className="h-8 w-8" />}
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
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl font-black text-black dark:text-white">{currentAnnouncement.title}</h3>
                    {isImportant && (
                      <span className="inline-flex items-center bg-black dark:bg-white text-white dark:text-black px-3 py-1 text-sm font-bold">
                        重要
                      </span>
                    )}
                  </div>
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-300 line-clamp-3 mb-3">
                    {currentAnnouncement.content}
                  </p>
                  <div className="flex items-center text-sm font-bold text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4 mr-2" />
                    {format(new Date(currentAnnouncement.published_at), "yyyy年MM月dd日", { locale: zhCN })}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 导航按钮 */}
          {announcements.length > 1 && (
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <Button
                variant="outline"
                size="icon"
                onClick={prevAnnouncement}
                className="border-2 border-black dark:border-white font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="text-lg font-bold text-black dark:text-white">
                {currentIndex + 1}/{announcements.length}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={nextAnnouncement}
                className="border-2 border-black dark:border-white font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
