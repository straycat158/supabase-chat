"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { TagBadge } from "@/components/tag-badge"
import { Trash2, Edit, Plus } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Tag } from "@/lib/types/database"

export default function TagsAdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const { user, isLoading: isAuthLoading } = useAuth()

  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    color: "",
    icon: "",
  })

  // 检查用户权限
  useEffect(() => {
    if (!isAuthLoading && !user) {
      toast({
        title: "访问受限",
        description: "您需要登录才能访问此页面",
        variant: "destructive",
      })
      router.push("/login")
    }
  }, [user, isAuthLoading, router, toast])

  // 获取所有标签
  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase.from("tags").select("*").order("name")

        if (error) throw error
        setTags(data || [])
      } catch (error: any) {
        toast({
          title: "获取标签失败",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchTags()
    }
  }, [user, supabase, toast])

  // 处理表单输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // 如果是name字段，自动生成slug
    if (name === "name" && !editingTag) {
      setFormData({
        ...formData,
        name: value,
        slug: value
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  // 打开编辑对话框
  const openEditDialog = (tag: Tag) => {
    setEditingTag(tag)
    setFormData({
      name: tag.name,
      slug: tag.slug,
      description: tag.description || "",
      color: tag.color || "",
      icon: tag.icon || "",
    })
    setIsDialogOpen(true)
  }

  // 打开新建对话框
  const openNewDialog = () => {
    setEditingTag(null)
    setFormData({
      name: "",
      slug: "",
      description: "",
      color: "",
      icon: "",
    })
    setIsDialogOpen(true)
  }

  // 关闭对话框
  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingTag(null)
  }

  // 提交表单
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (editingTag) {
        // 更新标签
        const { error } = await supabase
          .from("tags")
          .update({
            name: formData.name,
            slug: formData.slug,
            description: formData.description || null,
            color: formData.color || null,
            icon: formData.icon || null,
          })
          .eq("id", editingTag.id)

        if (error) throw error

        toast({
          title: "更新成功",
          description: "标签已成功更新",
        })

        // 更新本地标签列表
        setTags(
          tags.map((tag) =>
            tag.id === editingTag.id
              ? {
                  ...tag,
                  ...formData,
                  description: formData.description || null,
                  color: formData.color || null,
                  icon: formData.icon || null,
                }
              : tag,
          ),
        )
      } else {
        // 创建新标签
        const { data, error } = await supabase
          .from("tags")
          .insert({
            name: formData.name,
            slug: formData.slug,
            description: formData.description || null,
            color: formData.color || null,
            icon: formData.icon || null,
          })
          .select()

        if (error) throw error

        toast({
          title: "创建成功",
          description: "标签已成功创建",
        })

        // 更新本地标签列表
        if (data && data[0]) {
          setTags([...tags, data[0]])
        }
      }

      closeDialog()
    } catch (error: any) {
      toast({
        title: editingTag ? "更新失败" : "创建失败",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 删除标签
  const handleDelete = async (tagId: string) => {
    if (!confirm("确定要删除此标签吗？这将影响所有使用此标签的帖子。")) {
      return
    }

    try {
      const { error } = await supabase.from("tags").delete().eq("id", tagId)

      if (error) throw error

      toast({
        title: "删除成功",
        description: "标签已成功删除",
      })

      // 更新本地标签列表
      setTags(tags.filter((tag) => tag.id !== tagId))
    } catch (error: any) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p>正在检查登录状态...</p>
      </div>
    )
  }

  if (!user) {
    return null // 将由useEffect处理重定向
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>标签管理</CardTitle>
              <CardDescription>创建和管理Minecraft论坛的标签</CardDescription>
            </div>
            <Button onClick={openNewDialog}>
              <Plus className="h-4 w-4 mr-2" />
              新建标签
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p>加载中...</p>
            </div>
          ) : tags.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>标签名称</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>预览</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell className="font-medium">{tag.name}</TableCell>
                    <TableCell>{tag.slug}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{tag.description || "-"}</TableCell>
                    <TableCell>
                      <TagBadge tag={tag} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(tag)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(tag.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">暂无标签，点击"新建标签"按钮创建第一个标签</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 标签编辑/创建对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingTag ? "编辑标签" : "创建新标签"}</DialogTitle>
            <DialogDescription>{editingTag ? "修改标签信息" : "创建一个新的标签分类"}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  标签名称
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="slug" className="text-right">
                  Slug
                </Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  描述
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="color" className="text-right">
                  颜色
                </Label>
                <Input
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="col-span-3"
                  placeholder="例如: bg-blue-100 text-blue-800"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="icon" className="text-right">
                  图标
                </Label>
                <Input
                  id="icon"
                  name="icon"
                  value={formData.icon}
                  onChange={handleChange}
                  className="col-span-3"
                  placeholder="Lucide图标名称"
                />
              </div>
              <div className="col-span-4">
                <div className="flex justify-center py-2">
                  <div className="border rounded p-4">
                    <p className="text-sm text-center mb-2">预览</p>
                    <TagBadge
                      tag={{
                        id: "preview",
                        name: formData.name || "标签名称",
                        slug: formData.slug || "tag-slug",
                        color: formData.color || null,
                        icon: formData.icon || null,
                      }}
                      size="md"
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog} disabled={isSubmitting}>
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "保存中..." : "保存"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
