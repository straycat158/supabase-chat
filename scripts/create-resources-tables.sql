-- 创建资源分类表
CREATE TABLE IF NOT EXISTS resource_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 创建资源表
CREATE TABLE IF NOT EXISTS resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  download_link TEXT NOT NULL,
  cover_images TEXT[],
  category_id UUID NOT NULL REFERENCES resource_categories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_resources_category_id ON resources(category_id);
CREATE INDEX IF NOT EXISTS idx_resources_user_id ON resources(user_id);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at DESC);

-- 插入默认分类
INSERT INTO resource_categories (name, slug, description, icon) VALUES
  ('模组', 'mods', '各种Minecraft模组，增加新的游戏内容和功能', 'Package'),
  ('材质包', 'texturepacks', '改变游戏视觉效果的材质包', 'Palette'),
  ('光影包', 'shaders', '提升游戏画面效果的光影包', 'Lightbulb'),
  ('地图', 'maps', '各种类型的Minecraft地图', 'Map'),
  ('其他', 'others', '其他类型的Minecraft资源', 'MoreHorizontal')
ON CONFLICT (slug) DO NOTHING;

-- 启用RLS
ALTER TABLE resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
-- 资源分类：所有人可读
CREATE POLICY "Resource categories are viewable by everyone" ON resource_categories
  FOR SELECT USING (true);

-- 资源：所有人可读
CREATE POLICY "Resources are viewable by everyone" ON resources
  FOR SELECT USING (true);

-- 资源：认证用户可创建
CREATE POLICY "Users can create resources" ON resources
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- 资源：用户可更新自己的资源
CREATE POLICY "Users can update own resources" ON resources
  FOR UPDATE USING (auth.uid() = user_id);

-- 资源：用户可删除自己的资源
CREATE POLICY "Users can delete own resources" ON resources
  FOR DELETE USING (auth.uid() = user_id);
