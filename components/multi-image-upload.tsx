"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Upload, X, ImageIcon } from "lucide-react"
import Image from "next/image"

interface MultiImageUploadProps {
  onImagesUploaded: (urls: string[]) => void
  existingImageUrls?: string[]
  folderPath?: string
  maxImages?: number
}

export function MultiImageUpload({
  onImagesUploaded,
  existingImageUrls = [],
  folderPath = "uploads",
  maxImages = 5,
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>(existingImageUrls)
  const { toast } = useToast()
  const supabase = createClient()

  const uploadImages = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault()

      try {
        setUploading(true)

        if (!event.target.files || event.target.files.length === 0) {
          return
        }

        const files = Array.from(event.target.files)

        // 检查是否超过最大图片数量
        if (imageUrls.length + files.length > maxImages) {
          toast({
            title: "图片数量超限",
            description: `最多只能上传 ${maxImages} 张图片`,
            variant: "destructive",
          })
          return
        }

        const uploadPromises = files.map(async (file) => {
          const fileExt = file.name.split(".").pop()
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
          const filePath = `${folderPath}/${fileName}`

          const { error: uploadError } = await supabase.storage.from("images").upload(filePath, file)

          if (uploadError) {
            throw uploadError
          }

          const {
            data: { publicUrl },
          } = supabase.storage.from("images").getPublicUrl(filePath)

          return publicUrl
        })

        const newUrls = await Promise.all(uploadPromises)
        const updatedUrls = [...imageUrls, ...newUrls]

        setImageUrls(updatedUrls)
        onImagesUploaded(updatedUrls)

        toast({
          title: "上传成功",
          description: `成功上传 ${files.length} 张图片`,
        })
      } catch (error: any) {
        console.error("Error uploading images:", error)
        toast({
          title: "上传失败",
          description: error.message || "图片上传失败，请重试",
          variant: "destructive",
        })
      } finally {
        setUploading(false)
        // 重置文件输入
        if (event.target) {
          event.target.value = ""
        }
      }
    },
    [imageUrls, maxImages, folderPath, onImagesUploaded, supabase, toast],
  )

  const removeImage = useCallback(
    (indexToRemove: number) => {
      const updatedUrls = imageUrls.filter((_, index) => index !== indexToRemove)
      setImageUrls(updatedUrls)
      onImagesUploaded(updatedUrls)
    },
    [imageUrls, onImagesUploaded],
  )

  return (
    <div className="space-y-4">
      <Label className="text-lg font-bold flex items-center gap-2 text-black dark:text-white">
        <div className="w-2 h-2 bg-black dark:bg-white"></div>
        封面图片 ({imageUrls.length}/{maxImages})
      </Label>

      {/* 上传按钮 */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          disabled={uploading || imageUrls.length >= maxImages}
          className="border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-bold"
          onClick={() => document.getElementById("image-upload")?.click()}
        >
          {uploading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin"></div>
              上传中...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              选择图片
            </div>
          )}
        </Button>

        <input
          id="image-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={uploadImages}
          disabled={uploading || imageUrls.length >= maxImages}
          className="hidden"
        />

        <span className="text-sm text-gray-600 dark:text-gray-400">支持 JPG、PNG、GIF 格式</span>
      </div>

      {/* 图片预览 */}
      {imageUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {imageUrls.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square border-2 border-black dark:border-white bg-white dark:bg-black overflow-hidden">
                <Image
                  src={url || "/placeholder.svg"}
                  alt={`上传的图片 ${index + 1}`}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                    target.nextElementSibling?.classList.remove("hidden")
                  }}
                />
                <div className="hidden w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {imageUrls.length === 0 && (
        <div className="border-2 border-dashed border-black dark:border-white p-8 text-center bg-white dark:bg-black">
          <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">还没有上传图片</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">点击上方按钮选择图片</p>
        </div>
      )}
    </div>
  )
}
