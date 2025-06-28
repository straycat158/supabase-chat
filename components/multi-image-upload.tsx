"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, X, Plus, ImageIcon } from 'lucide-react'
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"

interface MultiImageUploadProps {
  onImagesUploaded: (urls: string[]) => void
  existingImageUrls?: string[]
  folderPath?: string
  maxImages?: number
  bucketName?: string
}

export function MultiImageUpload({
  onImagesUploaded,
  existingImageUrls = [],
  folderPath = "post-images",
  maxImages = 5,
  bucketName = "minecraft-forum", // 默认使用旧的存储桶，可以通过props传入新的
}: MultiImageUploadProps) {
  const supabase = createClient()
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>(existingImageUrls)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [bucketReady, setBucketReady] = useState(false)
  const [isCheckingBucket, setIsCheckingBucket] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 检查存储桶是否存在
  useEffect(() => {
    const checkBucket = async () => {
      setIsCheckingBucket(true)
      try {
        // 尝试列出存储桶中的文件来检查存储桶是否存在
        const { data, error } = await supabase.storage.from(bucketName).list("", {
          limit: 1,
        })

        if (error) {
          console.error(`存储桶 ${bucketName} 不存在或无法访问:`, error)
          toast({
            title: "存储桶不存在",
            description: `存储桶 ${bucketName} 不存在，请先创建存储桶`,
            variant: "destructive",
          })
          setBucketReady(false)
        } else {
          console.log(`存储桶 ${bucketName} 可用`)
          setBucketReady(true)
        }
      } catch (error: any) {
        console.error("检查存储桶失败:", error)
        toast({
          title: "存储检查失败",
          description: "无法检查存储桶状态，请刷新页面重试",
          variant: "destructive",
        })
        setBucketReady(false)
      } finally {
        setIsCheckingBucket(false)
      }
    }

    checkBucket()
  }, [supabase, toast, bucketName])

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
    const filePath = `${folderPath}/${fileName}`

    const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      throw error
    }

    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath)
    return publicUrlData.publicUrl
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // 阻止默认行为和事件冒泡
    e.preventDefault()
    e.stopPropagation()

    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // 检查存储桶是否准备就绪
    if (!bucketReady) {
      toast({
        title: "存储未就绪",
        description: "图片存储不可用，请检查存储桶配置",
        variant: "destructive",
      })
      return
    }

    // 检查图片数量限制
    if (imageUrls.length + files.length > maxImages) {
      toast({
        title: "图片数量超限",
        description: `最多只能上传${maxImages}张图片`,
        variant: "destructive",
      })
      // 重置文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const uploadPromises = files.map(async (file, index) => {
        // 检查文件类型
        if (!file.type.startsWith("image/")) {
          throw new Error(`文件 ${file.name} 不是图片格式`)
        }

        // 检查文件大小 (限制为10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`文件 ${file.name} 大小超过10MB`)
        }

        const url = await uploadImage(file)
        setUploadProgress(((index + 1) / files.length) * 100)
        return url
      })

      const newUrls = await Promise.all(uploadPromises)
      const updatedUrls = [...imageUrls, ...newUrls]
      setImageUrls(updatedUrls)
      onImagesUploaded(updatedUrls)

      toast({
        title: "上传成功",
        description: `成功上传${files.length}张图片`,
      })
    } catch (error: any) {
      console.error("上传失败:", error)
      toast({
        title: "上传失败",
        description: error.message || "图片上传失败，请重试",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      // 重置文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveImage = async (index: number, e?: React.MouseEvent) => {
    // 阻止事件冒泡
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    const urlToRemove = imageUrls[index]

    try {
      // 从URL中提取文件路径并删除
      const urlParts = urlToRemove.split(`${bucketName}/`)
      if (urlParts.length > 1) {
        const filePath = urlParts[1]
        const { error } = await supabase.storage.from(bucketName).remove([filePath])
        if (error) {
          console.error("删除文件失败:", error)
        }
      }
    } catch (error) {
      console.error("删除文件时出错:", error)
    }

    const updatedUrls = imageUrls.filter((_, i) => i !== index)
    setImageUrls(updatedUrls)
    onImagesUploaded(updatedUrls)
  }

  const moveImage = (fromIndex: number, toIndex: number, e?: React.MouseEvent) => {
    // 阻止事件冒泡
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    const updatedUrls = [...imageUrls]
    const [movedItem] = updatedUrls.splice(fromIndex, 1)
    updatedUrls.splice(toIndex, 0, movedItem)
    setImageUrls(updatedUrls)
    onImagesUploaded(updatedUrls)
  }

  const handleUploadClick = (e: React.MouseEvent) => {
    // 阻止事件冒泡
    e.preventDefault()
    e.stopPropagation()

    if (!bucketReady) {
      toast({
        title: "存储未就绪",
        description: "图片存储不可用，请检查存储桶配置",
        variant: "destructive",
      })
      return
    }

    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-4">
      <Label className="text-lg font-bold flex items-center gap-2">
        <div className="w-2 h-2 bg-black dark:bg-white"></div>
        图片上传 ({imageUrls.length}/{maxImages})
        {isCheckingBucket && (
          <div className="ml-2 flex items-center gap-1 text-sm text-gray-500">
            <Loader2 className="h-3 w-3 animate-spin" />
            检查存储桶...
          </div>
        )}
        {!bucketReady && !isCheckingBucket && (
          <div className="ml-2 text-sm text-red-500">
            存储桶不可用
          </div>
        )}
      </Label>

      {/* 存储桶信息 */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        使用存储桶: <span className="font-mono">{bucketName}</span>
      </div>

      {/* 图片预览网格 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <AnimatePresence>
          {imageUrls.map((url, index) => (
            <motion.div
              key={url}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative group"
            >
              <div className="relative aspect-square overflow-hidden border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white dark:bg-black">
                <Image src={url || "/placeholder.svg"} alt={`图片 ${index + 1}`} fill className="object-cover" />
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
                      onClick={(e) => moveImage(index, 0, e)}
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
                  onClick={(e) => handleRemoveImage(index, e)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 上传按钮 */}
        {imageUrls.length < maxImages && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative">
            <div
              className={`aspect-square border-2 border-dashed border-black dark:border-white bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col items-center justify-center cursor-pointer group ${
                bucketReady && !isUploading
                  ? "hover:bg-gray-100 dark:hover:bg-gray-800"
                  : "opacity-50 cursor-not-allowed"
              }`}
              onClick={handleUploadClick}
            >
              {isCheckingBucket ? (
                <div className="flex flex-col items-center justify-center p-4">
                  <Loader2 className="h-8 w-8 animate-spin text-black dark:text-white mb-2" />
                  <span className="text-sm text-black dark:text-white font-bold">检查存储桶...</span>
                </div>
              ) : isUploading ? (
                <div className="flex flex-col items-center justify-center p-4">
                  <Loader2 className="h-8 w-8 animate-spin text-black dark:text-white mb-2" />
                  <span className="text-sm text-black dark:text-white font-bold mb-2">
                    上传中... {Math.round(uploadProgress)}%
                  </span>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 border-2 border-black dark:border-white flex items-center justify-center group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors duration-200">
                    <Plus className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-bold text-center text-black dark:text-white">
                    {bucketReady ? "添加图片" : "存储不可用"}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400 text-center">最大10MB</span>
                </div>
              )}
            </div>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading || !bucketReady}
            />
          </motion.div>
        )}
      </div>

      {imageUrls.length > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-2 border-black dark:border-white p-3">
          <div className="flex items-center gap-2 mb-1">
            <ImageIcon className="h-4 w-4" />
            <span className="font-bold">图片说明：</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>第一张图片将作为帖子封面显示</li>
            <li>点击"设为封面"可以更改封面图片</li>
            <li>在帖子详情页可以查看所有图片</li>
          </ul>
        </div>
      )}
    </div>
  )
}
