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
import { ArrowLeft } from "lucide-react"
import { VideoLinkDetector } from "@/components/video-link-detector"
import { TagBadge } from "@/components/tag-badge" // 导入标签组件

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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href="/posts" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>返回帖子列表</span>
          </Link>
        </Button>

        {isAuthor && <DeletePostButton postId={post.id} variant="destructive" size="sm" showIcon showText />}
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{post.title}</CardTitle>
            </div>
            {/* 显示标签 */}
            {post.tags && <TagBadge tag={post.tags} size="md" />}
            <div className="flex items-center gap-2 mt-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={post.profiles?.avatar_url || ""} alt={post.profiles?.username || "用户"} />
                <AvatarFallback>{(post.profiles?.username || "U").charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">{post.profiles?.username}</span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{formattedDate}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {post.image_url && (
            <div className="mb-6">
              <div className="relative aspect-video w-full overflow-hidden rounded-md">
                <Image src={post.image_url || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
              </div>
            </div>
          )}
          <div className="prose max-w-none dark:prose-invert">
            <VideoLinkDetector content={post.content} />
          </div>
        </CardContent>
      </Card>

      <CommentSection postId={post.id} currentUser={session?.user} />
    </div>
  )
}
