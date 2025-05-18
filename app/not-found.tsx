import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Hammer } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="mb-8">
        <Hammer className="h-24 w-24 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-2">404 - 页面未找到</h1>
        <p className="text-muted-foreground mb-6">看起来您正在寻找的页面已经被苦力怕炸掉了，或者它从未存在过。</p>
        <Button asChild>
          <Link href="/">返回首页</Link>
        </Button>
      </div>

      <div className="max-w-md p-6 bg-background/30 backdrop-blur-md rounded-xl border border-white/10 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">您可能想要尝试：</h2>
        <ul className="space-y-2 text-left">
          <li>• 检查URL是否正确</li>
          <li>• 返回上一页</li>
          <li>
            • 浏览我们的
            <Link href="/posts" className="text-primary hover:underline">
              帖子列表
            </Link>
          </li>
          <li>
            • 或者
            <Link href="/signup" className="text-primary hover:underline">
              注册账号
            </Link>
            加入我们的社区
          </li>
        </ul>
      </div>
    </div>
  )
}
