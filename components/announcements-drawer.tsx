"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { createClient } from "@/lib/supabase/client"
import {
  MegaphoneIcon,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Bell,
  BellRing,
  Sparkles,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import type { Announcement } from "@/lib/types/database"

interface AnnouncementsDrawerProps {
  hasNewAnnouncements: boolean
  onMarkAsRead: () => void
}

export function AnnouncementsDrawer({ hasNewAnnouncements, onMarkAsRead }: AnnouncementsDrawerProps) {
  const supabase = createClient()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

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

    if (isOpen) {
      fetchAnnouncements()
    }
  }, [supabase, isOpen])

  const nextAnnouncement = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length)
  }

  const prevAnnouncement = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + announcements.length) % announcements.length)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open && hasNewAnnouncements) {
      onMarkAsRead()
    }
  }

  const currentAnnouncement = announcements[currentIndex]

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {/* 替换公告按钮部分 */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative">
          <Button
            variant="ghost"
            size="icon"
            className={`relative transition-all duration-300 border-2 border-black dark:border-white ${
              hasNewAnnouncements
                ? "bg-black dark:bg-white text-white dark:text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                : "hover:bg-gray-100 dark:hover:bg-gray-900"
            }`}
          >
            <motion.div
              animate={
                hasNewAnnouncements
                  ? {
                      rotate: [0, -15, 15, -15, 0],
                      scale: [1, 1.1, 1],
                    }
                  : {}
              }
              transition={{
                duration: 2,
                repeat: hasNewAnnouncements ? Number.POSITIVE_INFINITY : 0,
                repeatDelay: 3,
              }}
            >
              {hasNewAnnouncements ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
            </motion.div>

            {hasNewAnnouncements && (
              <>
                {/* 方形提醒 */}
                <motion.div
                  className="absolute -top-2 -right-2 w-4 h-4 bg-black dark:bg-white border-2 border-white dark:border-black"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </>
            )}
          </Button>
        </motion.div>
      </SheetTrigger>

      {/* 替换 SheetContent 的样式 */}
      <SheetContent className="w-[400px] sm:w-[540px] bg-white dark:bg-black border-l-4 border-black dark:border-white">
        <SheetHeader className="pb-6 border-b-2 border-black dark:border-white">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <SheetTitle className="flex items-center gap-4 text-3xl">
              <motion.div
                className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center"
                whileHover={{ rotate: 45, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <MegaphoneIcon className="h-6 w-6" />
              </motion.div>
              <span className="font-black text-black dark:text-white">论坛公告</span>
              {hasNewAnnouncements && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <span className="bg-black dark:bg-white text-white dark:text-black px-3 py-1 text-sm font-bold">
                    <Sparkles className="h-3 w-3 mr-1 inline" />
                    新消息
                  </span>
                </motion.div>
              )}
            </SheetTitle>
            <SheetDescription className="text-lg font-medium text-gray-600 dark:text-gray-400">
              查看最新的论坛公告和重要通知
            </SheetDescription>
          </motion.div>
        </SheetHeader>

        <div className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <motion.div
                  key={index}
                  className="animate-pulse"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start space-x-4 p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl">
                    <div className="rounded-full bg-green-200 dark:bg-green-800 h-12 w-12"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-green-200 dark:bg-green-800 rounded w-3/4"></div>
                      <div className="h-3 bg-green-200 dark:bg-green-800 rounded w-1/2"></div>
                      <div className="h-3 bg-green-200 dark:bg-green-800 rounded w-5/6"></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center">
                <MegaphoneIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-green-800 dark:text-green-200">暂无公告</h3>
              <p className="text-green-600 dark:text-green-400">请稍后再来查看最新消息</p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {/* 当前公告显示 */}
              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentAnnouncement.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* 替换公告卡片的样式 */}
                    <div
                      className={`border-4 border-black dark:border-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] ${
                        currentAnnouncement.is_important
                          ? "bg-black dark:bg-white text-white dark:text-black"
                          : "bg-white dark:bg-black"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <motion.div
                          className={`w-12 h-12 flex items-center justify-center ${
                            currentAnnouncement.is_important
                              ? "bg-white dark:bg-black text-black dark:text-white border-2 border-white dark:border-black"
                              : "bg-black dark:bg-white text-white dark:text-black"
                          }`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        >
                          {currentAnnouncement.is_important ? (
                            <AlertCircle className="h-6 w-6" />
                          ) : (
                            <MegaphoneIcon className="h-6 w-6" />
                          )}
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-black text-xl">{currentAnnouncement.title}</h3>
                            {currentAnnouncement.is_important && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                              >
                                <span className="bg-white dark:bg-black text-black dark:text-white px-2 py-1 text-xs font-bold border-2 border-white dark:border-black">
                                  <Star className="h-3 w-3 mr-1 inline" />
                                  重要
                                </span>
                              </motion.div>
                            )}
                          </div>
                          <ScrollArea className="h-36 w-full">
                            <p className="font-medium leading-relaxed whitespace-pre-wrap">
                              {currentAnnouncement.content}
                            </p>
                          </ScrollArea>
                          <div className="flex items-center mt-4 text-sm font-bold opacity-80">
                            <Clock className="h-4 w-4 mr-2" />
                            {format(new Date(currentAnnouncement.published_at), "yyyy年MM月dd日 HH:mm", {
                              locale: zhCN,
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* 导航按钮 */}
                {announcements.length > 1 && (
                  <motion.div
                    className="flex items-center justify-between mt-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevAnnouncement}
                      className="flex items-center gap-2 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950/20"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      上一条
                    </Button>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {currentIndex + 1} / {announcements.length}
                      </span>
                      <div className="flex gap-1">
                        {announcements.map((_, index) => (
                          <motion.div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentIndex ? "bg-green-500" : "bg-green-200 dark:bg-green-800"
                            }`}
                            whileHover={{ scale: 1.2 }}
                            onClick={() => setCurrentIndex(index)}
                            style={{ cursor: "pointer" }}
                          />
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextAnnouncement}
                      className="flex items-center gap-2 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950/20"
                    >
                      下一条
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </div>

              <Separator className="bg-green-200 dark:bg-green-800" />

              {/* 公告列表 */}
              <div>
                <h4 className="font-bold text-lg mb-4 text-green-800 dark:text-green-200 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  所有公告
                </h4>
                <ScrollArea className="h-72">
                  <div className="space-y-3">
                    {announcements.map((announcement, index) => (
                      <motion.div
                        key={announcement.id}
                        className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                          index === currentIndex
                            ? "bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-green-300 dark:border-green-700 shadow-lg"
                            : "bg-white/60 dark:bg-gray-800/60 hover:bg-green-50 dark:hover:bg-green-950/20 border-transparent hover:border-green-200 dark:hover:border-green-800"
                        }`}
                        onClick={() => setCurrentIndex(index)}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <motion.div
                              className={`p-2 rounded-lg ${
                                announcement.is_important
                                  ? "bg-gradient-to-r from-amber-500 to-orange-500"
                                  : "bg-gradient-to-r from-green-500 to-emerald-500"
                              }`}
                              whileHover={{ rotate: 5 }}
                            >
                              {announcement.is_important ? (
                                <AlertCircle className="h-4 w-4 text-white" />
                              ) : (
                                <MegaphoneIcon className="h-4 w-4 text-white" />
                              )}
                            </motion.div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-semibold text-sm truncate text-gray-800 dark:text-gray-200">
                                {announcement.title}
                              </h5>
                              {announcement.is_important && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-0"
                                >
                                  重要
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(announcement.published_at), "MM月dd日 HH:mm", { locale: zhCN })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
