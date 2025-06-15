"use client"

import { useState, useEffect, Suspense } from "react"
import { usePathname } from "next/navigation"
import { SimpleLoading } from "@/components/simple-loading"

function RouteChangeLoadingInner() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const [previousPath, setPreviousPath] = useState<string>("")

  useEffect(() => {
    // 只有当路径真正改变时才显示加载动画
    if (previousPath && previousPath !== pathname) {
      setLoading(true)

      // 模拟页面加载时间
      const timer = setTimeout(() => {
        setLoading(false)
      }, 500)

      return () => clearTimeout(timer)
    }

    setPreviousPath(pathname)
  }, [pathname, previousPath])

  return loading ? <SimpleLoading fullScreen text="页面切换中" variant="spinner" size="md" /> : null
}

export function RouteChangeLoading() {
  return (
    <Suspense fallback={null}>
      <RouteChangeLoadingInner />
    </Suspense>
  )
}
