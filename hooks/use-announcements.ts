"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

const LAST_READ_KEY = "last-read-announcement"

export function useAnnouncements() {
  const [hasNewAnnouncements, setHasNewAnnouncements] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkForNewAnnouncements = async () => {
      try {
        const { data, error } = await supabase
          .from("announcements")
          .select("published_at")
          .lte("published_at", new Date().toISOString())
          .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
          .order("published_at", { ascending: false })
          .limit(1)

        if (error) {
          throw error
        }

        if (data && data.length > 0) {
          const latestAnnouncementTime = new Date(data[0].published_at).getTime()
          const lastReadTime = localStorage.getItem(LAST_READ_KEY)

          if (!lastReadTime || Number.parseInt(lastReadTime) < latestAnnouncementTime) {
            setHasNewAnnouncements(true)
          }
        }
      } catch (error) {
        console.error("检查新公告失败:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkForNewAnnouncements()

    // 设置定时检查（每5分钟检查一次）
    const interval = setInterval(checkForNewAnnouncements, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [supabase])

  const markAsRead = () => {
    localStorage.setItem(LAST_READ_KEY, Date.now().toString())
    setHasNewAnnouncements(false)
  }

  return {
    hasNewAnnouncements,
    isLoading,
    markAsRead,
  }
}
