import { SimpleLoading } from "@/components/simple-loading"

export default function ProfileLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <SimpleLoading text="加载个人资料..." variant="spinner" size="lg" />
    </div>
  )
}
