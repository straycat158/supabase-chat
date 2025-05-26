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

  // 检查当前用户是否为帖子作者
  const isAuthor = session?.user.id === post.user_id

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20">
      <div className="max-w-4xl mx-auto space-y-8 pb-8">
        {/* 返回按钮 */}
        <div className="flex items-center justify-between pt-6">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-green-200 hover:bg-green-50 hover:border-green-300 dark:border-green-800 dark:hover:bg-green-950/20"
          >
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
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            />
          )}
        </div>

        {/* 主要内容卡片 */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-2xl overflow-hidden">
          {/* 渐变装饰 */}
          <div className="h-2 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400" />

          <CardHeader className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/10 dark:to-emerald-950/10">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <CardTitle className="text-3xl font-bold text-green-800 dark:text-green-200 leading-tight">
                  {post.title}
                </CardTitle>
              </div>

              {/* 标签显示 */}
              {post.tags && (
                <div className="flex items-center gap-2">
                  <TagBadge tag={post.tags} size="md" />
                </div>
              )}

              {/* 作者信息 */}
              <div className="flex items-center gap-4 p-4 bg-white/60 dark:bg-gray-900/60 rounded-xl border border-green-200/50 dark:border-green-800/50">
                <Avatar className="h-12 w-12 ring-2 ring-green-300 dark:ring-green-700">
                  <AvatarImage src={post.profiles?.avatar_url || ""} alt={post.profiles?.username || "用户"} />
                  <AvatarFallback className="bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 dark:from-green-900 dark:to-emerald-900 dark:text-green-300">
                    {(post.profiles?.username || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-green-800 dark:text-green-200">{post.profiles?.username}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {/* 图片显示 - 添加尺寸控制 */}
            {post.image_url && (
              <div className="mb-8">
                <div className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 shadow-lg">
                  <Image
                    src={post.image_url || "/placeholder.svg"}
                    alt={post.title}
                    width={800}
                    height={450}
                    className="w-full h-auto object-contain max-h-[500px]"
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      objectFit: "contain",
                    }}
                    priority
                  />
                </div>
              </div>
            )}

            {/* 内容 */}
            <div className="prose prose-lg max-w-none dark:prose-invert prose-green">
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                <VideoLinkDetector content={post.content} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 评论区域 */}
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-green-200/50 dark:border-green-800/50 p-6">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h2 className="text-xl font-semibold text-green-800 dark:text-green-200">评论讨论</h2>
          </div>
          <CommentSection postId={post.id} currentUser={session?.user} />
        </div>
      </div>
    </div>
  )
}
