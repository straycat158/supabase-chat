"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
// 将 Pickaxe 替换为 Hammer
// import { Hammer } from 'lucide-react'
import { Square } from "lucide-react"
import { motion } from "framer-motion"

export default function Login() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  // 检查用户是否已登录，如果已登录则重定向到首页
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        router.push("/")
      }
    }

    checkUser()
  }, [router, supabase.auth])

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        throw error
      }

      toast({
        title: "登录成功",
        description: "欢迎回来！",
      })

      // 登录成功后立即重定向到首页
      router.push("/")
    } catch (error: any) {
      toast({
        title: "登录失败",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center relative overflow-hidden">
      {/* 几何背景 */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 border-4 border-black dark:border-white transform rotate-45 opacity-10"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-black dark:bg-white rounded-full opacity-10"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-black dark:bg-white transform rotate-12 opacity-10"></div>
        <div className="absolute bottom-10 left-1/3 w-20 h-20 border-4 border-black dark:border-white opacity-10"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
        <CardHeader className="space-y-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex justify-center"
          >
            <div className="w-16 h-16 bg-black dark:bg-white flex items-center justify-center transform rotate-45">
              <Square className="h-8 w-8 text-white dark:text-black transform -rotate-45" />
            </div>
          </motion.div>
          <CardTitle className="text-3xl font-black text-black dark:text-white">登录账户</CardTitle>
          <CardDescription className="text-lg font-medium text-gray-600 dark:text-gray-400">
            输入您的信息以登录账户
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
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
                placeholder="您的密码"
                required
                value={formData.password}
                onChange={handleChange}
                className="border-2 border-black dark:border-white font-medium text-base h-12"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-6">
            <Button type="submit" className="w-full bw-button font-bold text-lg h-12" disabled={isLoading}>
              {isLoading ? "登录中..." : "登录"}
            </Button>
            <div className="text-center text-base font-medium">
              没有账户？{" "}
              <Link href="/signup" className="text-black dark:text-white font-bold underline hover:no-underline">
                注册
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
