"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface ImageGalleryProps {
  images: string[]
  className?: string
}

export function ImageGallery({ images, className }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  if (!images || images.length === 0) return null

  const openImage = (index: number) => {
    setSelectedIndex(index)
  }

  const closeImage = () => {
    setSelectedIndex(null)
  }

  const nextImage = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length)
    }
  }

  const prevImage = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1)
    }
  }

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 bg-black flex items-center justify-center">
            <ZoomIn className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-xl font-black text-black dark:text-white">图片展示</h3>
          <div className="flex-1 h-0.5 bg-black dark:bg-white"></div>
          <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{images.length} 张图片</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group cursor-pointer"
              onClick={() => openImage(index)}
            >
              <div className="relative aspect-square overflow-hidden border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                <Image
                  src={url || "/placeholder.svg"}
                  alt={`图片 ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/90 border-2 border-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110">
                    <ZoomIn className="h-6 w-6 text-black" />
                  </div>
                </div>
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-black text-white px-2 py-1 text-xs font-bold">封面</div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 全屏图片查看器 */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => closeImage()}>
        <DialogContent className="max-w-7xl w-full h-full max-h-screen p-0 bg-black/95 border-0">
          <div className="relative w-full h-full flex items-center justify-center">
            {selectedIndex !== null && (
              <>
                {/* 关闭按钮 */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  onClick={closeImage}
                >
                  <X className="h-6 w-6" />
                </Button>

                {/* 图片计数 */}
                <div className="absolute top-4 left-4 z-50 bg-white/10 text-white px-3 py-1 rounded border border-white/20 font-bold">
                  {selectedIndex + 1} / {images.length}
                </div>

                {/* 主图片 */}
                <div className="relative w-full h-full flex items-center justify-center p-16">
                  <Image
                    src={images[selectedIndex] || "/placeholder.svg"}
                    alt={`图片 ${selectedIndex + 1}`}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>

                {/* 导航按钮 */}
                {images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-white/10 hover:bg-white/20 text-white border border-white/20"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-8 w-8" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-white/10 hover:bg-white/20 text-white border border-white/20"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-8 w-8" />
                    </Button>
                  </>
                )}

                {/* 缩略图导航 */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-white/10 p-2 rounded border border-white/20 max-w-md overflow-x-auto">
                    {images.map((url, index) => (
                      <button
                        key={index}
                        className={`relative w-12 h-12 flex-shrink-0 border-2 overflow-hidden ${
                          index === selectedIndex ? "border-white" : "border-white/30"
                        }`}
                        onClick={() => setSelectedIndex(index)}
                      >
                        <Image
                          src={url || "/placeholder.svg"}
                          alt={`缩略图 ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
