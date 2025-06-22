import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CommentSection } from "@/components/comment-section"
import { DeletePostButton } from "@/components/delete-post-button"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Calendar, MessageSquare, User } from "lucide-react"
import { VideoLinkDetector } from "@/components/video-link-detector"
import { TagBadge } from "@/components/tag-badge"
import { ImageGallery } from "@/components/image-gallery"

export const revalidate = 0

interface PostPageProps {
  params: {
    id: string
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { data: post, error } = await supabase
    .from("posts")
    .select(`
      *,
      profiles:user_id (id, username, avatar_url),
      tags:tag_id (*)
    `)
    .eq("id", params.id)
    .single()

  if (error || !post) {
    notFound()
  }

  const formattedDate = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: zhCN,
  })

  const isAuthor = session?.user.id === post.user_id

  // 获取图片信息 - 只有真正有图片时才显示
  const imageUrls = post.image_urls || (post.image_url ? [post.image_url] : [])
  const validImageUrls = imageUrls.filter((url: string) => url && url !== "/placeholder.svg")
  const coverImage = validImageUrls[0]
  const hasImages = validImageUrls.length > 0

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-4xl mx-auto space-y-8 pb-8">
        {/* 返回按钮 - 黑白几何风格 */}
        <div className="flex items-center justify-between pt-6">
          <Button variant="outline" size="sm" asChild className="bw-button-outline font-bold">
            <Link href="/posts" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>返回帖子列表</span>
            </Link>
          </Button>

          {isAuthor && (
            <DeletePostButton
              postId={post.id}
              variant="destructive"
              size="sm"
              showIcon
              showText
              className="bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-bold border-2 border-black dark:border-white"
            />
          )}
        </div>

        {/* 帖子卡片 - 黑白几何风格 */}
        <Card className="bw-card overflow-hidden">
          <div className="h-4 bg-black dark:bg-white" />

          <CardHeader className="bg-gray-50 dark:bg-gray-950 border-b-2 border-black dark:border-white">
            <div className="flex flex-col gap-6">
              <div className="flex items-start justify-between">
                <CardTitle className="text-4xl font-black text-black dark:text-white leading-tight">
                  {post.title}
                </CardTitle>
              </div>

              {post.tags && (
                <div className="flex items-center gap-2">
                  <TagBadge tag={post.tags} size="md" />
                </div>
              )}

              <div className="flex items-center gap-4 p-6 bg-white dark:bg-black border-2 border-black dark:border-white">
                <Avatar className="h-16 w-16 border-2 border-black dark:border-white">
                  <AvatarImage src={post.profiles?.avatar_url || ""} alt={post.profiles?.username || "用户"} />
                  <AvatarFallback className="bg-gray-100 dark:bg-gray-900 text-black dark:text-white font-black text-xl">
                    {(post.profiles?.username || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-black dark:text-white" />
                    <span className="font-black text-xl text-black dark:text-white">{post.profiles?.username}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span className="font-bold">{formattedDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {/* 封面图片 - 只有真正有图片时才显示 */}
            {coverImage && (
              <div className="mb-8">
                <div className="relative w-full max-w-4xl mx-auto overflow-hidden border-4 border-black dark:border-white bg-gray-100 dark:bg-gray-900">
                  <Image
                    src={coverImage || "/placeholder.svg"}
                    alt={post.title}
                    width={800}
                    height={450}
                    className="w-full h-auto object-contain max-h-[500px]"
                    priority
                  />
                </div>
              </div>
            )}

            {/* 文字内容 - 黑白风格 */}
            <div className="text-black dark:text-white leading-relaxed whitespace-pre-wrap break-words text-lg font-medium mb-8">
              <VideoLinkDetector content={post.content} />
            </div>

            {/* 图片画廊 - 只有真正有图片时才显示 */}
            {hasImages && <ImageGallery images={validImageUrls} />}
          </CardContent>
        </Card>

        {/* 评论区 - 黑白几何风格 */}
        <div className="bw-card p-8">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-black dark:border-white">
            <div className="w-8 h-8 bg-black dark:bg-white flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-white dark:text-black" />
            </div>
            <h2 className="text-2xl font-black text-black dark:text-white">评论讨论</h2>
          </div>
          <CommentSection postId={post.id} currentUser={session?.user} />
        </div>
      </div>
    </div>
  )
}
