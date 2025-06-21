import { SimpleLoading } from "@/components/simple-loading"

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] bg-white dark:bg-black">
      <SimpleLoading text="页面加载中..." variant="geometric" size="lg" />
    </div>
  )
}
