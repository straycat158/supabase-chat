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
      <div className="flex justify-center items-center py-12">
        <p>正在检查登录状态...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4">
      <div className="max-w-2xl mx-auto">
        {/* Geometric Header */}
        <div className="relative mb-8">
          <div className="absolute -top-2 -left-2 w-16 h-16 border-2 border-black transform rotate-45"></div>
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-black transform rotate-12"></div>
          <h1 className="text-3xl font-bold text-center py-8 relative z-10">发布新帖子</h1>
        </div>

        <Card className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white relative overflow-hidden">
          {/* Geometric decorations */}
          <div className="absolute top-0 right-0 w-20 h-20 border-l-2 border-b-2 border-black"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-black transform rotate-45 -translate-x-8 translate-y-8"></div>

          <CardHeader className="relative z-10 border-b-2 border-black bg-gray-50">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-black transform rotate-45"></div>
              <div>
                <CardTitle className="text-2xl font-bold">创建帖子</CardTitle>
                <CardDescription className="text-gray-600 font-medium">
                  分享您的Minecraft经验、问题或创意
                </CardDescription>
              </div>
              <div className="w-3 h-3 bg-black transform rotate-45"></div>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 p-6 relative z-10">
              {/* Title Input */}
              <div className="space-y-3">
                <Label htmlFor="title" className="text-lg font-bold flex items-center gap-2">
                  <div className="w-2 h-2 bg-black"></div>
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
                    className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 bg-white text-lg p-4"
                  />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-black transform rotate-45"></div>
                </div>
              </div>

              {/* Tag Selector */}
              <div className="space-y-3">
                <Label htmlFor="tag" className="text-lg font-bold flex items-center gap-2">
                  <div className="w-2 h-2 bg-black"></div>
                  标签
                </Label>
                <div className="relative border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white p-4">
                  <TagSelector selectedTagId={formData.tagId} onTagSelect={handleTagSelect} />
                  <p className="text-sm text-gray-600 mt-2 font-medium">
                    选择一个合适的标签，帮助其他用户更容易找到您的帖子
                  </p>
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-black transform rotate-45"></div>
                </div>
              </div>

              {/* Content Textarea */}
              <div className="space-y-3">
                <Label htmlFor="content" className="text-lg font-bold flex items-center gap-2">
                  <div className="w-2 h-2 bg-black"></div>
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
                    className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 bg-white text-base p-4 resize-none"
                  />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-black transform rotate-45"></div>
                </div>
              </div>

              {/* Multi Image Upload */}
              <div className="space-y-3">
                <div className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white p-4 relative">
                  <MultiImageUpload
                    onImagesUploaded={handleImagesUploaded}
                    existingImageUrls={formData.imageUrls}
                    folderPath="post-images"
                    maxImages={5}
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-black transform rotate-45"></div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between p-6 border-t-2 border-black bg-gray-50 relative">
              <div className="absolute top-0 left-4 w-8 h-8 border-2 border-black transform rotate-45 -translate-y-4 bg-gray-50"></div>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 bg-white hover:bg-gray-100 text-black font-bold px-8 py-3"
              >
                取消
              </Button>

              <Button
                type="submit"
                disabled={isLoading}
                className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 bg-black hover:bg-gray-800 text-white font-bold px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    发布中...
                  </div>
                ) : (
                  "发布帖子"
                )}
              </Button>

              <div className="absolute bottom-0 right-4 w-6 h-6 border-2 border-black transform rotate-45 translate-y-3 bg-gray-50"></div>
            </CardFooter>
          </form>
        </Card>

        {/* Bottom geometric decoration */}
        <div className="flex justify-center mt-8 gap-4">
          <div className="w-4 h-4 bg-black transform rotate-45"></div>
          <div className="w-3 h-3 border-2 border-black transform rotate-45"></div>
          <div className="w-2 h-2 bg-black"></div>
          <div className="w-3 h-3 border-2 border-black transform rotate-45"></div>
          <div className="w-4 h-4 bg-black transform rotate-45"></div>
        </div>
      </div>
    </div>
  )
}
