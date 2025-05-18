import { MinecraftLoading } from "@/components/minecraft-loading"

export default function ProfileLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <MinecraftLoading text="加载玩家数据..." />
    </div>
  )
}
