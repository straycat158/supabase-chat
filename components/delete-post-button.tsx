"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface DeletePostButtonProps {
  postId: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  showIcon?: boolean
  showText?: boolean
}

export function DeletePostButton({
  postId,
  variant = "ghost",
  size = "icon",
  className = "",
  showIcon = true,
  showText = false,
}: DeletePostButtonProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // 处理删除操作
  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch("/api/posts/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "删除帖子失败")
      }

      toast({
        title: "删除成功",
        description: "帖子已成功删除",
      })

      // 重定向到帖子列表页
      router.push("/posts")
      router.refresh()
    } catch (error: any) {
      console.error("删除帖子时出错:", error)
      toast({
        title: "删除失败",
        description: error.message || "删除帖子时出现错误",
        variant: "destructive",
      })
      // 重置确认状态
      setConfirmDelete(false)
    } finally {
      setIsDeleting(false)
    }
  }

  // 取消删除
  const cancelDelete = () => {
    setConfirmDelete(false)
  }

  // 如果在确认状态，显示确认按钮组
  if (confirmDelete) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground mr-1">确认删除?</span>
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting} className="h-8 px-2">
          {isDeleting ? "删除中..." : <Check className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="sm" onClick={cancelDelete} disabled={isDeleting} className="h-8 px-2">
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  // 默认显示删除按钮
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => setConfirmDelete(true)}
      aria-label="删除帖子"
      type="button"
    >
      {showIcon && <Trash2 className="h-4 w-4" />}
      {showText && <span className={showIcon ? "ml-2" : ""}>删除</span>}
    </Button>
  )
}
