"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import {
  Upload,
  ArrowLeft,
  LinkIcon,
  Package,
  Palette,
  Lightbulb,
  Map,
  MoreHorizontal,
  AlertCircle,
  Database,
} from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ResourceCategory } from "@/lib/types/database"

const categoryIcons = {
  mods: Package,
  texturepacks: Palette,
  shaders: Lightbulb,
  maps: Map,
  others: MoreHorizontal,
}

// 默认使用新的存储桶名称，你可以根据需要修改
const STORAGE_BUCKET_NAME = "minecraft-resources-images"

export default function ResourceUploadPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { toast } = useToast()
  const { user, isLoading: isAuthLoading } = useAuth()

  const [categories, setCategories] = useState<ResourceCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [coverImages, setCoverImages] = useState<string[]>([])
  const [storageReady, setStorageReady] = useState(false)
  const [checkingStorage, setCheckingStorage] = useState(true)

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

  // 检查存储桶状态
  useEffect(() => {
    const checkStorage = async () => {
      setCheckingStorage(true)
      try {
        // 尝试列出存储桶中的文件来检查存储桶是否存在
        const { data, error } = await supabase.storage.from(STORAGE_BUCKET_NAME).list("", {
          limit: 1,
        })

        if (error) {
          console.error(`存储桶 ${STORAGE_BUCKET_NAME} 不存在或无法访问:`, error)
          setStorageReady(false)
        } else {
          console.log(`存储桶 ${STORAGE_BUCKET_NAME} 可用`)
          setStorageReady(true)
        }
      } catch (error: any) {
        console.error("检查存储桶失败:", error)
        setStorageReady(false)
      } finally {
        setCheckingStorage(false)
      }
    }

    checkStorage()
  }, [supabase])

  // 获取资源分类
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase.from("resource_categories").select("*").order("name")

        if (error) throw error
        setCategories(data || [])

        // 如果URL中有category参数，自动选择对应分类
        const categorySlug = searchParams.get("category")
        if (categorySlug) {
          const category = data?.find((cat) => cat.slug === categorySlug)
          if (category) {
            setFormData((prev) => ({
              ...prev,
              categoryId: category.id,
            }))
          }
        }
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
  }, [user, supabase, toast, searchParams])

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
    e.stopPropagation()

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

    if (!storageReady) {
      toast({
        title: "存储不可用",
        description: "图片存储不可用，请检查存储桶配置",
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

      // 跳转到对应分类页面
      const category = categories.find((cat) => cat.id === formData.categoryId)
      if (category) {
        router.push(`/resources/${category.slug}`)
      } else {
        router.push("/resources")
      }
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

  // 创建存储桶
  const createStorageBucket = async () => {
    try {
      const response = await fetch("/api/storage/create-new", {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        toast({
          title: "存储桶创建成功",
          description: `新存储桶 ${data.bucketName} 已创建`,
        })
        // 重新检查存储状态
        window.location.reload()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "创建存储桶失败",
        description: error.message,
        variant: "destructive",
      })
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
  const IconComponent = selectedCategory
    ? categoryIcons[selectedCategory.slug as keyof typeof categoryIcons] || Upload
    : Upload

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
                <IconComponent className="h-8 w-8 text-white dark:text-black" />
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
              <Link href="/resources">
                <Button
                  variant="outline"
                  className="border-2 border-black dark:border-white font-bold bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  返回资源中心
                </Button>
              </Link>
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
          {/* 存储状态检查 */}
          {checkingStorage && (
            <Card className="bw-card bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent animate-spin"></div>
                  <span className="text-blue-800 dark:text-blue-200 font-bold">检查存储桶状态...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 存储不可用警告 */}
          {!checkingStorage && !storageReady && (
            <Card className="bw-card bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 mb-6">
              <CardHeader>
                <CardTitle className="text-red-800 dark:text-red-200 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  存储桶不可用
                </CardTitle>
                <CardDescription className="text-red-700 dark:text-red-300">
                  存储桶 <code className="bg-red-100 dark:bg-red-900 px-2 py-1 rounded">{STORAGE_BUCKET_NAME}</code>{" "}
                  不存在或无法访问
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-red-700 dark:text-red-300">
                    <p className="font-bold mb-2">解决方案:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>点击下方按钮创建新的存储桶</li>
                      <li>
                        或者访问{" "}
                        <Link href="/admin/storage/new" className="underline font-bold">
                          存储管理页面
                        </Link>
                      </li>
                      <li>或者联系管理员配置存储桶</li>
                    </ol>
                  </div>
                  <Button
                    onClick={createStorageBucket}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    创建新存储桶
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

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
                    bucketName={STORAGE_BUCKET_NAME}
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
                  <Button
                    type="submit"
                    disabled={isSubmitting || !storageReady}
                    className="w-full bw-button font-bold text-lg py-6"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin"></div>
                        发布中...
                      </div>
                    ) : !storageReady ? (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        存储不可用
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
