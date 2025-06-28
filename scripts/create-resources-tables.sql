-- 创建资源分类表
CREATE TABLE IF NOT EXISTS resource_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建资源表
CREATE TABLE IF NOT EXISTS resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  download_link TEXT NOT NULL,
  cover_images TEXT[] DEFAULT '{}',
  category_id UUID REFERENCES resource_categories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入默认分类
INSERT INTO resource_categories (name, slug, description) VALUES
  ('模组', 'mods', '各种功能强大的Minecraft模组，为游戏添加新的内容和机制'),
  ('材质包', 'texturepacks', '高质量的材质包资源，提升游戏的视觉体验'),
  ('光影', 'shaders', '光影包和渲染效果，让你的Minecraft世界更加真实'),
  ('地图', 'maps', '精心制作的自定义地图和存档，探索全新的世界'),
  ('其他', 'others', '其他类型的Minecraft资源和工具')
ON CONFLICT (slug) DO NOTHING;

-- 启用RLS
ALTER TABLE resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- 资源分类的RLS策略
CREATE POLICY "Anyone can view resource categories" ON resource_categories FOR SELECT USING (true);

-- 资源的RLS策略
CREATE POLICY "Anyone can view resources" ON resources FOR SELECT USING (true);
CREATE POLICY "Users can insert their own resources" ON resources FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own resources" ON resources FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own resources" ON resources FOR DELETE USING (auth.uid() = user_id);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
