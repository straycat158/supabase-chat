"use client"

import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  text?: string
  fullScreen?: boolean
}

export function LoadingSpinner({ size = "md", text = "加载中...", fullScreen = false }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center justify-center p-4 space-y-4"
        >
          <Loader2 className={`${sizeClasses[size]} text-primary animate-spin`} />
          {text && <p className="text-muted-foreground text-sm font-medium">{text}</p>}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-2">
      <Loader2 className={`${sizeClasses[size]} text-primary animate-spin`} />
      {text && <p className="text-muted-foreground text-sm">{text}</p>}
    </div>
  )
}
