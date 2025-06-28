-- 创建资源分类表
CREATE TABLE IF NOT EXISTS public.resource_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建资源表
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  download_link VARCHAR(500) NOT NULL,
  cover_images TEXT[] DEFAULT '{}',
  category_id UUID NOT NULL REFERENCES public.resource_categories(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入资源分类
INSERT INTO public.resource_categories (name, slug, description)
VALUES
  ('模组', 'mods', '各种Minecraft模组资源'),
  ('材质包', 'texture-packs', '高质量材质包资源'),
  ('光影', 'shaders', '光影包和渲染效果'),
  ('地图', 'maps', '自定义地图和存档'),
  ('其他', 'others', '其他类型的Minecraft资源')
ON CONFLICT (slug) DO NOTHING;

-- 添加RLS策略
ALTER TABLE public.resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- 资源分类策略：所有人可以查看
CREATE POLICY "所有人可以查看资源分类" ON public.resource_categories
  FOR SELECT USING (true);

-- 资源策略：所有人可以查看
CREATE POLICY "所有人可以查看资源" ON public.resources
  FOR SELECT USING (true);

-- 资源策略：登录用户可以创建
CREATE POLICY "登录用户可以创建资源" ON public.resources
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 资源策略：用户可以更新自己的资源
CREATE POLICY "用户可以更新自己的资源" ON public.resources
  FOR UPDATE USING (auth.uid() = user_id);

-- 资源策略：用户可以删除自己的资源
CREATE POLICY "用户可以删除自己的资源" ON public.resources
  FOR DELETE USING (auth.uid() = user_id);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON public.resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
