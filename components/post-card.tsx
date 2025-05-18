"use client"

import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, MoreVertical } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { DeletePostButton } from "@/components/delete-post-button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { VideoLinkDetector } from "@/components/video-link-detector"

interface PostCardProps {
  post: any
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth()
  const commentCount = Array.isArray(post.comments) ? post.comments.length : 0
  const formattedDate = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: zhCN,
  })

  // 检查当前用户是否为帖子作者
  const isAuthor = user?.id === post.user_id

  return (
    <motion.div whileHover={{ y: -5, transition: { duration: 0.2 } }} className="h-full">
      <Card className="h-full transition-shadow hover:shadow-md overflow-hidden flex flex-col border-none shadow-md">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Link href={`/posts/${post.id}`} className="block">
              <CardTitle className="text-xl hover:text-primary transition-colors">{post.title}</CardTitle>
            </Link>
            {isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">操作菜单</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild className="text-destructive">
                    <DeletePostButton
                      postId={post.id}
                      variant="ghost"
                      showIcon
                      showText
                      className="w-full justify-start cursor-pointer"
                    />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        {post.image_url && (
          <div className="px-6 pb-2">
            <Link href={`/posts/${post.id}`} className="block">
              <div className="relative aspect-video w-full overflow-hidden rounded-md">
                <Image
                  src={post.image_url || "/placeholder.svg"}
                  alt={post.title}
                  fill
                  className="object-cover image-hover"
                />
              </div>
            </Link>
          </div>
        )}
        <CardContent className="pb-2 flex-grow">
          <div className="line-clamp-2 text-muted-foreground">
            <VideoLinkDetector content={post.content} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={post.profiles?.avatar_url || ""} alt={post.profiles?.username || "用户"} />
              <AvatarFallback>{(post.profiles?.username || "U").charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{post.profiles?.username}</span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm">{commentCount}</span>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
