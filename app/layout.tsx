import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"
import { RouteChangeLoading } from "@/components/route-change-loading"
import { NavigationProgress } from "@/components/navigation-progress"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Minecraft论坛",
  description: "一个使用Supabase构建的Minecraft论坛",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <NavigationProgress />
            <RouteChangeLoading />
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1 container mx-auto py-6 px-4">{children}</main>
              <footer className="border-t py-6 bg-white dark:bg-black">
                <div className="container mx-auto text-center space-y-2">
                  <div className="text-sm font-medium text-black dark:text-white">
                    © {new Date().getFullYear()} 喵星宇宙艾莫科技工作室版权所有
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    办公地址：湖北省武汉市硚口区武胜西街5附6号(崇仁路地铁站A口步行350米)
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">鄂ICP备2025101604号-1</div>
                </div>
              </footer>
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
