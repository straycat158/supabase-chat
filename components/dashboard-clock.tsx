"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Calendar } from "lucide-react"

export function DashboardClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("zh-CN", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    })
  }

  const getTimeOfDay = () => {
    const hour = time.getHours()
    if (hour < 6) return { greeting: "深夜好", icon: "🌙", color: "from-indigo-500 to-purple-600" }
    if (hour < 12) return { greeting: "早上好", icon: "🌅", color: "from-orange-400 to-pink-500" }
    if (hour < 18) return { greeting: "下午好", icon: "☀️", color: "from-yellow-400 to-orange-500" }
    return { greeting: "晚上好", icon: "🌆", color: "from-purple-500 to-indigo-600" }
  }

  const timeOfDay = getTimeOfDay()

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
      <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 shadow-lg overflow-hidden">
        <div className={`h-1 bg-gradient-to-r ${timeOfDay.color}`} />
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="font-medium text-green-800 dark:text-green-200">当前时间</span>
            </div>
            <span className="text-2xl">{timeOfDay.icon}</span>
          </div>

          <div className="space-y-3">
            <motion.div
              key={time.getSeconds()}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.1 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-green-800 dark:text-green-200 font-mono tracking-wider">
                {formatTime(time)}
              </div>
            </motion.div>

            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(time)}</span>
              </div>
              <div className="text-sm font-medium text-green-600 dark:text-green-400">{timeOfDay.greeting}！</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
