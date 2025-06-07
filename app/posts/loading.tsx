import { SimpleLoading } from "@/components/simple-loading"

export default function PostsLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <SimpleLoading text="获取帖子中..." variant="dots" size="lg" />
    </div>
  )
}
