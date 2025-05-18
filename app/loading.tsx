import { MinecraftLoading } from "@/components/minecraft-loading"

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <MinecraftLoading text="世界生成中..." />
    </div>
  )
}
