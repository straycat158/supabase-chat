"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, Play } from "lucide-react"
import { Card } from "@/components/ui/card"

interface VideoLinkDetectorProps {
  content: string
}

interface VideoLink {
  platform: string
  url: string
  originalText: string
  startIndex: number
  endIndex: number
}

export function VideoLinkDetector({ content }: VideoLinkDetectorProps) {
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null)

  // 检测视频链接的正则表达式
  const videoPatterns = [
    {
      platform: "Bilibili",
      regex: /(https?:\/\/)?(www\.)?(bilibili\.com\/video\/[A-Za-z0-9]+)/g,
      embedUrl: (match: string) => {
        // 提取视频ID
        const videoId = match.match(/bilibili\.com\/video\/([A-Za-z0-9]+)/)?.[1]
        if (!videoId) return null
        return `https://player.bilibili.com/player.html?bvid=${videoId}&high_quality=1&danmaku=0`
      },
    },
    {
      platform: "YouTube",
      regex: /(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)(&\S*)?/g,
      embedUrl: (match: string) => {
        // 提取视频ID
        const videoId = match.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/)?.[1]
        if (!videoId) return null
        return `https://www.youtube.com/embed/${videoId}`
      },
    },
    // 可以添加更多视频平台的支持
  ]

  // 查找内容中的所有视频链接
  const findVideoLinks = (text: string): VideoLink[] => {
    const links: VideoLink[] = []

    videoPatterns.forEach(({ platform, regex }) => {
      let match
      const regexWithIndices = new RegExp(regex)

      while ((match = regexWithIndices.exec(text)) !== null) {
        links.push({
          platform,
          url: match[0],
          originalText: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        })
      }
    })

    // 按照出现顺序排序
    return links.sort((a, b) => a.startIndex - b.startIndex)
  }

  // 获取嵌入URL
  const getEmbedUrl = (link: VideoLink): string | null => {
    const pattern = videoPatterns.find((p) => p.platform === link.platform)
    if (!pattern || !pattern.embedUrl) return null
    return pattern.embedUrl(link.url)
  }

  // 渲染带有视频链接的内容
  const renderContentWithVideoLinks = () => {
    const videoLinks = findVideoLinks(content)

    if (videoLinks.length === 0) {
      // 如果没有视频链接，直接返回原始内容
      return <p className="whitespace-pre-line">{content}</p>
    }

    // 构建带有视频链接的内容
    const result: React.ReactNode[] = []
    let lastIndex = 0

    videoLinks.forEach((link, index) => {
      // 添加链接前的文本
      if (link.startIndex > lastIndex) {
        result.push(<span key={`text-${index}`}>{content.substring(lastIndex, link.startIndex)}</span>)
      }

      // 添加视频链接
      result.push(
        <VideoLinkRenderer
          key={`video-${index}`}
          link={link}
          isExpanded={expandedVideo === link.url}
          onToggle={() => setExpandedVideo(expandedVideo === link.url ? null : link.url)}
        />,
      )

      lastIndex = link.endIndex
    })

    // 添加最后一段文本
    if (lastIndex < content.length) {
      result.push(<span key="text-last">{content.substring(lastIndex)}</span>)
    }

    return <p className="whitespace-pre-line">{result}</p>
  }

  return renderContentWithVideoLinks()
}

// 视频链接渲染器组件
function VideoLinkRenderer({
  link,
  isExpanded,
  onToggle,
}: {
  link: VideoLink
  isExpanded: boolean
  onToggle: () => void
}) {
  const videoPatterns = [
    {
      platform: "Bilibili",
      regex: /(https?:\/\/)?(www\.)?(bilibili\.com\/video\/[A-Za-z0-9]+)/g,
      embedUrl: (match: string) => {
        // 提取视频ID
        const videoId = match.match(/bilibili\.com\/video\/([A-Za-z0-9]+)/)?.[1]
        if (!videoId) return null
        return `https://player.bilibili.com/player.html?bvid=${videoId}&high_quality=1&danmaku=0`
      },
    },
    {
      platform: "YouTube",
      regex: /(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)(&\S*)?/g,
      embedUrl: (match: string) => {
        // 提取视频ID
        const videoId = match.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/)?.[1]
        if (!videoId) return null
        return `https://www.youtube.com/embed/${videoId}`
      },
    },
  ]

  // 获取嵌入URL
  const getEmbedUrl = (link: VideoLink): string | null => {
    const pattern = videoPatterns.find((p) => p.platform === link.platform)
    if (!pattern || !pattern.embedUrl) return null
    return pattern.embedUrl(link.url)
  }

  const embedUrl = getEmbedUrl(link)

  return (
    <span className="inline-block">
      <span className="text-primary hover:underline cursor-pointer" onClick={() => window.open(link.url, "_blank")}>
        {link.originalText}
      </span>
      <span className="ml-2">
        <Button
          variant="outline"
          size="sm"
          className="h-6 px-2 py-1 text-xs"
          onClick={(e) => {
            e.preventDefault()
            onToggle()
          }}
        >
          {isExpanded ? "收起" : <Play className="h-3 w-3 mr-1" />}
          {!isExpanded && "播放"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-6 px-2 py-1 text-xs ml-1"
          onClick={(e) => {
            e.preventDefault()
            window.open(link.url, "_blank")
          }}
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          打开
        </Button>
      </span>
      {isExpanded && embedUrl && (
        <Card className="mt-2 mb-4 overflow-hidden">
          <div className="relative aspect-video w-full">
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </Card>
      )}
    </span>
  )
}
