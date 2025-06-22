-- 为 posts 表添加 image_urls 列来支持多张图片
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_urls TEXT[];

-- 为现有的单张图片数据迁移到新的数组格式
UPDATE posts 
SET image_urls = ARRAY[image_url] 
WHERE image_url IS NOT NULL AND image_urls IS NULL;

-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_posts_image_urls ON posts USING GIN (image_urls);

-- 添加注释
COMMENT ON COLUMN posts.image_urls IS '帖子的多张图片URL数组，第一张为封面图片';
