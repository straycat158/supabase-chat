"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
// 导入新的头像上传组件
import { AvatarUpload } from "@/components/avatar-upload"

export default function Profile() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [username, setUsername] = useState("")

  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        router.push("/login")
        return
      }

      setUser(session.user)

      const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

      if (error) {
        console.error("Error fetching profile:", error)
      } else if (data) {
        setProfile(data)
        setUsername(data.username)
      }

      setIsLoading(false)
    }

    getProfile()
  }, [router, supabase])

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!user) return

    setIsSaving(true)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) {
        throw error
      }

      toast({
        title: "更新成功",
        description: "您的个人资料已更新",
      })

      setProfile({
        ...profile,
        username,
      })
    } catch (error: any) {
      toast({
        title: "更新失败",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>个人资料</CardTitle>
          <CardDescription>管理您的账户信息</CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdateProfile}>
          <CardContent className="space-y-6">
            {/* 替换现有的Avatar组件部分，在CardContent中的第一个div（flex flex-col items-center space-y-4）中： */}
            <div className="flex flex-col items-center space-y-4">
              <AvatarUpload
                userId={user?.id}
                currentAvatarUrl={profile?.avatar_url}
                username={profile?.username}
                onAvatarUploaded={(url) => {
                  setProfile({
                    ...profile,
                    avatar_url: url,
                  })
                }}
                size="xl"
              />
              <div className="text-center">
                <h3 className="text-lg font-medium">{profile?.username}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="flex flex-col gap-1 mt-2">
                  <Button variant="link" asChild className="h-auto p-0">
                    <a href="/admin/storage">管理图片存储</a>
                  </Button>
                  <Button variant="link" asChild className="h-auto p-0">
                    <a href="/profile/images">我的上传图片</a>
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/")}>
              返回
            </Button>
            <Button type="submit" disabled={isSaving || username === profile?.username}>
              {isSaving ? "保存中..." : "保存更改"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
