"use client"

import { motion } from "framer-motion"

interface MinecraftLoadingProps {
  text?: string
  fullScreen?: boolean
}

export function MinecraftLoading({ text = "加载中...", fullScreen = false }: MinecraftLoadingProps) {
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  }

  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        ease: "linear",
        repeat: Number.POSITIVE_INFINITY,
      },
    },
  }

  const dotsVariants = {
    animate: {
      transition: {
        staggerChildren: 0.2,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse" as const,
      },
    },
  }

  const dotVariants = {
    animate: {
      y: [0, -8, 0],
      opacity: [0.4, 1, 0.4],
      transition: {
        duration: 0.8,
        ease: "easeInOut",
      },
    },
  }

  if (fullScreen) {
    return (
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm"
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="flex flex-col items-center space-y-6">
          {/* 简约的旋转加载器 */}
          <motion.div className="relative" variants={spinnerVariants} animate="animate">
            <div className="w-12 h-12 border-3 border-green-200 dark:border-green-800 rounded-full"></div>
            <div className="absolute inset-0 w-12 h-12 border-3 border-transparent border-t-green-500 rounded-full"></div>
          </motion.div>

          {/* 文字和动态点 */}
          <div className="flex items-center space-x-1">
            <span className="text-lg font-medium text-foreground">{text}</span>
            <motion.div className="flex space-x-1" variants={dotsVariants} animate="animate">
              {[0, 1, 2].map((i) => (
                <motion.div key={i} className="w-1.5 h-1.5 bg-green-500 rounded-full" variants={dotVariants} />
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <motion.div className="relative" variants={spinnerVariants} animate="animate">
        <div className="w-8 h-8 border-2 border-green-200 dark:border-green-800 rounded-full"></div>
        <div className="absolute inset-0 w-8 h-8 border-2 border-transparent border-t-green-500 rounded-full"></div>
      </motion.div>

      <div className="flex items-center space-x-1">
        <span className="text-sm font-medium text-foreground">{text}</span>
        <motion.div className="flex space-x-1" variants={dotsVariants} animate="animate">
          {[0, 1, 2].map((i) => (
            <motion.div key={i} className="w-1 h-1 bg-green-500 rounded-full" variants={dotVariants} />
          ))}
        </motion.div>
      </div>
    </div>
  )
}
