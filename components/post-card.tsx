"use client"

import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Square, ImageIcon } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { DeletePostButton } from "@/components/delete-post-button"
import { VideoLinkDetector } from "@/components/video-link-detector"

const MotionDiv = motion.div

interface PostCardProps {
  post: any
  className?: string
}

export function PostCard({ post, className }: PostCardProps) {
  const { user } = useAuth()
  const commentCount = Array.isArray(post.comments) ? post.comments.length : 0
  const formattedDate = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: zhCN,
  })

  const isAuthor = user?.id === post.user_id

  // 获取图片信息
  const imageUrls = post.image_urls || (post.image_url ? [post.image_url] : [])
  const coverImage = imageUrls[0] || post.image_url
  const hasMultipleImages = imageUrls.length > 1

  return (
    <MotionDiv
      className="h-full"
      whileHover={{
        y: -8,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={`bw-card h-full overflow-hidden group transition-all duration-300 ${className}`}>
        <div className="flex h-full flex-col relative">
          {/* 几何装饰元素 */}
          <div className="absolute top-4 right-4 z-10">
            <motion.div
              className="w-4 h-4 bg-black dark:bg-white"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
          </div>

          {/* 卡片头部 */}
          <CardHeader className="pb-3 relative">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-3 flex-1">
                <Link href={`/posts/${post.id}`} className="block">
                  <CardTitle className="text-xl font-black leading-tight transition-colors duration-200 hover:text-gray-600 dark:hover:text-gray-400 line-clamp-2">
                    {post.title}
                  </CardTitle>
                </Link>
                {post.tags && (
                  <MotionDiv
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-black dark:bg-white text-white dark:text-black text-xs font-bold tracking-wide">
                      <Square className="h-3 w-3" />
                      {post.tags.name}
                    </div>
                  </MotionDiv>
                )}
              </div>
              {isAuthor && (
                <MotionDiv
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <DeletePostButton
                    postId={post.id}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    showIcon
                  />
                </MotionDiv>
              )}
            </div>
          </CardHeader>

          {/* 图片区域 */}
          {coverImage && (
            <div className="px-6 pb-3">
              <Link href={`/posts/${post.id}`} className="block">
                <MotionDiv
                  className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-900 border-2 border-black dark:border-white"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Image
                    src={coverImage || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105 grayscale group-hover:grayscale-0"
                    sizes="(max-width: 768px) 100vw, (max-width: 900px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* 多图标识 */}
                  {hasMultipleImages && (
                    <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 text-xs font-bold flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" />
                      {imageUrls.length}
                    </div>
                  )}
                </MotionDiv>
              </Link>
            </div>
          )}

          {/* 内容区域 */}
          <CardContent className="flex-grow pb-3">
            <div className="line-clamp-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed break-all whitespace-pre-wrap">
              <VideoLinkDetector content={post.content} />
            </div>
          </CardContent>

          {/* 底部信息 */}
          <CardFooter className="flex items-center justify-between pt-3 border-t-2 border-black dark:border-white">
            <div className="flex items-center gap-3">
              <MotionDiv whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                <Avatar className="h-8 w-8 border-2 border-black dark:border-white">
                  <AvatarImage src={post.profiles?.avatar_url || ""} alt={post.profiles?.username || "用户"} />
                  <AvatarFallback className="text-xs bg-black dark:bg-white text-white dark:text-black font-bold">
                    {(post.profiles?.username || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </MotionDiv>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-black dark:text-white">{post.profiles?.username}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{formattedDate}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MotionDiv
                className="flex items-center gap-1 text-black dark:text-white"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs font-bold">{commentCount}</span>
              </MotionDiv>
            </div>
          </CardFooter>
        </div>
      </Card>
    </MotionDiv>
  )
}

// 保持向后兼容
export default PostCard
