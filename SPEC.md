# 云画册展示与获客系统 - 技术规范文档

## 1. 项目概述

### 项目名称
云画册展示与获客系统 (E-Catalog Pro)

### 核心功能
- 企业移动端产品展示画册
- H5页面收集潜在客户线索
- 后台提供分级管理功能

### 目标用户
- **C端用户**：通过微信查看画册的潜在买家
- **B端客户**：使用系统生成画册的企业主/销售
- **超级管理员**：平台运营方

---

## 2. 技术架构

### 技术选型
| 模块 | 技术选择 |
|------|----------|
| 前端框架 | Next.js 14 (App Router) |
| H5 UI组件 | Ant Design Mobile |
| 后台 UI组件 | Ant Design |
| 后端/数据库 | Supabase (PostgreSQL + Auth + Storage) |
| 部署平台 | Vercel + Supabase Cloud |

### 数据库
- **Supabase**: 已配置 (凭证: 12345688)
- **存储**: Supabase Storage (图片)

---

## 3. 数据库表结构

### 3.1 profiles (用户扩展信息)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键，关联auth.users |
| role | text | 'super_admin' 或 'client' |
| company_name | text | 公司名称 |
| phone | text | 联系电话 |
| status | text | 'active' 或 'suspended' |
| created_at | timestamp | 创建时间 |

### 3.2 catalogs (电子画册)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| user_id | uuid | 所属用户 |
| title | text | 画册标题 |
| banner_url | text | 顶部Banner图片 |
| share_image | text | 微信分享图 |
| share_desc | text | 微信分享描述 |
| template | text | 展示模板 |
| sort_order | integer | 排序 |
| is_active | boolean | 是否启用 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

### 3.3 categories (产品分类)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| catalog_id | uuid | 所属画册 |
| name | text | 分类名称 |
| sort_order | integer | 排序权重 |
| is_visible | boolean | 是否显示 |
| created_at | timestamp | 创建时间 |

### 3.4 products (产品)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| catalog_id | uuid | 所属画册 |
| category_id | uuid | 所属分类 |
| title | text | 产品名称 |
| description | text | 产品详情 |
| images | text[] | 产品图片数组 |
| price | decimal | 价格 |
| is_active | boolean | 是否上架 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

### 3.5 leads (线索/获客信息)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| catalog_id | uuid | 关联画册 |
| visitor_name | text | 访客姓名 |
| visitor_phone | text | 访客手机 |
| visitor_company | text | 访客公司 |
| share_config | text | 分享配置 |
| created_at | timestamp | 创建时间 |

---

## 4. 页面结构

### 4.1 H5端 (画册展示)
```
/                     -> 引导页/表单页
/[catalogId]          -> 画册主页（Banner + 分类 + 产品）
/[catalogId]/product/[productId]  -> 产品详情页
```

### 4.2 管理后台
```
/admin/login          -> 登录页
/admin                -> 管理后台首页
/admin/catalogs       -> 画册管理
/admin/categories     -> 分类管理
/admin/products       -> 产品管理
/admin/leads          -> 线索管理
```

---

## 5. 功能清单

### 5.1 超级管理员功能
- [x] 登录后台
- [x] 创建/编辑/删除画册
- [x] 管理所有客户账号
- [x] 查看所有线索
- [x] 系统设置

### 5.2 客户功能
- [x] 登录后台
- [x] 创建/编辑/删除自己的画册
- [x] 添加/编辑/删除分类
- [x] 添加/编辑/删除产品
- [x] 查看自己的线索
- [x] 生成专属分享链接

### 5.3 H5端功能
- [x] 引导页填写信息
- [x] 画册主页展示
- [x] 分类切换
- [x] 产品详情查看
- [x] 微信分享

---

## 6. UI设计规范

### 色彩方案
- 主色调: #1677FF (企业蓝)
- 背景色: #F5F5F5 (浅灰)
- 后台背景: #F0F2F5
- 内容区: #FFFFFF (纯白)
- 文字: #333333
- 次要文字: #666666

### 响应式设计
- 移动端优先 (H5)
- 桌面端适配 (后台)

---

## 7. 安全策略

### Row Level Security (RLS)
- 用户只能查看/编辑自己的数据
- 超级管理员可查看所有数据
- 产品展示页公开可读

---

## 8. 部署信息

- 前端部署: Vercel
- 数据库: Supabase Cloud
- 临时开发数据库: Supabase (凭证: 12345688)
