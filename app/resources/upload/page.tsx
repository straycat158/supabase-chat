"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { MultiImageUpload } from "@/components/multi-image-upload"
import { motion } from "framer-motion"
import { Upload, ArrowLeft, LinkIcon } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ResourceCategory } from "@/lib/types/database"

export default function ResourceUploadPage() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const { user, isLoading: isAuthLoading } = useAuth()

  const [categories, setCategories] = useState<ResourceCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [coverImages, setCoverImages] = useState<string[]>([])

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    downloadLink: "",
    categoryId: "",
  })

  // 检查用户权限
  useEffect(() => {
    if (!isAuthLoading && !user) {
      toast({
        title: "需要登录",
        description: "请先登录后再发布资源",
        variant: "destructive",
      })
      router.push("/login")
    }
  }, [user, isAuthLoading, router, toast])

  // 获取资源分类
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase.from("resource_categories").select("*").order("name")

        if (error) throw error
        setCategories(data || [])
      } catch (error: any) {
        toast({
          title: "获取分类失败",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchCategories()
    }
  }, [user, supabase, toast])

  // 处理表单输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // 处理分类选择
  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: value,
    }))
  }

  // 提交表单
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "未登录",
        description: "请先登录后再发布资源",
        variant: "destructive",
      })
      return
    }

    if (!formData.categoryId) {
      toast({
        title: "请选择分类",
        description: "请选择资源分类",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { data, error } = await supabase
        .from("resources")
        .insert({
          title: formData.title,
          description: formData.description || null,
          download_link: formData.downloadLink,
          cover_images: coverImages,
          category_id: formData.categoryId,
          user_id: user.id,
        })
        .select()

      if (error) throw error

      toast({
        title: "发布成功",
        description: "资源已成功发布",
      })

      router.push("/resources")
    } catch (error: any) {
      toast({
        title: "发布失败",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent animate-spin mx-auto"></div>
          <p className="text-black dark:text-white font-bold">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const selectedCategory = categories.find((cat) => cat.id === formData.categoryId)

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* 页面头部 */}
      <div className="relative overflow-hidden bg-white dark:bg-black border-b-4 border-black dark:border-white">
        {/* 几何背景 */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-16 h-16 border-4 border-black dark:border-white transform -rotate-12 opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black dark:bg-white transform -translate-x-16 translate-y-16 opacity-10"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} className="inline-block">
              <div className="w-16 h-16 bg-black dark:bg-white mx-auto mb-6 flex items-center justify-center">
                <Upload className="h-8 w-8 text-white dark:text-black" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-black tracking-tight text-black dark:text-white"
            >
              {selectedCategory ? `${selectedCategory.name}资源发布` : "资源发布"}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-400 font-medium"
            >
              分享你的优质资源，让更多玩家受益
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Button
                asChild
                variant="outline"
                className="border-2 border-black dark:border-white font-bold bg-transparent"
              >
                <Link href="/resources">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  返回资源中心
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* 表单区域 */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bw-card bg-white dark:bg-black">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-black dark:text-white">发布新资源</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                填写资源信息，让其他玩家能够找到并下载你的资源
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 资源分类 */}
                <div className="space-y-2">
                  <Label className="text-lg font-bold flex items-center gap-2 text-black dark:text-white">
                    <div className="w-2 h-2 bg-black dark:bg-white"></div>
                    资源分类
                  </Label>
                  <Select value={formData.categoryId} onValueChange={handleCategoryChange} required>
                    <SelectTrigger className="border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white">
                      <SelectValue placeholder="选择资源分类" />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-black dark:border-white bg-white dark:bg-black">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id} className="text-black dark:text-white">
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 资源标题 */}
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-lg font-bold flex items-center gap-2 text-black dark:text-white"
                  >
                    <div className="w-2 h-2 bg-black dark:bg-white"></div>
                    资源标题
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="输入资源标题"
                    className="border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    required
                  />
                </div>

                {/* 封面图片 */}
                <div className="space-y-2">
                  <MultiImageUpload
                    onImagesUploaded={setCoverImages}
                    existingImageUrls={coverImages}
                    folderPath="resource-covers"
                    maxImages={5}
                  />
                </div>

                {/* 资源描述 */}
                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-lg font-bold flex items-center gap-2 text-black dark:text-white"
                  >
                    <div className="w-2 h-2 bg-black dark:bg-white"></div>
                    资源简介
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="详细描述你的资源，包括功能特点、使用方法等"
                    rows={6}
                    className="border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 resize-none"
                  />
                </div>

                {/* 下载链接 */}
                <div className="space-y-2">
                  <Label
                    htmlFor="downloadLink"
                    className="text-lg font-bold flex items-center gap-2 text-black dark:text-white"
                  >
                    <div className="w-2 h-2 bg-black dark:bg-white"></div>
                    下载链接
                  </Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input
                      id="downloadLink"
                      name="downloadLink"
                      type="url"
                      value={formData.downloadLink}
                      onChange={handleChange}
                      placeholder="https://example.com/download"
                      className="pl-10 border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    请提供有效的下载链接，支持网盘、GitHub等平台
                  </p>
                </div>

                {/* 提交按钮 */}
                <div className="pt-6 border-t-2 border-black dark:border-white">
                  <Button type="submit" disabled={isSubmitting} className="w-full bw-button font-bold text-lg py-6">
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin"></div>
                        发布中...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        发布资源
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
