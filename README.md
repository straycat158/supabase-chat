# Minecraft论坛

一个使用Next.js和Supabase构建的Minecraft社区论坛。

## 功能特点

- 用户认证（注册、登录、个人资料管理）
- 帖子发布和管理
- 评论系统
- 标签系统（分类帖子）
- 资源中心（按标签分类展示内容）
- 图片上传
- 实时更新
- 响应式设计

## 环境设置

1. 克隆仓库
\`\`\`bash
git clone <repository-url>
cd minecraft-forum
\`\`\`

2. 安装依赖
\`\`\`bash
npm install
\`\`\`

3. 配置环境变量
   - 复制`.env.example`文件并重命名为`.env`
   - 在[Supabase](https://supabase.com)创建一个新项目
   - 从Supabase项目设置中获取API凭据
   - 将凭据填入`.env`文件

\`\`\`bash
cp .env.example .env
# 编辑.env文件，填入你的Supabase凭据
\`\`\`

4. 启动开发服务器
\`\`\`bash
npm run dev
\`\`\`

5. 初始化存储桶
   - 访问`/admin/storage`页面
   - 点击"初始化存储桶"按钮

6. 初始化标签系统
   - 在Supabase SQL编辑器中运行`scripts/create-tags.sql`脚本
   - 或者访问`/admin/tags`页面手动创建标签

## 数据库设置

Supabase数据库需要以下表：

1. `profiles` - 用户资料
2. `posts` - 帖子
3. `comments` - 评论
4. `announcements` - 公告
5. `tags` - 标签

详细的数据库结构可以在`lib/types/database.ts`文件中找到。

## 标签系统

论坛实现了完整的标签系统，允许用户：

1. 在发帖时选择标签（如服务器、模组、资源包等）
2. 在帖子列表页按标签筛选帖子
3. 在资源中心页面按标签分类浏览内容
4. 管理员可以在`/admin/tags`页面管理标签

## 环境变量

项目需要以下环境变量：

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase项目URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase匿名密钥
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase服务角色密钥（用于管理员操作）

## 部署

该项目可以部署到Vercel或其他支持Next.js的平台。确保在部署环境中设置所有必要的环境变量。

\`\`\`bash
npm run build
npm start
\`\`\`

## 技术栈

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)
