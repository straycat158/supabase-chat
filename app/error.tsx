"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 记录错误到错误报告服务
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="mb-8">
        <AlertTriangle className="h-24 w-24 text-amber-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-2">出现了一些问题</h1>
        <p className="text-muted-foreground mb-6">很抱歉，服务器遇到了一些问题。我们正在努力修复它。</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset} variant="default">
            重试
          </Button>
          <Button asChild variant="outline">
            <Link href="/">返回首页</Link>
          </Button>
        </div>
      </div>

      <div className="max-w-md p-6 bg-background/30 backdrop-blur-md rounded-xl border border-white/10 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">您可以尝试：</h2>
        <ul className="space-y-2 text-left">
          <li>• 刷新页面</li>
          <li>• 检查您的网络连接</li>
          <li>• 稍后再试</li>
          <li>
            • 或者
            <Link href="/posts" className="text-primary hover:underline">
              浏览其他内容
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}
