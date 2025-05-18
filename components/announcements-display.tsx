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
      className={`relative overflow-hidden rounded-xl mb-8 backdrop-blur-md shadow-xl
      ${
        isImportant
          ? "bg-amber-500/10 dark:bg-amber-700/20 border border-amber-200 dark:border-amber-800"
          : "bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30"
      }`}
    >
      {/* 背景装饰 */}
      <div className="absolute inset-0 z-0">
        <div
          className={`absolute inset-0 ${
            isImportant
              ? "bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-300/10"
              : "bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10"
          }`}
        ></div>
        <div
          className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 
          bg-gradient-to-br from-primary via-primary/50 to-primary/20"
        ></div>
        <div
          className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-20 
          bg-gradient-to-tr from-primary via-primary/50 to-primary/20"
        ></div>
      </div>

      {/* 内容 */}
      <div className="relative z-10 p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          {/* 图标部分 */}
          <div className="flex-shrink-0">
            <div
              className={`rounded-full p-4 ${
                isImportant
                  ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300"
                  : "bg-primary/20 dark:bg-primary/30 text-primary dark:text-primary-foreground"
              }`}
            >
              {isImportant ? <AlertCircle className="h-8 w-8" /> : <MegaphoneIcon className="h-8 w-8" />}
            </div>
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
                  <div className="flex items-center gap-2">
                    <h3 className={`text-xl font-bold ${isImportant ? "text-amber-800 dark:text-amber-300" : ""}`}>
                      {currentAnnouncement.title}
                    </h3>
                    {isImportant && (
                      <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-300">
                        重要
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-base line-clamp-3">{currentAnnouncement.content}</p>
                  <div className="flex items-center mt-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {format(new Date(currentAnnouncement.published_at), "yyyy年MM月dd日", { locale: zhCN })}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 导航按钮 */}
          {announcements.length > 1 && (
            <div className="flex items-center space-x-1 mt-4 md:mt-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevAnnouncement}
                className={`h-9 w-9 rounded-full ${
                  isImportant
                    ? "hover:bg-amber-200/50 dark:hover:bg-amber-800/50"
                    : "hover:bg-primary/20 dark:hover:bg-primary/30"
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="text-sm font-medium">
                {currentIndex + 1}/{announcements.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextAnnouncement}
                className={`h-9 w-9 rounded-full ${
                  isImportant
                    ? "hover:bg-amber-200/50 dark:hover:bg-amber-800/50"
                    : "hover:bg-primary/20 dark:hover:bg-primary/30"
                }`}
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
