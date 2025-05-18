"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { TagBadge } from "@/components/tag-badge"
import type { Tag } from "@/lib/types/database"

interface TagSelectorProps {
  selectedTagId: string | null
  onTagSelect: (tagId: string | null) => void
  className?: string
}

export function TagSelector({ selectedTagId, onTagSelect, className }: TagSelectorProps) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)

  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase.from("tags").select("*").order("name")

        if (error) throw error

        setTags(data || [])

        // 如果有选中的标签ID，找到对应的标签对象
        if (selectedTagId) {
          const tag = data?.find((t) => t.id === selectedTagId) || null
          setSelectedTag(tag)
        }
      } catch (error) {
        console.error("获取标签失败:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTags()
  }, [supabase, selectedTagId])

  const handleTagSelect = (tagId: string) => {
    const tag = tags.find((t) => t.id === tagId) || null
    setSelectedTag(tag)
    onTagSelect(tagId)
    setOpen(false)
  }

  const handleClearTag = () => {
    setSelectedTag(null)
    onTagSelect(null)
  }

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            {selectedTag ? (
              <div className="flex items-center">
                <TagBadge tag={selectedTag} />
              </div>
            ) : (
              <span className="text-muted-foreground">选择帖子标签</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="搜索标签..." />
            <CommandList>
              <CommandEmpty>{loading ? "加载中..." : "没有找到标签"}</CommandEmpty>
              <CommandGroup>
                {tags.map((tag) => (
                  <CommandItem key={tag.id} value={tag.name} onSelect={() => handleTagSelect(tag.id)}>
                    <Check className={cn("mr-2 h-4 w-4", selectedTag?.id === tag.id ? "opacity-100" : "opacity-0")} />
                    <TagBadge tag={tag} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
          {selectedTag && (
            <div className="p-2 border-t">
              <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={handleClearTag}>
                清除选择
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
