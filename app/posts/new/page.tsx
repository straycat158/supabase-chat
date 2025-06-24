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
import { MultiImageUpload } from "@/components/multi-image-upload"
import { useAuth } from "@/components/auth-provider"
import { TagSelector } from "@/components/tag-selector"
import { Square, Circle, Triangle } from "lucide-react"

export default function NewPost() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const { user, isLoading: isAuthLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    imageUrls: [] as string[],
    tagId: null as string | null,
  })

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

  const handleImagesUploaded = (urls: string[]) => {
    setFormData({
      ...formData,
      imageUrls: urls,
    })
  }

  const handleTagSelect = (tagId: string | null) => {
    setFormData({
      ...formData,
      tagId,
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
          image_url: formData.imageUrls[0] || null, // 第一张图片作为封面
          image_urls: formData.imageUrls.length > 0 ? formData.imageUrls : null, // 所有图片
          user_id: user.id,
          tag_id: formData.tagId,
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
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-black dark:border-white animate-spin"></div>
            <div className="absolute inset-2 bg-black dark:bg-white"></div>
          </div>
          <p className="text-black dark:text-white font-bold text-xl">正在检查登录状态...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
      {/* 几何背景图案 */}
      <div className="absolute inset-0 geometric-pattern"></div>

      <div className="relative z-10 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Geometric Header */}
          <div className="relative mb-8 py-8">
            <div className="absolute -top-2 -left-2 w-16 h-16 border-2 border-black dark:border-white transform rotate-45"></div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-black dark:bg-white transform rotate-12"></div>
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
              <Triangle className="h-6 w-6 text-black dark:text-white opacity-20" />
            </div>
            <h1 className="text-4xl font-black text-center text-black dark:text-white relative z-10">发布新帖子</h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mt-2 font-medium">分享您的创意和想法</p>
          </div>

          <Card className="bw-card relative overflow-hidden">
            {/* Geometric decorations */}
            <div className="absolute top-0 right-0 w-20 h-20 border-l-2 border-b-2 border-black dark:border-white opacity-30"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-black dark:bg-white transform rotate-45 -translate-x-8 translate-y-8 opacity-20"></div>
            <div className="absolute top-1/2 right-8 transform -translate-y-1/2">
              <Circle className="h-8 w-8 text-black dark:text-white opacity-10" />
            </div>

            <CardHeader className="relative z-10 border-b-2 border-black dark:border-white bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-black dark:bg-white transform rotate-45"></div>
                <div className="flex-1">
                  <CardTitle className="text-2xl font-black text-black dark:text-white">创建帖子</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400 font-medium">
                    分享您的Minecraft经验、问题或创意
                  </CardDescription>
                </div>
                <Square className="h-6 w-6 text-black dark:text-white opacity-30" />
              </div>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-8 p-8 relative z-10 bg-white dark:bg-black">
                {/* Title Input */}
                <div className="space-y-4">
                  <Label
                    htmlFor="title"
                    className="text-lg font-black flex items-center gap-3 text-black dark:text-white"
                  >
                    <div className="w-2 h-2 bg-black dark:bg-white"></div>
                    标题
                  </Label>
                  <div className="relative">
                    <Input
                      id="title"
                      name="title"
                      placeholder="输入帖子标题..."
                      required
                      value={formData.title}
                      onChange={handleChange}
                      className="border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all duration-200 bg-white dark:bg-black text-black dark:text-white text-lg p-4 font-medium"
                    />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-black dark:bg-white transform rotate-45"></div>
                  </div>
                </div>

                {/* Tag Selector */}
                <div className="space-y-4">
                  <Label
                    htmlFor="tag"
                    className="text-lg font-black flex items-center gap-3 text-black dark:text-white"
                  >
                    <div className="w-2 h-2 bg-black dark:bg-white"></div>
                    标签
                  </Label>
                  <div className="relative border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-black p-6">
                    <TagSelector selectedTagId={formData.tagId} onTagSelect={handleTagSelect} />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 font-medium">
                      选择一个合适的标签，帮助其他用户更容易找到您的帖子
                    </p>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-black dark:bg-white transform rotate-45"></div>
                  </div>
                </div>

                {/* Content Textarea */}
                <div className="space-y-4">
                  <Label
                    htmlFor="content"
                    className="text-lg font-black flex items-center gap-3 text-black dark:text-white"
                  >
                    <div className="w-2 h-2 bg-black dark:bg-white"></div>
                    内容
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="content"
                      name="content"
                      placeholder="分享您的想法、经验或问题..."
                      required
                      rows={12}
                      value={formData.content}
                      onChange={handleChange}
                      className="border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all duration-200 bg-white dark:bg-black text-black dark:text-white text-base p-4 resize-none font-medium"
                    />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-black dark:bg-white transform rotate-45"></div>
                  </div>
                </div>

                {/* Multi Image Upload */}
                <div className="space-y-4">
                  <Label className="text-lg font-black flex items-center gap-3 text-black dark:text-white">
                    <div className="w-2 h-2 bg-black dark:bg-white"></div>
                    图片上传
                  </Label>
                  <div className="border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-black p-6 relative">
                    <MultiImageUpload
                      onImagesUploaded={handleImagesUploaded}
                      existingImageUrls={formData.imageUrls}
                      folderPath="post-images"
                      maxImages={5}
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-black dark:bg-white transform rotate-45"></div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between p-8 border-t-2 border-black dark:border-white bg-gray-50 dark:bg-gray-900 relative">
                <div className="absolute top-0 left-4 w-8 h-8 border-2 border-black dark:border-white transform rotate-45 -translate-y-4 bg-gray-50 dark:bg-gray-900"></div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all duration-200 bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-900 text-black dark:text-white font-bold px-8 py-3"
                >
                  取消
                </Button>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bw-button font-bold px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></div>
                      发布中...
                    </div>
                  ) : (
                    "发布帖子"
                  )}
                </Button>

                <div className="absolute bottom-0 right-4 w-6 h-6 border-2 border-black dark:border-white transform rotate-45 translate-y-3 bg-gray-50 dark:bg-gray-900"></div>
              </CardFooter>
            </form>
          </Card>

          {/* Bottom geometric decoration */}
          <div className="flex justify-center mt-12 gap-6">
            <div className="w-4 h-4 bg-black dark:bg-white transform rotate-45"></div>
            <div className="w-3 h-3 border-2 border-black dark:border-white transform rotate-45"></div>
            <div className="w-2 h-2 bg-black dark:bg-white"></div>
            <div className="w-3 h-3 border-2 border-black dark:border-white transform rotate-45"></div>
            <div className="w-4 h-4 bg-black dark:bg-white transform rotate-45"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
