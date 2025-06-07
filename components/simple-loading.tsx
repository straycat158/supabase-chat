"use client"

import { motion } from "framer-motion"

interface SimpleLoadingProps {
  size?: "sm" | "md" | "lg"
  text?: string
  fullScreen?: boolean
  variant?: "spinner" | "dots" | "pulse"
}

export function SimpleLoading({ size = "md", text, fullScreen = false, variant = "spinner" }: SimpleLoadingProps) {
  const sizeClasses = {
    sm: { spinner: "w-4 h-4 border-2", text: "text-sm" },
    md: { spinner: "w-6 h-6 border-2", text: "text-base" },
    lg: { spinner: "w-8 h-8 border-3", text: "text-lg" },
  }

  const SpinnerLoader = () => (
    <motion.div
      className={`${sizeClasses[size].spinner} border-green-200 dark:border-green-800 border-t-green-500 rounded-full`}
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
      className="flex space-x-1"
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
          className={`bg-green-500 rounded-full ${
            size === "sm" ? "w-1 h-1" : size === "md" ? "w-1.5 h-1.5" : "w-2 h-2"
          }`}
          variants={{
            animate: {
              y: [0, -4, 0],
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
      className={`${sizeClasses[size].spinner} bg-green-500 rounded-full`}
      animate={{
        scale: [1, 1.2, 1],
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
      default:
        return <SpinnerLoader />
    }
  }

  if (fullScreen) {
    return (
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50 bg-background/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        <motion.div
          className="flex flex-col items-center space-y-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
        >
          <LoaderComponent />
          {text && <p className={`${sizeClasses[size].text} font-medium text-foreground/80`}>{text}</p>}
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-3 p-4">
      <LoaderComponent />
      {text && <p className={`${sizeClasses[size].text} font-medium text-foreground/80`}>{text}</p>}
    </div>
  )
}
