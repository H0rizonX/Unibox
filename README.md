# Unibox

Unibox 全栈项目，基于 Turborepo 管理的 monorepo。

## 项目结构

```
unibox/
├── apps/
│   ├── admin/     # 管理后台前端 (Vite + React + TanStack Router)
│   ├── main/      # 主站前端 (Next.js)
│   └── server/    # 后端服务 (Express + Prisma)
├── packages/      # 共享包（预留）
├── package.json   # 根级配置
├── turbo.json     # Turborepo 任务编排
└── pnpm-workspace.yaml
```

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发

```bash
# 启动所有应用的开发服务器
pnpm dev

# 启动单个应用
pnpm dev --filter=admin
pnpm dev --filter=main
pnpm dev --filter=server
```

### 构建

```bash
# 构建所有应用
pnpm build

# 构建单个应用
pnpm build --filter=admin
```

### Lint & Format

```bash
pnpm lint
pnpm lint:fix
pnpm format
pnpm typecheck
```

### 数据库（server）

```bash
pnpm db:generate
pnpm db:push
pnpm db:migrate
pnpm db:studio
```

## 技术栈

| 应用 | 框架 | 工具链 |
|------|------|--------|
| admin | Vite + React 19 + TanStack Router | ESLint + Prettier |
| main | Next.js 16 + React 19 | Biome |
| server | Express 5 + Prisma | ESLint + Prettier |
