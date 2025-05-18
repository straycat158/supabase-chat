"use client"

import { useState, useEffect, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"

function NavigationProgressInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isLoading) {
      // 快速增加到80%，然后缓慢增加
      setProgress(10)
      const timeout = setTimeout(() => {
        setProgress(30)
        setTimeout(() => {
          setProgress(50)
          setTimeout(() => {
            setProgress(80)
            interval = setInterval(() => {
              setProgress((prev) => {
                if (prev >= 90) {
                  clearInterval(interval)
                  return 90
                }
                return prev + 1
              })
            }, 500)
          }, 300)
        }, 200)
      }, 100)

      return () => {
        clearTimeout(timeout)
        clearInterval(interval)
      }
    } else if (progress > 0) {
      // 当加载完成时，快速完成进度条
      setProgress(100)
      const timeout = setTimeout(() => {
        setProgress(0)
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [isLoading, progress])

  useEffect(() => {
    const handleStart = () => {
      setIsLoading(true)
    }

    const handleComplete = () => {
      setIsLoading(false)
    }

    window.addEventListener("beforeunload", handleStart)
    window.addEventListener("load", handleComplete)

    return () => {
      window.removeEventListener("beforeunload", handleStart)
      window.removeEventListener("load", handleComplete)
    }
  }, [])

  // 当路由变化时重置加载状态
  useEffect(() => {
    setIsLoading(false)
  }, [pathname, searchParams])

  return (
    <>
      {progress > 0 && (
        <>
          {/* 主进度条 */}
          <motion.div
            className="fixed top-0 left-0 right-0 h-1 bg-primary z-50"
            style={{ width: `${progress}%` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* 进度条光晕效果 */}
          <motion.div
            className="fixed top-0 left-0 right-0 h-1 bg-primary/30 backdrop-blur-sm z-40"
            style={{ width: `${progress + 5}%` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* 进度条末端光点 */}
          <motion.div
            className="fixed top-0 h-1 w-4 bg-primary rounded-full shadow-[0_0_8px_rgba(0,255,0,0.7)] z-50"
            style={{ left: `${progress - 0.5}%` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </>
      )}
    </>
  )
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressInner />
    </Suspense>
  )
}
