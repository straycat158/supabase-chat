"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Trash2, Copy } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export function UserImages() {
  const supabase = createClient()
  const { toast } = useToast()
  const { user } = useAuth()
  const [images, setImages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchImages = async () => {
      setIsLoading(true)
      try {
        // 获取用户上传的图片
        const { data, error } = await supabase.storage.from("minecraft-forum").list(`post-images`, {
          limit: 100,
          offset: 0,
          sortBy: { column: "created_at", order: "desc" },
        })

        if (error) {
          throw error
        }

        // 只保留图片文件
        const imageFiles = data.filter((file) => file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))

        // 获取每个图片的URL
        const imagesWithUrls = await Promise.all(
          imageFiles.map(async (file) => {
            const { data: urlData } = supabase.storage.from("minecraft-forum").getPublicUrl(`post-images/${file.name}`)

            return {
              ...file,
              url: urlData.publicUrl,
            }
          }),
        )

        setImages(imagesWithUrls)
      } catch (error: any) {
        console.error("获取图片失败:", error)
        toast({
          title: "获取图片失败",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchImages()
  }, [user, supabase, toast])

  const handleDeleteImage = async (fileName: string) => {
    try {
      const { error } = await supabase.storage.from("minecraft-forum").remove([`post-images/${fileName}`])

      if (error) {
        throw error
      }

      // 更新图片列表
      setImages(images.filter((image) => image.name !== fileName))

      toast({
        title: "删除成功",
        description: "图片已成功删除",
      })
    } catch (error: any) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast({
      title: "已复制",
      description: "图片链接已复制到剪贴板",
    })
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-muted-foreground">请先登录以查看您的图片</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>我的图片</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.name} className="relative group">
                <div className="aspect-square relative overflow-hidden rounded-md border border-border">
                  <Image src={image.url || "/placeholder.svg"} alt={image.name} fill className="object-cover" />
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white"
                    onClick={() => handleCopyUrl(image.url)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white"
                    onClick={() => handleDeleteImage(image.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">您还没有上传任何图片</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
