import { MinecraftLoading } from "@/components/minecraft-loading"

export default function PostsLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <MinecraftLoading text="挖掘帖子中..." />
    </div>
  )
}
