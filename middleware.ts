import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // 创建中间件客户端
  const supabase = createMiddlewareClient({ req, res })

  // 刷新会话
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 如果用户访问发布帖子页面但未登录，重定向到登录页面
  if (req.nextUrl.pathname === "/posts/new" && !session) {
    const redirectUrl = new URL("/login", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

// 配置中间件匹配的路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径除了:
     * - 静态文件
     * - API 路由
     */
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
}
