"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Trash2 } from "lucide-react"

interface CommentSectionProps {
  postId: string
  currentUser: any
}

export function CommentSection({ postId, currentUser }: CommentSectionProps) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [commentContent, setCommentContent] = useState("")

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          *,
          profiles:user_id (id, username, avatar_url)
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error fetching comments:", error)
      } else {
        setComments(data || [])
      }
      setIsLoading(false)
    }

    fetchComments()

    // 实时订阅评论变化
    const channel = supabase
      .channel(`comments:${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            // 获取新评论的完整信息（包括用户资料）
            const { data: newComment } = await supabase
              .from("comments")
              .select(`
                *,
                profiles:user_id (id, username, avatar_url)
              `)
              .eq("id", payload.new.id)
              .single()

            if (newComment) {
              setComments((prev) => {
                // 检查是否已存在该评论，避免重复添加
                const exists = prev.some((comment) => comment.id === newComment.id)
                if (exists) return prev
                return [...prev, newComment]
              })
            }
          } else if (payload.eventType === "DELETE") {
            setComments((prev) => prev.filter((comment) => comment.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [postId, supabase])

  const handleSubmitComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!currentUser) {
      toast({
        title: "请先登录",
        description: "您需要登录才能发表评论",
        variant: "destructive",
      })
      return
    }

    if (!commentContent.trim()) return

    setIsSubmitting(true)

    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          content: commentContent,
          post_id: postId,
          user_id: currentUser.id,
        })
        .select(`
        *,
        profiles:user_id (id, username, avatar_url)
      `)
        .single()

      if (error) {
        throw error
      }

      // 立即更新本地评论列表
      setComments((prev) => [...prev, data])
      setCommentContent("")

      toast({
        title: "评论成功",
        description: "您的评论已发布",
      })
    } catch (error: any) {
      toast({
        title: "评论失败",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!currentUser) return

    try {
      const { error } = await supabase.from("comments").delete().eq("id", commentId).eq("user_id", currentUser.id)

      if (error) {
        throw error
      }

      // 立即更新本地评论列表
      setComments((prev) => prev.filter((comment) => comment.id !== commentId))

      toast({
        title: "删除成功",
        description: "评论已删除",
      })
    } catch (error: any) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>评论</CardTitle>
        </CardHeader>
        <CardContent>
          {currentUser ? (
            <form onSubmit={handleSubmitComment}>
              <div className="space-y-4">
                <Textarea
                  placeholder="写下您的评论..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting || !commentContent.trim()}>
                    {isSubmitting ? "发布中..." : "发布评论"}
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">请先登录以发表评论</p>
              <Button asChild className="mt-2">
                <a href="/login">登录</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-4">
          <p className="text-muted-foreground">加载评论中...</p>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={comment.profiles?.avatar_url || ""}
                        alt={comment.profiles?.username || "用户"}
                      />
                      <AvatarFallback>{(comment.profiles?.username || "U").charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{comment.profiles?.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: zhCN })}
                    </span>
                  </div>
                  {currentUser && currentUser.id === comment.user_id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">删除评论</span>
                    </Button>
                  )}
                </div>
                <div className="mt-2 pl-8">
                  <p className="text-sm">{comment.content}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground">还没有评论，成为第一个评论的人吧！</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
