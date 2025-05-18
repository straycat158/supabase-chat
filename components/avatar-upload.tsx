"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, X, Upload, Camera } from "lucide-react"

interface AvatarUploadProps {
  userId: string
  currentAvatarUrl?: string | null
  username?: string
  onAvatarUploaded: (url: string) => void
  size?: "sm" | "md" | "lg" | "xl"
}

export function AvatarUpload({
  userId,
  currentAvatarUrl,
  username = "用户",
  onAvatarUploaded,
  size = "lg",
}: AvatarUploadProps) {
  const supabase = createClient()
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl || null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  // 根据size设置头像大小
  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
    xl: "h-40 w-40",
  }

  // 初始化时设置头像URL
  useEffect(() => {
    if (currentAvatarUrl) {
      setAvatarUrl(currentAvatarUrl)
      setPreviewUrl(currentAvatarUrl)
    }
  }, [currentAvatarUrl])

  // 上传头像
  const uploadAvatar = async (file: File) => {
    if (!userId) {
      toast({
        title: "错误",
        description: "用户ID不存在",
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
      const fileName = `${userId}_${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // 上传到Supabase Storage
      const { data, error } = await supabase.storage.from("minecraft-forum").upload(filePath, file, {
        cacheControl: "3600",
        upsert: true, // 覆盖同名文件
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
      setAvatarUrl(publicUrl)

      // 更新用户资料
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId)

      if (updateError) {
        throw updateError
      }

      // 回调通知父组件
      onAvatarUploaded(publicUrl)

      toast({
        title: "上传成功",
        description: "头像已成功更新",
      })
    } catch (error: any) {
      toast({
        title: "上传失败",
        description: error.message,
        variant: "destructive",
      })
      // 恢复之前的头像
      setPreviewUrl(avatarUrl)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  // 处理文件选择
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

    // 检查文件大小 (限制为2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "文件过大",
        description: "头像大小不能超过2MB",
        variant: "destructive",
      })
      return
    }

    await uploadAvatar(file)
  }

  // 处理拖放
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

    // 检查文件大小 (限制为2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "文件过大",
        description: "头像大小不能超过2MB",
        variant: "destructive",
      })
      return
    }

    await uploadAvatar(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  // 删除头像
  const handleRemoveAvatar = async () => {
    if (!avatarUrl) return

    try {
      // 从URL中提取文件路径
      const urlParts = avatarUrl.split("minecraft-forum/")
      if (urlParts.length > 1) {
        const filePath = urlParts[1]
        // 删除文件
        await supabase.storage.from("minecraft-forum").remove([filePath])
      }

      // 更新用户资料，设置头像为null
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", userId)

      if (updateError) {
        throw updateError
      }

      setAvatarUrl(null)
      setPreviewUrl(null)
      onAvatarUploaded("")

      toast({
        title: "删除成功",
        description: "头像已成功删除",
      })
    } catch (error: any) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div
        className="relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {/* 头像显示 */}
        <Avatar className={`${sizeClasses[size]} border-4 border-background shadow-md`}>
          <AvatarImage src={previewUrl || ""} alt={username} />
          <AvatarFallback className="text-2xl bg-primary/10 text-primary">
            {username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* 上传中状态 */}
        {isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-full">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
            <div className="mt-2 w-16 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300 ease-in-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* 悬停状态 - 显示上传按钮 */}
        {!isUploading && isHovering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <label htmlFor="avatar-upload" className="cursor-pointer">
              <Camera className="h-8 w-8 text-white" />
            </label>
          </div>
        )}

        {/* 文件输入 */}
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.getElementById("avatar-upload")?.click()}
          disabled={isUploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          更换头像
        </Button>
        {avatarUrl && (
          <Button type="button" variant="outline" size="sm" onClick={handleRemoveAvatar} disabled={isUploading}>
            <X className="h-4 w-4 mr-2" />
            删除头像
          </Button>
        )}
      </div>

      {/* 提示信息 */}
      <p className="text-xs text-muted-foreground text-center">
        支持JPG、PNG格式，最大2MB
        <br />
        推荐使用正方形图片
      </p>
    </div>
  )
}
