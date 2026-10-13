# 重置数据库清除残留 Mock 数据

## Summary

上一轮任务已清理源码层面的 mock 数据([seed.ts](file:///d:/Projects/Unibox/Unibox-server/prisma/seed.ts) 和 [settings.service.ts](file:///d:/Projects/Unibox/Unibox-server/src/services/settings.service.ts)),但数据库中仍残留旧的 mock 数据(50 个随机用户、100 个 mock 任务、3 个聊天会话、12 个月 mock 图表数据)。本计划通过执行 `npm run db:seed` 重置数据库,使其与新 seed.ts 一致(仅保留 4 个系统角色和 admin 账号)。

## Current State Analysis

### 数据库环境

[docker-compose.yml](file:///d:/Projects/Unibox/Unibox-server/docker-compose.yml) 定义两个服务:

- **MySQL 8.4** (容器名 `unibox-mysql`,端口 3306,数据库名 `unibox`,用户 `unibox` / 密码 `unibox123`)
- **Redis 7-alpine** (容器名 `unibox-redis`,端口 6379,用于 OTP 缓存)

[.env](file:///d:/Projects/Unibox/Unibox-server/.env) 配置:
- `DATABASE_URL="mysql://unibox:unibox123@localhost:3306/unibox"`
- 仍残留 `SEED_DEMO_EMAIL=demo@unibox.com` 和 `SEED_DEMO_PASSWORD=Demo1234`(第 31-32 行)— 这些环境变量在新 seed.ts 中已不再使用

### seed.ts 行为(已清理版本)

[seed.ts](file:///d:/Projects/Unibox/Unibox-server/prisma/seed.ts) 执行时会按以下顺序 `deleteMany()` 清空所有相关表:

1. `prisma.message.deleteMany()` — 聊天消息
2. `prisma.conversation.deleteMany()` — 聊天会话(包括张三/李四/王五)
3. `prisma.task.deleteMany()` — 100 个 mock 任务
4. `prisma.userInvite.deleteMany()` — 用户邀请
5. `prisma.userNotifications.deleteMany()` — 用户通知设置
6. `prisma.userAccount.deleteMany()` — 用户账户信息
7. `prisma.userProfile.deleteMany()` — 用户资料
8. `prisma.user.deleteMany()` — 所有用户(包括 50 个 mock 用户和 demo 用户)
9. `prisma.role.deleteMany()` — 所有角色

然后重建:
- 4 个系统角色(superadmin / admin / tenant / user)
- 1 个 admin 账号(`admin@unibox.com` / `Admin1234`,含 profile / account / notifications)

### 前端验证(已确认无需修改)

前端所有页面通过 API 拉取数据,无任何硬编码 mock:
- [Dashboard](file:///d:/Projects/Unibox/Unibox-admin/src/features/dashboard/index.tsx) → `dashboardApi.getOverview` / `getAnalytics`
- [Tasks](file:///d:/Projects/Unibox/Unibox-admin/src/features/tasks/index.tsx) → `tasksApi.listTasks`
- [Chats](file:///d:/Projects/Unibox/Unibox-admin/src/features/chats/index.tsx) → `chatsApi.listConversations`

## Proposed Changes

### Change 1: 验证 Docker 容器运行状态

**Why:** seed 需要连接 MySQL,若容器未运行则 seed 会失败。

**How:** 执行 `docker ps` 检查 `unibox-mysql` 和 `unibox-redis` 容器状态。若未运行,执行 `npm run db:up`(即 `docker compose up -d --wait`)启动容器并等待健康检查通过。

### Change 2: 执行数据库重置

**Why:** 清空数据库中残留的 mock 数据,按新 seed.ts 重建干净状态。

**How:** 在 `Unibox-server` 目录执行:

```bash
npm run db:seed
```

该命令等价于 `prisma db seed`,会执行 `tsx prisma/seed.ts`。预期输出:

```
Seed completed.
Admin login: admin@unibox.com / Admin1234
Created admin id: <uuid>
```

**副作用警告:** 此操作会删除数据库中所有现有数据(包括用户创建的真实数据,若有的话)。由于这是开发环境且用户已确认要清除 mock 数据,执行此操作是安全的。

### Change 3: 清理 .env 中无用的 demo 环境变量

**Why:** 新 seed.ts 不再创建 demo 用户,`.env` 中的 `SEED_DEMO_EMAIL` 和 `SEED_DEMO_PASSWORD` 已成为死代码,清理以避免误导。

**How:** 编辑 [Unibox-server/.env](file:///d:/Projects/Unibox/Unibox-server/.env),删除第 31-32 行:

```
SEED_DEMO_EMAIL=demo@unibox.com
SEED_DEMO_PASSWORD=Demo1234
```

同时更新第 28 行注释,将"Seed 脚本凭证"改为"Seed 脚本凭证(admin)"以反映现状。

### Change 4: 验证清理结果

**Why:** 确认数据库已正确重置,mock 数据全部清除。

**How:** 通过 Prisma Studio 或后端 API 验证:

1. **快速验证(推荐):** 启动后端 `npm run dev`,登录后访问:
   - `GET /users?page=1&pageSize=10` → 应只返回 1 条 admin 记录
   - `GET /tasks?page=1&pageSize=10` → 应返回空数组
   - `GET /chats/conversations` → 应返回空数组
   - `GET /dashboard/overview` → `chart: []`, `stats.totalRevenue: 0`,统计数为 1 用户 / 0 任务
   - `GET /dashboard/analytics` → 所有数值字段为 0,数组字段为 `[]`

2. **Prisma Studio 验证(可选):** 执行 `npm run db:studio` 打开 Prisma Studio GUI,人工核对各表数据。

## Assumptions & Decisions

1. **使用 `db:seed` 而非 `db:setup`** — `db:setup` 会重新创建 Docker 容器(`docker compose up -d --wait`)+ 跑 migrations + seed,过于重型。若 Docker 容器已运行,直接 `db:seed` 即可。
2. **不执行 `prisma migrate` 或 `db:push`** — schema 未变更,无需迁移;`db:seed` 自身的 `deleteMany` 足以清空数据。
3. **清理 .env 死变量** — demo 用户已从 seed.ts 移除,对应 env 变量已无引用,清理保持配置与代码一致。
4. **不修改任何前端代码** — 前端已 API 化,无 mock 数据,空状态 UI 已就绪([recent-sales.tsx](file:///d:/Projects/Unibox/Unibox-admin/src/features/dashboard/components/recent-sales.tsx#L10-L12) 等已处理空态)。
5. **不备份当前数据库** — 当前数据全是 mock(50 随机用户 + 100 mock 任务 + 3 聊天会话),无真实业务数据,无需备份。

## Verification Steps

1. **Docker 容器状态:** `docker ps` 显示 `unibox-mysql` 和 `unibox-redis` 状态为 `Up (healthy)`
2. **seed 执行输出:** 控制台仅打印 `admin@unibox.com` 提示,无 `demo@unibox.com`
3. **API 验证:**
   - `/users` 返回 1 条记录(admin)
   - `/tasks` 返回空数组
   - `/chats/conversations` 返回空数组
   - `/dashboard/overview` 返回 `chart: []`、`stats.userCount: 1`、`stats.taskCount: 0`
   - `/dashboard/analytics` 所有字段为 0/空数组
4. **.env 验证:** 文件中不再出现 `SEED_DEMO_EMAIL` / `SEED_DEMO_PASSWORD`
