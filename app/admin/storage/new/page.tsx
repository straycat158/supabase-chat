"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Database, Plus, Copy, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

interface StorageBucket {
  id: string
  name: string
  public: boolean
  created_at: string
  updated_at: string
}

export default function NewStoragePage() {
  const [buckets, setBuckets] = useState<StorageBucket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newBucketName, setNewBucketName] = useState<string | null>(null)
  const { toast } = useToast()

  // 获取存储桶列表
  const fetchBuckets = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/storage/create-new")
      const data = await response.json()

      if (data.success) {
        setBuckets(data.buckets || [])
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "获取存储桶失败",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBuckets()
  }, [])

  // 创建新存储桶
  const createNewBucket = async () => {
    setIsCreating(true)
    try {
      const response = await fetch("/api/storage/create-new", {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        setNewBucketName(data.bucketName)
        toast({
          title: "创建成功",
          description: `新存储桶 ${data.bucketName} 已创建`,
        })
        // 刷新列表
        await fetchBuckets()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "创建失败",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "已复制",
        description: "内容已复制到剪贴板",
      })
    } catch (error) {
      toast({
        title: "复制失败",
        description: "无法复制到剪贴板",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* 页面头部 */}
      <div className="relative overflow-hidden bg-white dark:bg-black border-b-4 border-black dark:border-white">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-16 h-16 border-4 border-black dark:border-white transform rotate-45 opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black dark:bg-white transform -translate-x-16 translate-y-16 opacity-10"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} className="inline-block">
              <div className="w-16 h-16 bg-black dark:bg-white mx-auto mb-6 flex items-center justify-center">
                <Database className="h-8 w-8 text-white dark:text-black" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-black tracking-tight text-black dark:text-white"
            >
              存储桶管理
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-400 font-medium"
            >
              创建和管理图片存储桶
            </motion.p>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* 创建新存储桶 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bw-card bg-white dark:bg-black">
              <CardHeader>
                <CardTitle className="text-2xl font-black text-black dark:text-white flex items-center gap-2">
                  <Plus className="h-6 w-6" />
                  创建新存储桶
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  创建一个全新的图片存储桶，用于资源上传
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-900 border-2 border-black dark:border-white p-4">
                    <h3 className="font-bold text-black dark:text-white mb-2">存储桶配置:</h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• 访问权限: 公开</li>
                      <li>• 文件大小限制: 10MB</li>
                      <li>• 支持格式: JPEG, PNG, GIF, WebP, SVG</li>
                      <li>• 自动生成唯一名称</li>
                    </ul>
                  </div>

                  <Button
                    onClick={createNewBucket}
                    disabled={isCreating}
                    className="w-full bw-button font-bold text-lg py-6"
                  >
                    {isCreating ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        创建中...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        创建新存储桶
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 新创建的存储桶信息 */}
          {newBucketName && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 dark:bg-green-950 border-2 border-green-200 dark:border-green-800 p-6 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h3 className="text-xl font-bold text-green-800 dark:text-green-200">存储桶创建成功!</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-green-700 dark:text-green-300 mb-2">存储桶名称:</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-green-100 dark:bg-green-900 px-3 py-2 rounded font-mono text-sm">
                      {newBucketName}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(newBucketName)}
                      className="border-green-300 dark:border-green-700"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-green-700 dark:text-green-300 mb-2">
                    组件使用方法:
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-green-100 dark:bg-green-900 px-3 py-2 rounded font-mono text-sm">
                      bucketName="{newBucketName}"
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(`bucketName="${newBucketName}"`)}
                      className="border-green-300 dark:border-green-700"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-green-700 dark:text-green-300 mb-2">环境变量:</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-green-100 dark:bg-green-900 px-3 py-2 rounded font-mono text-sm">
                      NEXT_PUBLIC_STORAGE_BUCKET="{newBucketName}"
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(`NEXT_PUBLIC_STORAGE_BUCKET="${newBucketName}"`)}
                      className="border-green-300 dark:border-green-700"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 现有存储桶列表 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bw-card bg-white dark:bg-black">
              <CardHeader>
                <CardTitle className="text-2xl font-black text-black dark:text-white flex items-center gap-2">
                  <Database className="h-6 w-6" />
                  现有存储桶
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">查看所有可用的存储桶</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-black dark:text-white" />
                  </div>
                ) : buckets.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">暂无存储桶</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {buckets.map((bucket) => (
                      <div
                        key={bucket.id}
                        className="border-2 border-black dark:border-white p-4 bg-gray-50 dark:bg-gray-900"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-black dark:text-white">{bucket.name}</h3>
                              <Badge variant={bucket.public ? "default" : "secondary"}>
                                {bucket.public ? "公开" : "私有"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              创建时间: {new Date(bucket.created_at).toLocaleString()}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(bucket.name)}
                            className="border-black dark:border-white"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
