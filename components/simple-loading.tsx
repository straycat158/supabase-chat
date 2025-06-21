"use client"

import { motion } from "framer-motion"

interface SimpleLoadingProps {
  size?: "sm" | "md" | "lg"
  text?: string
  fullScreen?: boolean
  variant?: "spinner" | "dots" | "pulse" | "geometric"
}

export function SimpleLoading({ size = "md", text, fullScreen = false, variant = "geometric" }: SimpleLoadingProps) {
  const sizeClasses = {
    sm: { spinner: "w-6 h-6", text: "text-sm", geometric: "w-8 h-8" },
    md: { spinner: "w-8 h-8", text: "text-base", geometric: "w-12 h-12" },
    lg: { spinner: "w-12 h-12", text: "text-lg", geometric: "w-16 h-16" },
  }

  const GeometricLoader = () => (
    <div className="relative">
      {/* 主要的旋转方形 */}
      <motion.div
        className={`${sizeClasses[size].geometric} border-4 border-black dark:border-white bg-white dark:bg-black`}
        animate={{
          rotate: [0, 90, 180, 270, 360],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Number.POSITIVE_INFINITY,
        }}
      />

      {/* 内部小方形 */}
      <motion.div
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
          size === "sm" ? "w-2 h-2" : size === "md" ? "w-3 h-3" : "w-4 h-4"
        } bg-black dark:bg-white`}
        animate={{
          rotate: [360, 270, 180, 90, 0],
          scale: [1, 0.8, 1, 0.8, 1],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Number.POSITIVE_INFINITY,
        }}
      />
    </div>
  )

  const SpinnerLoader = () => (
    <motion.div
      className={`${sizeClasses[size].spinner} border-4 border-gray-200 dark:border-gray-800 border-t-black dark:border-t-white rounded-full`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        ease: "linear",
        repeat: Number.POSITIVE_INFINITY,
      }}
    />
  )

  const DotsLoader = () => (
    <motion.div
      className="flex space-x-2"
      initial="initial"
      animate="animate"
      variants={{
        animate: {
          transition: {
            staggerChildren: 0.2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          },
        },
      }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`bg-black dark:bg-white ${size === "sm" ? "w-2 h-2" : size === "md" ? "w-3 h-3" : "w-4 h-4"}`}
          variants={{
            animate: {
              y: [0, -8, 0],
              opacity: [0.4, 1, 0.4],
              transition: {
                duration: 0.6,
                ease: "easeInOut",
              },
            },
          }}
        />
      ))}
    </motion.div>
  )

  const PulseLoader = () => (
    <motion.div
      className={`${sizeClasses[size].spinner} bg-black dark:bg-white`}
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.7, 1, 0.7],
      }}
      transition={{
        duration: 1.5,
        ease: "easeInOut",
        repeat: Number.POSITIVE_INFINITY,
      }}
    />
  )

  const LoaderComponent = () => {
    switch (variant) {
      case "dots":
        return <DotsLoader />
      case "pulse":
        return <PulseLoader />
      case "spinner":
        return <SpinnerLoader />
      case "geometric":
      default:
        return <GeometricLoader />
    }
  }

  if (fullScreen) {
    return (
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50 bg-white/90 dark:bg-black/90 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        <motion.div
          className="flex flex-col items-center space-y-6 p-8 bg-white dark:bg-black border-4 border-black dark:border-white shadow-[12px_12px_0px_rgba(0,0,0,0.3)] dark:shadow-[12px_12px_0px_rgba(255,255,255,0.3)]"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
        >
          <LoaderComponent />
          {text && (
            <p className={`${sizeClasses[size].text} font-black text-black dark:text-white text-center`}>{text}</p>
          )}
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6">
      <LoaderComponent />
      {text && <p className={`${sizeClasses[size].text} font-bold text-black dark:text-white text-center`}>{text}</p>}
    </div>
  )
}
