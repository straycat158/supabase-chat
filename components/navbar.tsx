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
import { Hammer, LogOut, User, Plus, Home, MessageSquare, Menu, X, BookOpen } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading, signOut } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const handleCreatePost = () => {
    router.push("/posts/new")
  }

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
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
        "sticky top-0 z-50 transition-all duration-300",
        isScrolled ? "bg-background/95 backdrop-blur-md shadow-sm" : "bg-background/50 backdrop-blur-sm",
      )}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <motion.div whileHover={{ rotate: 20 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Hammer className="h-6 w-6 text-primary" />
            </motion.div>
            <span className="text-xl font-bold">Minecraft论坛</span>
          </Link>

          {/* 桌面导航 */}
          <nav className="hidden md:flex gap-6">
            <Link
              href="/"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary relative group",
                isActive("/") ? "text-primary" : "text-muted-foreground",
              )}
            >
              <div className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                <span>首页</span>
              </div>
              <span className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 ease-out" />
              {isActive("/") && (
                <motion.div
                  className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-primary"
                  layoutId="navbar-indicator"
                />
              )}
            </Link>
            <Link
              href="/posts"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary relative group",
                isActive("/posts") ? "text-primary" : "text-muted-foreground",
              )}
            >
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>帖子</span>
              </div>
              <span className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 ease-out" />
              {isActive("/posts") && (
                <motion.div
                  className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-primary"
                  layoutId="navbar-indicator"
                />
              )}
            </Link>
            <Link
              href="/resources"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary relative group",
                isActive("/resources") ? "text-primary" : "text-muted-foreground",
              )}
            >
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>资源</span>
              </div>
              <span className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 ease-out" />
              {isActive("/resources") && (
                <motion.div
                  className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-primary"
                  layoutId="navbar-indicator"
                />
              )}
            </Link>
          </nav>
        </div>

        {/* 移动菜单按钮 */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* 桌面用户菜单 */}
        <div className="hidden md:flex items-center gap-4">
          {!isLoading &&
            (user ? (
              <div className="flex items-center gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="sm" onClick={handleCreatePost} className="shadow-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    发布帖子
                  </Button>
                </motion.div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                        <AvatarImage
                          src={user.user_metadata?.avatar_url || ""}
                          alt={user.user_metadata?.username || "用户"}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {(user.user_metadata?.username || "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.user_metadata?.username || "用户"}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        个人资料
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/images" className="cursor-pointer">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        我的图片
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      退出登录
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/login">登录</Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button asChild size="sm" className="shadow-sm">
                    <Link href="/signup">注册</Link>
                  </Button>
                </motion.div>
              </div>
            ))}
        </div>
      </div>

      {/* 移动菜单 */}
      {mobileMenuOpen && (
        <motion.div
          className="md:hidden"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="border-t px-4 py-3 space-y-3">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2 p-2 rounded-md",
                isActive("/") ? "bg-primary/10 text-primary" : "text-foreground",
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home className="h-5 w-5" />
              <span>首页</span>
            </Link>
            <Link
              href="/posts"
              className={cn(
                "flex items-center gap-2 p-2 rounded-md",
                isActive("/posts") ? "bg-primary/10 text-primary" : "text-foreground",
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <MessageSquare className="h-5 w-5" />
              <span>帖子</span>
            </Link>
            <Link
              href="/resources"
              className={cn(
                "flex items-center gap-2 p-2 rounded-md",
                isActive("/resources") ? "bg-primary/10 text-primary" : "text-foreground",
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <BookOpen className="h-5 w-5" />
              <span>资源</span>
            </Link>

            {user ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 p-2 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  <span>个人资料</span>
                </Link>
                <Link
                  href="/posts/new"
                  className="flex items-center gap-2 p-2 rounded-md bg-primary text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Plus className="h-5 w-5" />
                  <span>发布帖子</span>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    handleSignOut()
                    setMobileMenuOpen(false)
                  }}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  <span>退出登录</span>
                </Button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    登录
                  </Link>
                </Button>
                <Button asChild className="flex-1">
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
