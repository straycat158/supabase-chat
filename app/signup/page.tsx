"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Square } from "lucide-react"
// 导入头像上传组件
import { AvatarUpload } from "@/components/avatar-upload"
import { motion } from "framer-motion"

export default function SignUp() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  // 在formData状态中添加avatarUrl
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    avatarUrl: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 在handleSubmit函数中，修改signUp调用以包含avatarUrl
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            avatar_url: formData.avatarUrl,
          },
        },
      })

      if (error) {
        throw error
      }

      toast({
        title: "注册成功",
        description: "请检查您的邮箱以确认注册",
      })

      router.push("/login")
    } catch (error: any) {
      toast({
        title: "注册失败",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center relative overflow-hidden py-8">
      {/* 几何背景 */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-28 h-28 border-4 border-black dark:border-white opacity-10"></div>
        <div className="absolute bottom-32 left-16 w-20 h-20 bg-black dark:bg-white transform rotate-45 opacity-10"></div>
        <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-black dark:bg-white rounded-full opacity-10"></div>
        <div className="absolute bottom-16 right-16 w-24 h-24 border-4 border-black dark:border-white transform rotate-12 opacity-10"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
        <CardHeader className="space-y-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex justify-center"
          >
            <div className="w-16 h-16 bg-black dark:bg-white flex items-center justify-center">
              <Square className="h-8 w-8 text-white dark:text-black" />
            </div>
          </motion.div>
          <CardTitle className="text-3xl font-black text-black dark:text-white">创建账户</CardTitle>
          <CardDescription className="text-lg font-medium text-gray-600 dark:text-gray-400">
            输入您的信息以创建账户
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* 头像上传区域 */}
            <div className="space-y-3 flex flex-col items-center">
              <div className="p-4 border-2 border-black dark:border-white bg-gray-50 dark:bg-gray-900">
                <AvatarUpload
                  userId="temp"
                  username={formData.username || "新用户"}
                  onAvatarUploaded={(url) => {
                    setFormData({
                      ...formData,
                      avatarUrl: url,
                    })
                  }}
                  size="lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-base font-bold text-black dark:text-white">
                用户名
              </Label>
              <Input
                id="username"
                name="username"
                placeholder="您的用户名"
                required
                value={formData.username}
                onChange={handleChange}
                className="border-2 border-black dark:border-white font-medium text-base h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-bold text-black dark:text-white">
                邮箱
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="您的邮箱地址"
                required
                value={formData.email}
                onChange={handleChange}
                className="border-2 border-black dark:border-white font-medium text-base h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-bold text-black dark:text-white">
                密码
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="创建一个密码"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                className="border-2 border-black dark:border-white font-medium text-base h-12"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-6">
            <Button type="submit" className="w-full bw-button font-bold text-lg h-12" disabled={isLoading}>
              {isLoading ? "注册中..." : "注册"}
            </Button>
            <div className="text-center text-base font-medium">
              已有账户？{" "}
              <Link href="/login" className="text-black dark:text-white font-bold underline hover:no-underline">
                登录
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
