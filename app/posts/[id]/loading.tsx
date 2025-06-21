import { SimpleLoading } from "@/components/simple-loading"

export default function PostLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] bg-white dark:bg-black">
      <SimpleLoading text="加载内容中..." variant="geometric" size="lg" />
    </div>
  )
}
