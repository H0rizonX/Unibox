# Unibox Server

Unibox-admin 管理后台的 REST API 后端服务，基于 Node.js + Express + TypeScript + Prisma + **MySQL** 构建。

## 为什么选择 MySQL 而非 SQLite？

| 维度     | SQLite                 | MySQL（当前选型）              |
| -------- | ---------------------- | ------------------------------ |
| 适用场景 | 单机原型、嵌入式       | 多用户 Web 服务、生产环境      |
| 并发写入 | 较弱（文件锁）         | 强，支持多管理员同时操作       |
| 部署     | 单文件，无法多实例共享 | 独立服务，支持 Docker / 云 RDS |
| 团队协作 | 每人本地一份数据       | 统一数据库，数据一致           |
| 运维     | 几乎零配置             | 标准备份、监控、主从复制       |
| 本地开发 | 开箱即用               | 需 MySQL 服务（已提供 Docker） |

**结论：** Unibox 是多用户管理后台，需要认证、用户/任务 CRUD 和后续生产部署，**MySQL 更合适**。SQLite 仅适合个人快速原型，不适合作为正式后端数据库。

## 功能模块

| 模块   | 路径前缀         | 说明                           |
| ------ | ---------------- | ------------------------------ |
| 认证   | `/api/auth`      | 登录、注册、忘记密码、OTP 验证 |
| 用户   | `/api/users`     | 用户 CRUD、批量删除、邀请      |
| 任务   | `/api/tasks`     | 任务 CRUD、批量删除、CSV 导入  |
| 仪表盘 | `/api/dashboard` | 概览数据、分析统计             |
| 设置   | `/api/settings`  | 个人资料、账户、通知偏好       |
| 聊天   | `/api/chats`     | 会话列表、发送消息             |

## 快速开始

### 前置要求

- Node.js 18+
- Docker Desktop（用于本地 MySQL，推荐）
- 或已安装的 MySQL 8.x

### 1. 安装依赖

```bash
cd Unibox-server
pnpm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

默认 `DATABASE_URL` 对应 `docker-compose.yml` 中的 MySQL 配置。

### 3. 启动 MySQL 并初始化

**方式 A：Docker（推荐）**

```bash
pnpm db:setup
```

该命令会：启动 MySQL 容器 → 执行迁移 → 填充种子数据。

**方式 B：已有 MySQL 实例**

修改 `.env` 中的连接串：

```env
DATABASE_URL="mysql://用户名:密码@主机:3306/数据库名"
```

然后执行：

```bash
pnpm db:migrate:deploy
pnpm db:seed
```

### 4. 启动开发服务器

```bash
pnpm dev
```

服务默认运行在 `http://localhost:3001`。

## Docker MySQL 默认配置

| 项        | 值               |
| --------- | ---------------- |
| 主机      | `localhost:3306` |
| 数据库    | `unibox`         |
| 用户名    | `unibox`         |
| 密码      | `unibox123`      |
| Root 密码 | `root`           |

```bash
pnpm db:up      # 仅启动 MySQL
pnpm db:down    # 停止 MySQL
```

## 默认账户

| 角色       | 邮箱             | 密码      |
| ---------- | ---------------- | --------- |
| 超级管理员 | admin@unibox.com | Admin1234 |
| 演示用户   | demo@unibox.com  | Demo1234  |

## API 概览

### 认证

```http
POST /api/auth/sign-in
Content-Type: application/json

{ "email": "admin@unibox.com", "password": "Admin1234" }
```

响应格式（与前端 `auth-store` 对齐）：

```json
{
  "accessToken": "eyJ...",
  "user": {
    "accountNo": "ACC001",
    "email": "admin@unibox.com",
    "role": ["superadmin"],
    "exp": 1719158400000
  }
}
```

后续请求需在 Header 中携带：

```http
Authorization: Bearer <accessToken>
```

### 错误响应

与前端 `handle-server-error.ts` 对齐，使用 `title` 字段：

```json
{ "title": "邮箱或密码错误。" }
```

## 与前端对接

在 Unibox-admin 中配置 API 地址：

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

## Git 提交规范

