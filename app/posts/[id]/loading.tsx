import { MinecraftLoading } from "@/components/minecraft-loading"

export default function PostLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <MinecraftLoading text="建造内容中..." />
    </div>
  )
}
