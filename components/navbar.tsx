"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Square, LogOut, User, Plus, Home, MessageSquare, Menu, X, BookOpen, LayoutDashboard } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { AnnouncementsDrawer } from "@/components/announcements-drawer"
import { useAnnouncements } from "@/hooks/use-announcements"

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading, signOut } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { hasNewAnnouncements, markAsRead } = useAnnouncements()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const handleCreatePost = () => {
    router.push("/posts/new")
  }

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path === "/dashboard" && pathname === "/dashboard") return true
    if (path === "/posts" && pathname.startsWith("/posts")) return true
    if (path === "/resources" && pathname.startsWith("/resources")) return true
    return pathname === path
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300 border-b-2 border-black dark:border-white",
        isScrolled ? "bg-white/95 dark:bg-black/95 backdrop-blur-md" : "bg-white/90 dark:bg-black/90 backdrop-blur-sm",
      )}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="w-8 h-8 bg-black dark:bg-white flex items-center justify-center"
            >
              <Square className="h-5 w-5 text-white dark:text-black" />
            </motion.div>
            <span className="text-2xl font-black tracking-tight text-black dark:text-white">MINECRAFT</span>
          </Link>

          {/* 桌面导航 */}
          <nav className="hidden md:flex gap-8">
            {[
              { href: "/", label: "首页", icon: Home },
              ...(user ? [{ href: "/dashboard", label: "仪表盘", icon: LayoutDashboard }] : []),
              { href: "/posts", label: "帖子", icon: MessageSquare },
              { href: "/resources", label: "资源", icon: BookOpen },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-bold tracking-wide transition-colors relative group",
                  isActive(item.href)
                    ? "text-black dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white",
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
                {isActive(item.href) && (
                  <motion.div
                    className="absolute -bottom-6 left-0 right-0 h-1 bg-black dark:bg-white"
                    layoutId="navbar-indicator"
                  />
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* 移动菜单按钮 */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="border-2 border-black dark:border-white"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* 桌面用户菜单 */}
        <div className="hidden md:flex items-center gap-4">
          {!isLoading && (
            <div className="flex items-center gap-4">
              {/* 公告按钮 */}
              <AnnouncementsDrawer hasNewAnnouncements={hasNewAnnouncements} onMarkAsRead={markAsRead} />

              {user ? (
                <div className="flex items-center gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button onClick={handleCreatePost} className="bw-button font-bold tracking-wide">
                      <Plus className="h-4 w-4 mr-2" />
                      发布
                    </Button>
                  </motion.div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="border-2 border-black dark:border-white">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.user_metadata?.avatar_url || ""}
                            alt={user.user_metadata?.username || "用户"}
                          />
                          <AvatarFallback className="bg-black dark:bg-white text-white dark:text-black font-bold">
                            {(user.user_metadata?.username || user.email?.charAt(0) || "U").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 border-2 border-black dark:border-white">
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="font-bold">{user.user_metadata?.username || "用户"}</p>
                          <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <DropdownMenuSeparator className="bg-black dark:bg-white h-0.5" />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer font-medium">
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          仪表盘
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer font-medium">
                          <User className="h-4 w-4 mr-2" />
                          个人资料
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-black dark:bg-white h-0.5" />
                      <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer font-medium">
                        <LogOut className="h-4 w-4 mr-2" />
                        退出登录
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button asChild variant="ghost" className="font-bold">
                      <Link href="/login">登录</Link>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button asChild className="bw-button font-bold">
                      <Link href="/signup">注册</Link>
                    </Button>
                  </motion.div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 移动菜单 */}
      {mobileMenuOpen && (
        <motion.div
          className="md:hidden border-t-2 border-black dark:border-white"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="px-4 py-6 space-y-4 bg-white dark:bg-black">
            {[
              { href: "/", label: "首页", icon: Home },
              ...(user ? [{ href: "/dashboard", label: "仪表盘", icon: LayoutDashboard }] : []),
              { href: "/posts", label: "帖子", icon: MessageSquare },
              { href: "/resources", label: "资源", icon: BookOpen },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 p-3 font-bold tracking-wide border-2 transition-colors",
                  isActive(item.href)
                    ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                    : "border-black dark:border-white text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900",
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}

            <div className="pt-4 border-t-2 border-black dark:border-white">
              <AnnouncementsDrawer hasNewAnnouncements={hasNewAnnouncements} onMarkAsRead={markAsRead} />
            </div>

            {user ? (
              <div className="space-y-3 pt-4">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 p-3 border-2 border-black dark:border-white font-bold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  <span>个人资料</span>
                </Link>
                <Link
                  href="/posts/new"
                  className="flex items-center gap-3 p-3 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white font-bold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Plus className="h-5 w-5" />
                  <span>发布帖子</span>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start border-2 border-black dark:border-white font-bold"
                  onClick={() => {
                    handleSignOut()
                    setMobileMenuOpen(false)
                  }}
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  <span>退出登录</span>
                </Button>
              </div>
            ) : (
              <div className="flex gap-3 pt-4">
                <Button asChild variant="outline" className="flex-1 border-2 border-black dark:border-white font-bold">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    登录
                  </Link>
                </Button>
                <Button asChild className="flex-1 bw-button font-bold">
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    注册
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}