本项目使用 [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/okonet/lint-staged) 在 **commit 前**强制执行 ESLint / Prettier。提交信息约定采用 [Conventional Commits](https://www.conventionalcommits.org/)（当前 **未** 接入 commitlint，文案靠约定遵守）。

### 提交前必须满足（由钩子强制）

`git commit` 时会触发 `.husky/pre-commit` → `pnpm lint-staged`，仅检查**暂存区**文件：

| 匹配文件               | 自动执行                            |
| ---------------------- | ----------------------------------- |
| `*.{ts,js}`            | `eslint --fix` → `prettier --write` |
| `*.{json,md,yml,yaml}` | `prettier --write`                  |
| `eslint.config.js`     | `prettier --write`                  |

任一命令失败（例如 ESLint 报错且无法自动修复），提交会被中断。

### ESLint 关键约束（提交前需通过）

配置见 `eslint.config.js`（忽略 `dist/**`、`node_modules/**`、`prisma/migrations/**`）：

- 允许 `console`（服务端日志场景，`no-console: off`）
- 禁止未使用变量；可用 `_` 前缀忽略（`@typescript-eslint/no-unused-vars`）
- 类型导入须使用 `import type` / inline type import（`consistent-type-imports`）
- 禁止同一模块重复 import（`no-duplicate-imports`）
- 与 Prettier 冲突的格式规则已关闭（`eslint-config-prettier`）

### 提交信息约定（Conventional Commits）

格式：

```text
<type>(可选范围): <简要说明>

[可选正文]

[可选脚注]
```

常用 `type`：

| type       | 含义                     |
| ---------- | ------------------------ |
| `feat`     | 新功能                   |
| `fix`      | 缺陷修复                 |
| `docs`     | 仅文档                   |
| `style`    | 格式/样式（不影响逻辑）  |
| `refactor` | 重构（非 feat/fix）      |
| `perf`     | 性能优化                 |
| `test`     | 测试                     |
| `chore`    | 构建、依赖、工具链等杂项 |
| `ci`       | CI 配置                  |

说明：

- 使用现在时、祈使语气；说明「为什么」优先于堆砌文件列表
- 中英文均可；本仓库近期习惯为中文说明，例如：`feat: 清除 mock 账号`
- 范围（scope）可选，建议与模块对应：`auth`、`users`、`tasks`、`dashboard`、`prisma` 等
- 破坏性变更在正文或脚注标明 `BREAKING CHANGE:`

示例：

```bash
git commit -m "feat(users): 增加批量邀请接口"
git commit -m "fix(auth): 拉黑后禁止用户再登录"
git commit -m "chore(db): 调整 prisma 迁移脚本"
```

### 推荐提交流程

```bash
# 1. 查看改动
git status
git diff

# 2. 只暂存本次相关文件
git add <files>

# 3. 提交（会自动跑 lint-staged）
git commit -m "fix(auth): 简述原因"

# 4. 确认成功
git status
```

### 钩子安装

`pnpm install` 时通过 `prepare` 脚本自动安装 Husky。若钩子未生效：

```bash
pnpm prepare
```

请在**本仓库根目录**（`Unibox-server`）执行 git 操作，确保能读到 `.husky/pre-commit`。

### 跳过钩子（不推荐）

仅紧急热修等场景可临时跳过；**合并进主分支前仍须保证 lint 通过**：

```bash
git commit --no-verify -m "你的提交信息"
```

### 手动检查（不依赖 commit）

```bash
pnpm lint          # ESLint
pnpm lint:fix     # ESLint 自动修复
pnpm format:check  # Prettier 检查
pnpm format        # Prettier 写回
pnpm typecheck     # TypeScript 类型检查（钩子未强制，建议提交前自查）
```

## 技术栈

- **Runtime:** Node.js
- **Framework:** Express 5
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** MySQL 8
- **Auth:** JWT + bcrypt

## 脚本

| 命令                     | 说明                         |
| ------------------------ | ---------------------------- |
| `pnpm dev`               | 开发模式（热重载）           |
| `pnpm build`             | 编译 TypeScript              |
| `pnpm start`             | 运行编译产物                 |
| `pnpm db:up`             | 启动 MySQL 容器              |
| `pnpm db:setup`          | 启动 MySQL + 迁移 + 种子数据 |
| `pnpm db:migrate`        | 开发环境创建/应用迁移        |
| `pnpm db:migrate:deploy` | 生产环境应用迁移             |
| `pnpm db:seed`           | 填充种子数据                 |
| `pnpm db:studio`         | 打开 Prisma Studio           |

## 目录结构

```
Unibox-server/
├── docker-compose.yml   # 本地 MySQL
├── prisma/
│   ├── schema.prisma
│   ├── migrations/      # 数据库迁移
│   └── seed.ts
└── src/
    ├── config/
    ├── lib/
    ├── middleware/
    ├── routes/
    ├── services/
    ├── validators/
    ├── app.ts
    └── index.ts
```
