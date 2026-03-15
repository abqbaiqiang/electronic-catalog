# 电子画册系统 - 部署指南

## 方式一：使用Vercel一键部署（推荐）

### 步骤：

1. **安装Node.js**（如果还没有）
   - 下载地址：https://nodejs.org/
   - 选择LTS版本安装

2. **安装Vercel CLI**
   ```bash
   npm install -g vercel
   ```

3. **进入项目目录并部署**
   ```bash
   cd C:\Users\Administrator\Desktop\电子画册网站
   vercel --prod
   ```

4. **按提示操作**
   - 首次使用需要登录邮箱
   - 选择默认选项即可
   - 等待部署完成

---

## 方式二：使用Git部署（推荐）

1. **将项目上传到GitHub**
   - 在GitHub创建新仓库
   - 将 `C:\Users\Administrator\Desktop\电子画册网站` 文件夹内容上传

2. **在Vercel导入项目**
   - 访问 https://vercel.com
   - 使用GitHub账号登录
   - 点击 "New Project"
   - 选择刚才创建的GitHub仓库
   - 点击 "Deploy"

---

## 方式三：使用部署脚本（最简单）

**双击运行 `deploy.bat` 文件**
- 文件位置：`C:\Users\Administrator\Desktop\电子画册网站\deploy.bat`
- 按提示完成部署

---

## 部署后的配置

部署完成后，需要更新数据库连接：

1. 打开 `lib/supabase.js`
2. 将其中的 `supabaseUrl` 和 `supabaseKey` 替换为您的真实Supabase或阿里云数据库配置
3. 重新部署

---

## 常见问题

**Q: 部署后页面显示空白？**
A: 检查浏览器控制台是否有错误，可能是数据库连接配置问题

**Q: 如何绑定自己的域名？**
A: 在Vercel项目设置中添加自定义域名

**Q: 数据库在哪里？**
A: 当前使用Supabase演示数据库，之后可迁移到您的阿里云RDS
