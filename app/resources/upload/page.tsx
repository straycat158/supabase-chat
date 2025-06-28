"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
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
  ImageIcon,
  Plus,
  X,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ResourceCategory } from "@/lib/types/database"
import Image from "next/image"

const categoryIcons = {
  mods: Package,
  texturepacks: Palette,
  shaders: Lightbulb,
  maps: Map,
  others: MoreHorizontal,
}

// 推荐的图床服务
const recommendedImageHosts = [
  {
    name: "picui",
    url: "https://picui.cn/",
    description: "免费图床，支持直链，无需注册",
  },
  {
    name: "SM.MS",
    url: "https://sm.ms/",
    description: "免费图床，简单易用，支持API",
  },
  {
    name: "Imgur",
    url: "https://imgur.com/",
    description: "老牌图床，稳定可靠",
  },
  {
    name: "PostImage",
    url: "https://postimages.org/",
    description: "免费图床，无需注册",
  },
]

export default function ResourceUploadPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { toast } = useToast()
  const { user, isLoading: isAuthLoading } = useAuth()
  const formRef = useRef<HTMLFormElement>(null)

  const [categories, setCategories] = useState<ResourceCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [coverImages, setCoverImages] = useState<string[]>([])
  const [newImageUrl, setNewImageUrl] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    downloadLink: "",
    categoryId: "",
  })

  // 防止页面刷新的函数
  const preventRefresh = useCallback(
    (e: BeforeUnloadEvent) => {
      // 如果有未保存的数据，阻止页面刷新
      if (formData.title || formData.description || formData.downloadLink || coverImages.length > 0) {
        e.preventDefault()
        e.returnValue = "您有未保存的数据，确定要离开吗？"
        return "您有未保存的数据，确定要离开吗？"
      }
    },
    [formData, coverImages],
  )

  // 防止表单意外提交
  const preventFormSubmit = useCallback(
    (e: Event) => {
      // 检查是否是我们想要的提交
      if (e.target === formRef.current && !isSubmitting) {
        return // 允许正常提交
      }

      // 阻止其他意外的表单提交
      if (e.target instanceof HTMLFormElement && e.target !== formRef.current) {
        e.preventDefault()
        e.stopPropagation()
      }
    },
    [isSubmitting],
  )

  // 添加页面刷新保护
  useEffect(() => {
    // 监听页面刷新事件
    window.addEventListener("beforeunload", preventRefresh)

    // 监听表单提交事件
    document.addEventListener("submit", preventFormSubmit, true)

    // 防止意外的页面导航
    const handlePopState = (e: PopStateEvent) => {
      if (formData.title || formData.description || formData.downloadLink || coverImages.length > 0) {
        const confirmLeave = window.confirm("您有未保存的数据，确定要离开吗？")
        if (!confirmLeave) {
          e.preventDefault()
          window.history.pushState(null, "", window.location.href)
        }
      }
    }

    window.addEventListener("popstate", handlePopState)

    return () => {
      window.removeEventListener("beforeunload", preventRefresh)
      document.removeEventListener("submit", preventFormSubmit, true)
      window.removeEventListener("popstate", handlePopState)
    }
  }, [preventRefresh, preventFormSubmit, formData, coverImages])

  // 保存表单状态到 sessionStorage
  useEffect(() => {
    const saveFormState = () => {
      const state = {
        formData,
        coverImages,
        timestamp: Date.now(),
      }
      sessionStorage.setItem("resource-upload-state", JSON.stringify(state))
    }

    // 延迟保存，避免频繁写入
    const timeoutId = setTimeout(saveFormState, 500)
    return () => clearTimeout(timeoutId)
  }, [formData, coverImages])

  // 从 sessionStorage 恢复表单状态
  useEffect(() => {
    const restoreFormState = () => {
      try {
        const savedState = sessionStorage.getItem("resource-upload-state")
        if (savedState) {
          const state = JSON.parse(savedState)
          // 只恢复30分钟内的状态
          if (Date.now() - state.timestamp < 30 * 60 * 1000) {
            setFormData(
              state.formData || {
                title: "",
                description: "",
                downloadLink: "",
                categoryId: "",
              },
            )
            setCoverImages(state.coverImages || [])
          }
        }
      } catch (error) {
        console.error("恢复表单状态失败:", error)
      }
    }

    restoreFormState()
  }, [])

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

  // 验证图片URL
  const validateImageUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      return urlObj.protocol === "http:" || urlObj.protocol === "https:"
    } catch {
      return false
    }
  }

  // 添加图片URL
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) {
      toast({
        title: "请输入图片链接",
        description: "图片链接不能为空",
        variant: "destructive",
      })
      return
    }

    if (!validateImageUrl(newImageUrl)) {
      toast({
        title: "无效的图片链接",
        description: "请输入有效的HTTP或HTTPS图片链接",
        variant: "destructive",
      })
      return
    }

    if (coverImages.length >= 5) {
      toast({
        title: "图片数量超限",
        description: "最多只能添加5张封面图片",
        variant: "destructive",
      })
      return
    }

    if (coverImages.includes(newImageUrl)) {
      toast({
        title: "图片已存在",
        description: "该图片链接已经添加过了",
        variant: "destructive",
      })
      return
    }

    setCoverImages((prev) => [...prev, newImageUrl])
    setNewImageUrl("")
    toast({
      title: "添加成功",
      description: "图片链接已添加",
    })
  }

  // 删除图片URL
  const handleRemoveImageUrl = (index: number) => {
    setCoverImages((prev) => prev.filter((_, i) => i !== index))
  }

  // 移动图片位置
  const moveImage = (fromIndex: number, toIndex: number) => {
    setCoverImages((prev) => {
      const newImages = [...prev]
      const [movedItem] = newImages.splice(fromIndex, 1)
      newImages.splice(toIndex, 0, movedItem)
      return newImages
    })
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

      // 清除保存的状态
      sessionStorage.removeItem("resource-upload-state")

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
          {/* 推荐图床服务 */}
          <Card className="bw-card bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 mb-6">
            <CardHeader>
              <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                推荐图床服务
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                使用以下免费图床服务上传你的资源封面图片，然后复制图片链接到下方
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendedImageHosts.map((host) => (
                  <div
                    key={host.name}
                    className="p-4 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 rounded"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-blue-800 dark:text-blue-200">{host.name}</h4>
                      <Button asChild size="sm" variant="outline" className="text-xs bg-transparent">
                        <a href={host.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          访问
                        </a>
                      </Button>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{host.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bw-card bg-white dark:bg-black">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-black dark:text-white">发布新资源</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                填写资源信息，让其他玩家能够找到并下载你的资源
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
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

                {/* 封面图片链接 */}
                <div className="space-y-4">
                  <Label className="text-lg font-bold flex items-center gap-2 text-black dark:text-white">
                    <div className="w-2 h-2 bg-black dark:bg-white"></div>
                    封面图片 ({coverImages.length}/5)
                  </Label>

                  {/* 添加图片链接 */}
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <Input
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="粘贴图片链接 (https://...)"
                        className="pl-10 border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddImageUrl}
                      disabled={coverImages.length >= 5}
                      className="bw-button font-bold"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      添加
                    </Button>
                  </div>

                  {/* 图片预览 */}
                  {coverImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {coverImages.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="relative aspect-square overflow-hidden border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white dark:bg-black">
                            <Image
                              src={url || "/placeholder.svg"}
                              alt={`封面图片 ${index + 1}`}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = "/placeholder.svg?height=200&width=200"
                              }}
                            />
                            {index === 0 && (
                              <div className="absolute top-2 left-2 bg-black dark:bg-white text-white dark:text-black px-2 py-1 text-xs font-bold">
                                封面
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                              {index > 0 && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => moveImage(index, 0)}
                                  className="text-xs"
                                  type="button"
                                >
                                  设为封面
                                </Button>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              onClick={() => handleRemoveImageUrl(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-2 border-black dark:border-white p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <ImageIcon className="h-4 w-4" />
                      <span className="font-bold">图片说明：</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>第一张图片将作为资源封面显示</li>
                      <li>点击"设为封面"可以更改封面图片</li>
                      <li>建议使用高质量的图片，尺寸比例为16:9或1:1</li>
                      <li>请使用稳定的图床服务，避免图片失效</li>
                    </ul>
                  </div>
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
