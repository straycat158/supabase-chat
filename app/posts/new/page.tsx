"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { SupabaseImageUpload } from "@/components/supabase-image-upload"
import { useAuth } from "@/components/auth-provider"

export default function NewPost() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const { user, isLoading: isAuthLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    imageUrl: "",
  })

  // 在组件加载时检查用户是否已登录
  useEffect(() => {
    if (!isAuthLoading && !user) {
      toast({
        title: "请先登录",
        description: "您需要登录才能发布帖子",
        variant: "destructive",
      })
      router.push("/login")
    }
  }, [user, isAuthLoading, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleImageUploaded = (url: string) => {
    setFormData({
      ...formData,
      imageUrl: url,
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "请先登录",
        description: "您需要登录才能发布帖子",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setIsLoading(true)

    try {
      console.log("Submitting post with user ID:", user.id)

      const { data, error } = await supabase
        .from("posts")
        .insert({
          title: formData.title,
          content: formData.content,
          image_url: formData.imageUrl,
          user_id: user.id,
        })
        .select()

      if (error) {
        throw error
      }

      toast({
        title: "发布成功",
        description: "您的帖子已成功发布",
      })

      router.push("/")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "发布失败",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p>正在检查登录状态...</p>
      </div>
    )
  }

  if (!user) {
    return null // 将由useEffect处理重定向
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>发布新帖子</CardTitle>
          <CardDescription>分享您的Minecraft经验、问题或创意</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">标题</Label>
              <Input
                id="title"
                name="title"
                placeholder="帖子标题"
                required
                value={formData.title}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">内容</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="帖子内容..."
                required
                rows={10}
                value={formData.content}
                onChange={handleChange}
              />
            </div>
            <SupabaseImageUpload
              onImageUploaded={handleImageUploaded}
              existingImageUrl={formData.imageUrl}
              folderPath="post-images"
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "发布中..." : "发布帖子"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
