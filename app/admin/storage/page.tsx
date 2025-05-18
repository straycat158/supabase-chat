"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { SupabaseImageUpload } from "@/components/supabase-image-upload"
import { SupabaseImageGallery } from "@/components/supabase-image-gallery"
import { Loader2 } from "lucide-react"

export default function StorageAdminPage() {
  const { toast } = useToast()
  const [isInitializing, setIsInitializing] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState("")

  const handleInitStorage = async () => {
    setIsInitializing(true)
    try {
      const response = await fetch("/api/storage/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "初始化存储失败")
      }

      toast({
        title: "初始化成功",
        description: data.message,
      })
    } catch (error: any) {
      toast({
        title: "初始化失败",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  const handleImageUploaded = (url: string) => {
    setUploadedImageUrl(url)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">存储管理</h1>

      <Card>
        <CardHeader>
          <CardTitle>初始化存储</CardTitle>
          <CardDescription>创建并配置Supabase存储桶</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            点击下面的按钮初始化Minecraft论坛的存储桶。这将创建一个公共存储桶，用于存储用户上传的图片。
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleInitStorage} disabled={isInitializing}>
            {isInitializing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                初始化中...
              </>
            ) : (
              "初始化存储桶"
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>测试上传</CardTitle>
          <CardDescription>测试图片上传功能</CardDescription>
        </CardHeader>
        <CardContent>
          <SupabaseImageUpload onImageUploaded={handleImageUploaded} />

          {uploadedImageUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">上传成功！图片URL:</p>
              <code className="block p-2 bg-muted rounded-md text-xs overflow-auto">{uploadedImageUrl}</code>
            </div>
          )}
        </CardContent>
      </Card>

      <SupabaseImageGallery />
    </div>
  )
}
