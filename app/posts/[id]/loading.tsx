import { SimpleLoading } from "@/components/simple-loading"

export default function PostLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <SimpleLoading text="加载内容中..." variant="pulse" size="lg" />
    </div>
  )
}
