"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, CheckCircle, AlertCircle, Database, Settings, Upload } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface BucketInfo {
  name: string
  public: boolean
  createdAt: string
  updatedAt: string
}

interface StorageStatus {
  buckets: BucketInfo[]
  minecraftForumExists: boolean
  minecraftForumBucket: BucketInfo | null
}

export default function CreateStoragePage() {
  const { toast } = useToast()
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null)

  const checkStorageStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/storage/create", {
        method: "GET",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "获取存储状态失败")
      }

      setStorageStatus(data)
    } catch (error: any) {
      toast({
        title: "检查失败",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createStorageBucket = async () => {
    setIsCreating(true)
    try {
      const response = await fetch("/api/storage/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "创建存储桶失败")
      }

      toast({
        title: data.alreadyExists ? "存储桶已存在" : "创建成功",
        description: data.message,
        variant: data.warning ? "destructive" : "default",
      })

      // 刷新状态
      await checkStorageStatus()
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">存储桶管理</h1>
        <p className="text-muted-foreground">创建和管理Minecraft论坛的图片存储桶</p>
      </div>

      {/* 状态检查卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            存储状态检查
          </CardTitle>
          <CardDescription>检查当前Supabase项目的存储桶状态</CardDescription>
        </CardHeader>
        <CardContent>
          {storageStatus ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">minecraft-forum 存储桶</span>
                <Badge variant={storageStatus.minecraftForumExists ? "default" : "secondary"}>
                  {storageStatus.minecraftForumExists ? "已存在" : "不存在"}
                </Badge>
              </div>

              {storageStatus.minecraftForumBucket && (
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">存储桶详情</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">名称:</span>
                      <span className="ml-2 font-mono">{storageStatus.minecraftForumBucket.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">访问权限:</span>
                      <span className="ml-2">{storageStatus.minecraftForumBucket.public ? "公开" : "私有"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">创建时间:</span>
                      <span className="ml-2">
                        {new Date(storageStatus.minecraftForumBucket.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">更新时间:</span>
                      <span className="ml-2">
                        {new Date(storageStatus.minecraftForumBucket.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <span className="font-medium">所有存储桶 ({storageStatus.buckets.length})</span>
                <div className="space-y-1">
                  {storageStatus.buckets.map((bucket) => (
                    <div key={bucket.name} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="font-mono text-sm">{bucket.name}</span>
                      <Badge variant={bucket.public ? "default" : "outline"}>{bucket.public ? "公开" : "私有"}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">点击下方按钮检查存储状态</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={checkStorageStatus} disabled={isLoading} variant="outline">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                检查中...
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                检查存储状态
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* 创建存储桶卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            创建存储桶
          </CardTitle>
          <CardDescription>为Minecraft论坛创建图片存储桶</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">即将创建的存储桶配置</h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• 名称: minecraft-forum</li>
                    <li>• 访问权限: 公开</li>
                    <li>• 文件大小限制: 5MB</li>
                    <li>• 支持格式: JPEG, PNG, GIF, WebP</li>
                  </ul>
                </div>
              </div>
            </div>

            {storageStatus?.minecraftForumExists && (
              <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-100">存储桶已存在</h4>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      minecraft-forum 存储桶已经存在，无需重复创建。
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={createStorageBucket}
            disabled={isCreating || storageStatus?.minecraftForumExists}
            className="w-full"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                创建中...
              </>
            ) : storageStatus?.minecraftForumExists ? (
              "存储桶已存在"
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                创建存储桶
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">方法一: 使用此页面（推荐）</h4>
            <p className="text-sm text-muted-foreground">点击上方的"创建存储桶"按钮，系统会自动创建并配置存储桶。</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">方法二: 使用命令行脚本</h4>
            <div className="bg-muted p-3 rounded font-mono text-sm">npx tsx scripts/create-storage-bucket.ts</div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">方法三: 手动在Supabase控制台创建</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>登录Supabase控制台</li>
              <li>进入Storage页面</li>
              <li>点击"New bucket"</li>
              <li>名称设为"minecraft-forum"</li>
              <li>设置为Public bucket</li>
              <li>文件大小限制设为5MB</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
