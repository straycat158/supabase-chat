"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function AuthDebugger() {
  const supabase = createClient()
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkSession = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      setSessionInfo(data)
    } catch (err: any) {
      setError(err.message)
      console.error("Session check error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkSession()
  }, [])

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">认证状态调试器</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>登录状态:</span>
            <span className={sessionInfo?.session ? "text-green-500" : "text-red-500"}>
              {loading ? "检查中..." : sessionInfo?.session ? "已登录" : "未登录"}
            </span>
          </div>
          {error && <div className="text-red-500">错误: {error}</div>}
          {sessionInfo?.session && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>用户ID:</span>
                <span className="font-mono text-xs">{sessionInfo.session.user.id}</span>
              </div>
              <div className="flex justify-between">
                <span>邮箱:</span>
                <span>{sessionInfo.session.user.email}</span>
              </div>
              <div className="flex justify-between">
                <span>会话过期时间:</span>
                <span>{new Date(sessionInfo.session.expires_at * 1000).toLocaleString()}</span>
              </div>
            </div>
          )}
          <Button onClick={checkSession} variant="outline" size="sm">
            刷新状态
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
