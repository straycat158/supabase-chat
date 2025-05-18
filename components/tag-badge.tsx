import { cn } from "@/lib/utils"
import Link from "next/link"

interface TagBadgeProps {
  tag: {
    id: string
    name: string
    slug: string
    color?: string | null
    icon?: string | null
  }
  size?: "sm" | "md" | "lg"
  showIcon?: boolean
  className?: string
  asLink?: boolean
}

// 预设的标签颜色
const TAG_COLORS = {
  default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  server: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  mod: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  resource: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  build: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  redstone: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  question: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
}

export function TagBadge({ tag, size = "md", showIcon = true, className, asLink = false }: TagBadgeProps) {
  // 根据size设置样式
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-base px-3 py-1",
  }

  // 获取标签颜色，如果没有自定义颜色则使用预设颜色
  const getTagColor = () => {
    if (tag.color) return tag.color

    // 根据slug选择预设颜色
    const colorKey = Object.keys(TAG_COLORS).find((key) => tag.slug.includes(key))
    return TAG_COLORS[colorKey as keyof typeof TAG_COLORS] || TAG_COLORS.default
  }

  const badgeContent = (
    <span
      className={cn("inline-flex items-center rounded-full font-medium", sizeClasses[size], getTagColor(), className)}
    >
      {showIcon && tag.icon && <span className="mr-1">{tag.icon}</span>}
      {tag.name}
    </span>
  )

  if (asLink) {
    return (
      <Link href={`/resources?tag=${tag.slug}`} className="hover:opacity-80 transition-opacity">
        {badgeContent}
      </Link>
    )
  }

  return badgeContent
}
