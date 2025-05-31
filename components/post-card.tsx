"use client"

import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { DeletePostButton } from "@/components/delete-post-button"
import { VideoLinkDetector } from "@/components/video-link-detector"
import { TagBadge } from "@/components/tag-badge"

const MotionDiv = motion.div

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

  const isAuthor = user?.id === post.user_id

  return (
    <MotionDiv
      className="h-full"
      whileHover={{
        y: -4,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* ✅ 新增包裹容器：用于限制渐变边框绝对定位元素的撑宽问题 */}
      <div className="relative overflow-hidden rounded-lg">
        {/* ✅ 修改渐变边框层：加上 pointer-events-none，防止遮挡交互；保持 absolute 不变 */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 p-[1px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
          <div className="h-full w-full rounded-lg bg-white dark:bg-gray-900" />
        </div>

        {/* ✅ 将 Card 本体提升为 z-10，并相对定位，避免与边框干扰 */}
        <Card className="group h-full overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10 dark:bg-gray-900/80 dark:hover:shadow-green-400/5 relative z-10">
          <div className="flex h-full flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-3 flex-1">
                  <Link href={`/posts/${post.id}`} className="block">
                    <CardTitle className="text-lg leading-tight transition-colors duration-200 hover:text-green-600 dark:hover:text-green-400 line-clamp-2">
                      {post.title}
                    </CardTitle>
                  </Link>
                  {post.tags && (
                    <MotionDiv
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <TagBadge tag={post.tags} asLink size="sm" />
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

            {post.image_url && (
              <div className="px-6 pb-3">
                <Link href={`/posts/${post.id}`} className="block">
                  <MotionDiv
                    className="relative aspect-video w-100xp overflow-hidden rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Image
                      src={post.image_url || "/placeholder.svg"}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 900px) 50vw, 33vw"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </MotionDiv>
                </Link>
              </div>
            )}

            <CardContent className="flex-grow pb-3">
              <div className="line-clamp-3 text-sm text-muted-foreground leading-relaxed">
                <VideoLinkDetector content={post.content} />
              </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between pt-3 border-t border-green-100 dark:border-green-800/30">
              <div className="flex items-center gap-3">
                <MotionDiv whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                  <Avatar className="h-7 w-7 ring-2 ring-green-200 dark:ring-green-800">
                    <AvatarImage src={post.profiles?.avatar_url || ""} alt={post.profiles?.username || "用户"} />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 dark:from-green-900 dark:to-emerald-900 dark:text-green-300">
                      {(post.profiles?.username || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </MotionDiv>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">
                    {post.profiles?.username}
                  </span>
                  <span className="text-xs text-muted-foreground">{formattedDate}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MotionDiv
                  className="flex items-center gap-1 text-muted-foreground"
                  whileHover={{ scale: 1.1, color: "#10b981" }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-xs font-medium">{commentCount}</span>
                </MotionDiv>
              </div>
            </CardFooter>
          </div>
        </Card>
      </div>
    </MotionDiv>
  )
}