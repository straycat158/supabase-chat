"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, X, Upload } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface SupabaseImageUploadProps {
  onImageUploaded: (url: string) => void
  existingImageUrl?: string
  folderPath?: string
}

export function SupabaseImageUpload({
  onImageUploaded,
  existingImageUrl = "",
  folderPath = "post-images",
}: SupabaseImageUploadProps) {
  const supabase = createClient()
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState(existingImageUrl)
  const [previewUrl, setPreviewUrl] = useState(existingImageUrl)
  const [uploadProgress, setUploadProgress] = useState(0)

  const uploadImage = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // 创建预览URL
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      // 生成唯一文件名
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `${folderPath}/${fileName}`

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

    await uploadImage(file)
  }

  const handleRemoveImage = async () => {
    // 如果有图片URL，尝试从URL中提取文件路径并删除
    if (imageUrl) {
      try {
        // 从URL中提取文件路径
        const urlParts = imageUrl.split(`minecraft-forum/`)
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

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
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

    await uploadImage(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div className="space-y-4">
      <Label>图片上传</Label>

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
        <div className="grid w-full items-center gap-1.5" onDrop={handleDrop} onDragOver={handleDragOver}>
          <div className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
            {isUploading ? (
              <div className="flex flex-col items-center justify-center p-4 w-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground mb-2">上传中... {uploadProgress}%</span>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            ) : (
              <Label htmlFor="image" className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">点击或拖拽图片到此处上传</span>
                <span className="mt-1 text-xs text-muted-foreground">支持PNG, JPG, GIF (最大5MB)</span>
              </Label>
            )}
          </div>
          <Input
            id="image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>
      )}
    </div>
  )
}
