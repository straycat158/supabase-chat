"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { createClient } from "@/lib/supabase/client"
import { MegaphoneIcon, AlertCircle, Clock, ChevronLeft, ChevronRight, Bell, BellRing } from "lucide-react"
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
        <Button variant="ghost" size="icon" className="relative">
          {hasNewAnnouncements ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
          {hasNewAnnouncements && (
            <motion.div
              className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MegaphoneIcon className="h-5 w-5" />
            论坛公告
          </SheetTitle>
          <SheetDescription>查看最新的论坛公告和重要通知</SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="flex items-start space-x-4">
                    <div className="rounded-full bg-muted h-12 w-12"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-5/6"></div>
                    </div>
                  </div>
                  <Separator className="mt-4" />
                </div>
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-8">
              <MegaphoneIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">暂无公告</p>
            </div>
          ) : (
            <div className="space-y-4">
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
                    <div
                      className={`rounded-lg p-4 border ${
                        currentAnnouncement.is_important
                          ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                          : "bg-muted/50 border-border"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`rounded-full p-2 ${
                            currentAnnouncement.is_important
                              ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300"
                              : "bg-primary/20 text-primary"
                          }`}
                        >
                          {currentAnnouncement.is_important ? (
                            <AlertCircle className="h-5 w-5" />
                          ) : (
                            <MegaphoneIcon className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{currentAnnouncement.title}</h3>
                            {currentAnnouncement.is_important && (
                              <Badge
                                variant="secondary"
                                className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                              >
                                重要
                              </Badge>
                            )}
                          </div>
                          <ScrollArea className="h-32 w-full">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{currentAnnouncement.content}</p>
                          </ScrollArea>
                          <div className="flex items-center mt-3 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
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
                  <div className="flex items-center justify-between mt-4">
                    <Button variant="outline" size="sm" onClick={prevAnnouncement} className="flex items-center gap-1">
                      <ChevronLeft className="h-4 w-4" />
                      上一条
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {currentIndex + 1} / {announcements.length}
                    </span>
                    <Button variant="outline" size="sm" onClick={nextAnnouncement} className="flex items-center gap-1">
                      下一条
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              {/* 公告列表 */}
              <div>
                <h4 className="font-medium mb-3">所有公告</h4>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {announcements.map((announcement, index) => (
                      <motion.div
                        key={announcement.id}
                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                          index === currentIndex ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"
                        }`}
                        onClick={() => setCurrentIndex(index)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 mt-1">
                            {announcement.is_important ? (
                              <AlertCircle className="h-4 w-4 text-amber-600" />
                            ) : (
                              <MegaphoneIcon className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium text-sm truncate">{announcement.title}</h5>
                              {announcement.is_important && (
                                <Badge variant="secondary" className="text-xs">
                                  重要
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(announcement.published_at), "MM月dd日", { locale: zhCN })}
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
