import { SimpleLoading } from "@/components/simple-loading"

export default function ProfileLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] bg-white dark:bg-black">
      <SimpleLoading text="加载个人资料..." variant="geometric" size="lg" />
    </div>
  )
}
