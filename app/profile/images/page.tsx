"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SupabaseImageGallery } from "@/components/supabase-image-gallery"
import { SupabaseImageUpload } from "@/components/supabase-image-upload"
import { useAuth } from "@/components/auth-provider"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function UserImagesPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">我的图片</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>上传新图片</CardTitle>
        </CardHeader>
        <CardContent>
          <SupabaseImageUpload onImageUploaded={() => {}} folderPath="user-images" />
        </CardContent>
      </Card>

      <SupabaseImageGallery folderPath="user-images" />
      <SupabaseImageGallery folderPath="post-images" />
    </div>
  )
}
