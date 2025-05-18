-- 创建标签表（如果不存在）
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(255),
  icon VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加外键到posts表（如果不存在）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'tag_id'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN tag_id UUID REFERENCES public.tags(id);
  END IF;
END
$$;

-- 插入初始标签数据
INSERT INTO public.tags (name, slug, description, color, icon)
VALUES
  ('服务器', 'server', '分享和讨论Minecraft服务器', 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', NULL),
  ('模组', 'mod', '分享和讨论Minecraft模组', 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', NULL),
  ('资源包', 'resource-pack', '分享和讨论Minecraft资源包', 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', NULL),
  ('建筑', 'build', '分享和讨论Minecraft建筑作品', 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', NULL),
  ('红石', 'redstone', '分享和讨论Minecraft红石机械', 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', NULL),
  ('问答', 'question', '提问和解答Minecraft相关问题', 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200', NULL),
  ('教程', 'tutorial', '分享Minecraft游戏教程', 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200', NULL),
  ('地图', 'map', '分享和讨论Minecraft地图', 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', NULL)
ON CONFLICT (slug) DO NOTHING;

-- 添加RLS策略
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- 创建策略：所有人可以查看标签
CREATE POLICY "所有人可以查看标签" ON public.tags
  FOR SELECT USING (true);

-- 创建策略：只有管理员可以创建、更新和删除标签
CREATE POLICY "只有管理员可以创建标签" ON public.tags
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true));

CREATE POLICY "只有管理员可以更新标签" ON public.tags
  FOR UPDATE USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true));

CREATE POLICY "只有管理员可以删除标签" ON public.tags
  FOR DELETE USING (auth.uid() IN (SELECT id FROM public.profiles WHERE is_admin = true));
