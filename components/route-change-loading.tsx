"use client"

import { useState, useEffect, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { MinecraftLoading } from "@/components/minecraft-loading"

function RouteChangeLoadingInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handleStart = () => setLoading(true)
    const handleComplete = () => setLoading(false)

    // 添加事件监听器
    window.addEventListener("beforeunload", handleStart)
    window.addEventListener("load", handleComplete)

    // 清理事件监听器
    return () => {
      window.removeEventListener("beforeunload", handleStart)
      window.removeEventListener("load", handleComplete)
    }
  }, [])

  // 当路由变化时重置加载状态
  useEffect(() => {
    setLoading(false)
  }, [pathname, searchParams])

  return loading ? <MinecraftLoading fullScreen text="传送中..." /> : null
}

export function RouteChangeLoading() {
  return (
    <Suspense fallback={null}>
      <RouteChangeLoadingInner />
    </Suspense>
  )
}
