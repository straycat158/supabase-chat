"use client"

import { useState, useEffect, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { SimpleLoading } from "@/components/simple-loading"

function RouteChangeLoadingInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handleStart = () => setLoading(true)
    const handleComplete = () => setLoading(false)

    // 模拟路由变化加载
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 300)

    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  return loading ? <SimpleLoading fullScreen text="页面加载中" variant="spinner" size="md" /> : null
}

export function RouteChangeLoading() {
  return (
    <Suspense fallback={null}>
      <RouteChangeLoadingInner />
    </Suspense>
  )
}
