"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      // 修改：使用fetch API直接发送请求，确保包含正确的Content-Type头
      const response = await fetch("/api/posts/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      })

      // 检查响应状态
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "删除帖子失败")
      }

      const data = await response.json()

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
    } finally {
      setIsDeleting(false)
      setIsOpen(false)
    }
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsOpen(true)}
        aria-label="删除帖子"
        type="button"
      >
        {showIcon && <Trash2 className="h-4 w-4" />}
        {showText && <span className={showIcon ? "ml-2" : ""}>删除</span>}
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除这篇帖子吗？此操作无法撤销，帖子及其所有评论将被永久删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "删除中..." : "确认删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
