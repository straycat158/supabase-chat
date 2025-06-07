import { SimpleLoading } from "@/components/simple-loading"

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <SimpleLoading text="页面加载中..." variant="spinner" size="lg" />
    </div>
  )
}
