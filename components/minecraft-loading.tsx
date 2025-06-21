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

  const geometricVariants = {
    animate: {
      rotate: [0, 90, 180, 270, 360],
      scale: [1, 1.1, 1, 1.1, 1],
      transition: {
        duration: 3,
        ease: "easeInOut",
        repeat: Number.POSITIVE_INFINITY,
      },
    },
  }

  const dotsVariants = {
    animate: {
      transition: {
        staggerChildren: 0.3,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse" as const,
      },
    },
  }

  const dotVariants = {
    animate: {
      y: [0, -12, 0],
      opacity: [0.3, 1, 0.3],
      scale: [1, 1.2, 1],
      transition: {
        duration: 1,
        ease: "easeInOut",
      },
    },
  }

  if (fullScreen) {
    return (
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50 bg-white/95 dark:bg-black/95 backdrop-blur-sm"
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <motion.div
          className="flex flex-col items-center space-y-8 p-10 bg-white dark:bg-black border-4 border-black dark:border-white shadow-[16px_16px_0px_rgba(0,0,0,0.2)] dark:shadow-[16px_16px_0px_rgba(255,255,255,0.2)]"
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
        >
          {/* 几何加载器 */}
          <div className="relative">
            <motion.div
              className="w-16 h-16 border-4 border-black dark:border-white bg-white dark:bg-black"
              variants={geometricVariants}
              animate="animate"
            />
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-black dark:bg-white"
              animate={{
                rotate: [360, 0],
                scale: [1, 0.7, 1],
              }}
              transition={{
                duration: 3,
                ease: "easeInOut",
                repeat: Number.POSITIVE_INFINITY,
              }}
            />
          </div>

          {/* 文字和动态方块 */}
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-black text-black dark:text-white">{text}</span>
            <motion.div className="flex space-x-2" variants={dotsVariants} animate="animate">
              {[0, 1, 2].map((i) => (
                <motion.div key={i} className="w-3 h-3 bg-black dark:bg-white" variants={dotVariants} />
              ))}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      <div className="relative">
        <motion.div
          className="w-12 h-12 border-4 border-black dark:border-white bg-white dark:bg-black"
          variants={geometricVariants}
          animate="animate"
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-black dark:bg-white"
          animate={{
            rotate: [360, 0],
            scale: [1, 0.7, 1],
          }}
          transition={{
            duration: 3,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
          }}
        />
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-lg font-bold text-black dark:text-white">{text}</span>
        <motion.div className="flex space-x-1" variants={dotsVariants} animate="animate">
          {[0, 1, 2].map((i) => (
            <motion.div key={i} className="w-2 h-2 bg-black dark:bg-white" variants={dotVariants} />
          ))}
        </motion.div>
      </div>
    </div>
  )
}
