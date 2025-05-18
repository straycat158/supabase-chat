"use client"

import { motion } from "framer-motion"
import { Hammer } from "lucide-react"

interface MinecraftLoadingProps {
  text?: string
  fullScreen?: boolean
}

export function MinecraftLoading({ text = "加载中...", fullScreen = false }: MinecraftLoadingProps) {
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  }

  const iconVariants = {
    initial: { rotate: 0 },
    animate: {
      rotate: 360,
      transition: {
        duration: 2,
        ease: "linear",
        repeat: Number.POSITIVE_INFINITY,
      },
    },
  }

  const blockVariants = {
    initial: { y: 0 },
    animate: {
      y: [0, -12, 0],
      transition: {
        duration: 1.5,
        ease: "easeInOut",
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
      },
    },
  }

  if (fullScreen) {
    return (
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50"
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* 高斯模糊背景 */}
        <div className="absolute inset-0 bg-background/60 backdrop-blur-xl"></div>

        {/* 内容容器 - 添加玻璃态效果 */}
        <div className="relative z-10 bg-background/30 backdrop-blur-md rounded-xl p-10 shadow-2xl border border-white/10 flex flex-col items-center justify-center space-y-6">
          {/* 装饰性光晕效果 */}
          <div className="absolute inset-0 overflow-hidden rounded-xl">
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 bg-primary"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-20 bg-primary"></div>
          </div>

          {/* 加载动画 */}
          <div className="relative z-10">
            <motion.div
              className="w-20 h-20 bg-primary/20 rounded-md shadow-lg"
              variants={blockVariants}
              initial="initial"
              animate="animate"
            />
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              variants={iconVariants}
              initial="initial"
              animate="animate"
            >
              <Hammer className="h-10 w-10 text-primary drop-shadow-md" />
            </motion.div>
          </div>

          {/* 加载文本 */}
          <p className="text-lg font-medium text-foreground drop-shadow-sm">{text}</p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative bg-background/30 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/10">
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full blur-3xl opacity-20 bg-primary"></div>
          <div className="absolute -bottom-12 -left-12 w-24 h-24 rounded-full blur-3xl opacity-20 bg-primary"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div className="relative">
            <motion.div
              className="w-16 h-16 bg-primary/20 rounded-md shadow-md"
              variants={blockVariants}
              initial="initial"
              animate="animate"
            />
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              variants={iconVariants}
              initial="initial"
              animate="animate"
            >
              <Hammer className="h-8 w-8 text-primary drop-shadow-md" />
            </motion.div>
          </div>
          <p className="text-sm font-medium text-foreground">{text}</p>
        </div>
      </div>
    </div>
  )
}
