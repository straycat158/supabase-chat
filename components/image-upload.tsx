"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, X } from "lucide-react"

interface ImageUploadProps {
  onImageUploaded: (url: string) => void
  existingImageUrl?: string
}

export function ImageUpload({ onImageUploaded, existingImageUrl }: ImageUploadProps) {
  const supabase = createClient()
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState(existingImageUrl || "")
  const [previewUrl, setPreviewUrl] = useState(existingImageUrl || "")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [bucketExists, setBucketExists] = useState(false)

  // 检查存储桶是否存在
  useEffect(() => {
    const checkBucket = async () => {
      try {
        // 尝试列出存储桶中的文件，如果成功则存储桶存在
        const { data, error } = await supabase.storage.from("minecraft-forum").list()

        if (error && error.message.includes("does not exist")) {
          console.warn("存储桶不存在，尝试创建...")
          await createBucket()
        } else {
          setBucketExists(true)
        }
      } catch (error) {
        console.error("检查存储桶失败:", error)
      }
    }

    checkBucket()
  }, [supabase])

  // 更新创建存储桶的方法，使用API路由
  const createBucket = async () => {
    try {
      const response = await fetch("/api/storage/create-bucket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "创建存储桶失败")
      }

      setBucketExists(true)
    } catch (error: any) {
      console.error("创建存储桶失败:", error)
      toast({
        title: "存储配置错误",
        description: "无法配置图片存储，请联系管理员",
        variant: "destructive",
      })
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 检查文件类型
    if (!file.type.startsWith("image/")) {
      toast({
        title: "文件类型错误",
        description: "请上传图片文件",
        variant: "destructive",
      })
      return
    }

    // 检查文件大小 (限制为5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "文件过大",
        description: "图片大小不能超过5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // 创建预览URL
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      // 生成唯一文件名
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `post-images/${fileName}`

      // 上传到Supabase Storage
      const { data, error } = await supabase.storage.from("minecraft-forum").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        onUploadProgress: (progress) => {
          const percent = Math.round((progress.loaded / progress.total) * 100)
          setUploadProgress(percent)
        },
      })

      if (error) {
        throw error
      }

      // 获取公共URL
      const { data: publicUrlData } = supabase.storage.from("minecraft-forum").getPublicUrl(filePath)

      const publicUrl = publicUrlData.publicUrl
      setImageUrl(publicUrl)
      onImageUploaded(publicUrl)

      toast({
        title: "上传成功",
        description: "图片已成功上传",
      })
    } catch (error: any) {
      toast({
        title: "上传失败",
        description: error.message,
        variant: "destructive",
      })
      // 清除预览
      setPreviewUrl("")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleRemoveImage = async () => {
    // 如果有图片URL，尝试从URL中提取文件路径并删除
    if (imageUrl) {
      try {
        // 从URL中提取文件路径
        const urlParts = imageUrl.split("minecraft-forum/")
        if (urlParts.length > 1) {
          const filePath = urlParts[1]
          // 删除文件
          const { error } = await supabase.storage.from("minecraft-forum").remove([filePath])
          if (error) {
            console.error("删除文件失败:", error)
          }
        }
      } catch (error) {
        console.error("删除文件时出错:", error)
      }
    }

    setImageUrl("")
    setPreviewUrl("")
    onImageUploaded("")
  }

  const handleDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return

    const file = e.dataTransfer.files[0]

    // 检查文件类型
    if (!file.type.startsWith("image/")) {
      toast({
        title: "文件类型错误",
        description: "请上传图片文件",
        variant: "destructive",
      })
      return
    }

    // 检查文件大小 (限制为5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "文件过大",
        description: "图片大小不能超过5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // 创建预览URL
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      // 生成唯一文件名
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `post-images/${fileName}`

      // 上传到Supabase Storage
      const { data, error } = await supabase.storage.from("minecraft-forum").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        onUploadProgress: (progress) => {
          const percent = Math.round((progress.loaded / progress.total) * 100)
          setUploadProgress(percent)
        },
      })

      if (error) {
        throw error
      }

      // 获取公共URL
      const { data: publicUrlData } = supabase.storage.from("minecraft-forum").getPublicUrl(filePath)

      const publicUrl = publicUrlData.publicUrl
      setImageUrl(publicUrl)
      onImageUploaded(publicUrl)

      toast({
        title: "上传成功",
        description: "图片已成功上传",
      })
    } catch (error: any) {
      toast({
        title: "上传失败",
        description: error.message,
        variant: "destructive",
      })
      // 清除预览
      setPreviewUrl("")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div className="space-y-4">
      <Label htmlFor="image">图片（可选）</Label>

      {previewUrl ? (
        <div className="relative">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
            <Image src={previewUrl || "/placeholder.svg"} alt="预览图片" fill className="object-cover" />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="grid w-full items-center gap-1.5">
          <Label
            htmlFor="image"
            className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {isUploading ? (
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="mt-2 text-sm text-muted-foreground">上传中... {uploadProgress}%</span>
                <div className="w-48 h-2 bg-muted mt-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-in-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <span className="text-sm text-muted-foreground">点击或拖拽图片到此处上传</span>
                <span className="mt-1 text-xs text-muted-foreground">支持PNG, JPG, GIF (最大5MB)</span>
              </div>
            )}
          </Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading || !bucketExists}
          />
        </div>
      )}
    </div>
  )
}
