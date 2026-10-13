# 清除用户 Mock 数据

## Summary

清除项目中的用户 mock 数据,同时清理关联的任务、聊天会话和首页 dashboard 的 mock 数据。保留 `admin@unibox.com` 超级管理员账号和 4 个系统角色定义,移除其余所有 mock 数据。

## Current State Analysis

经过对代码库的探索,确认 mock 数据分布在以下两个后端文件:

### 1. [Unibox-server/prisma/seed.ts](file:///d:/Projects/Unibox/Unibox-server/prisma/seed.ts) (356 行)

种子脚本,通过 `npm run db:seed` (即 `prisma db seed` → `tsx prisma/seed.ts`) 执行。包含:

- **4 个系统角色** (superadmin / admin / tenant / user) — 第 84-177 行 — **保留**(系统角色,非 mock)
- **1 个 admin 用户** (`admin@unibox.com` / `Admin1234`) — 第 179-218 行 — **保留**
- **1 个 demo 用户** (`demo@unibox.com`) — 第 220-233 行 — **移除**
- **50 个随机生成的 demo 用户** — 第 235-261 行 — **移除**
- **100 个 mock 任务** — 第 263-279 行 — **移除**
- **3 个 mock 聊天会话** (含张三/李四/王五的消息) — 第 281-341 行 — **移除**

脚本顶部的常量数组(`FIRST_NAMES`、`LAST_NAMES`、`USER_STATUSES`、`USER_ROLES`、`TASK_STATUSES`、`TASK_LABELS`、`TASK_PRIORITIES`)和辅助函数(`pick`、`randomDatePast`、`randomDateRecent`)仅用于 mock 生成,需一并删除。

### 2. [Unibox-server/src/services/settings.service.ts](file:///d:/Projects/Unibox/Unibox-server/src/services/settings.service.ts) (288+ 行)

首页 dashboard 数据来源,包含两个函数:

- **`getDashboardOverview()`** (第 216-257 行):
  - `chart` (12 个月数据) — 使用 `Math.random()` 生成 — **mock,清空为 `[]`**
  - `stats.totalRevenue` — 由 mock chart 累加得出 — **mock,置为 0**(保留字段以维持 [前端类型](file:///d:/Projects/Unibox/Unibox-admin/src/api/types.ts#L89-L105) 兼容)
  - `stats.userCount` / `activeUsers` / `taskCount` / `completedTasks` — 真实 DB 计数 — **保留**
  - `recentSales` — 从 `prisma.task.findMany` 拉取,清理 tasks 后自然为空数组 — **保留逻辑**
- **`getDashboardAnalytics()`** (第 259-287 行):
  - `traffic` 全部字段(totalClicks、uniqueVisitors、bounceRate、avgSessionDuration、weeklyChart)— **mock,清零/置空数组**
  - `sources` — **mock,置空数组**
  - `devices` — **mock,置空数组**

### 前端验证

前端无任何 mock 数据:
- [dashboard/index.tsx](file:///d:/Projects/Unibox/Unibox-admin/src/features/dashboard/index.tsx) 通过 `useQuery` + `dashboardApi.getOverview` 拉取
- [analytics.tsx](file:///d:/Projects/Unibox/Unibox-admin/src/features/dashboard/components/analytics.tsx) 通过 `dashboardApi.getAnalytics` 拉取
- [recent-sales.tsx](file:///d:/Projects/Unibox/Unibox-admin/src/features/dashboard/components/recent-sales.tsx#L10-L12) 已处理 `items.length === 0` 空状态,显示"暂无最近任务"
- 用户列表页 [features/users/index.tsx](file:///d:/Projects/Unibox/Unibox-admin/src/features/users/index.tsx) 通过 `usersApi.listUsers` 拉取

清空 mock 后前端会自然显示空状态/0 值,无需修改前端代码。

## Proposed Changes

### Change 1: 重写 [Unibox-server/prisma/seed.ts](file:///d:/Projects/Unibox/Unibox-server/prisma/seed.ts)

**Why:** 移除所有 mock 数据生成逻辑,仅保留系统角色和 admin 账号。

**How:** 完整重写文件,新结构如下:

```typescript
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 清空所有表(顺序:先清引用方,再清被引用方)
  await prisma.message.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.task.deleteMany()
  await prisma.userInvite.deleteMany()
  await prisma.userNotifications.deleteMany()
  await prisma.userAccount.deleteMany()
  await prisma.userProfile.deleteMany()
  await prisma.user.deleteMany()
  await prisma.role.deleteMany()

  // 4 个系统角色(保留)
  const rolesData = [
    { /* superadmin 块,与原文件相同 */ },
    { /* admin 块,与原文件相同 */ },
    { /* tenant 块,与原文件相同 */ },
    { /* user 块,与原文件相同 */ },
  ]
  await prisma.role.createMany({ data: rolesData })

  // 仅保留 admin 账号
  const passwordHash = await bcrypt.hash('Admin1234', 10)
  const admin = await prisma.user.create({
    data: { /* 与原文件 admin 创建块相同 */ },
  })

  console.log('Seed completed.')
  console.log('Admin login: admin@unibox.com / Admin1234')
  console.log(`Created admin id: ${admin.id}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

**删除的内容:**
- `USER_STATUSES`、`USER_ROLES`、`TASK_STATUSES`、`TASK_LABELS`、`TASK_PRIORITIES` 常量(原第 7-17 行)
- `FIRST_NAMES`、`LAST_NAMES` 数组(原第 19-57 行)
- `pick`、`randomDatePast`、`randomDateRecent` 辅助函数(原第 59-71 行)
- demo 用户创建(原第 220-233 行)
- 50 个随机用户循环(原第 235-261 行)
- 100 个 mock 任务创建(原第 263-279 行)
- `chatUsers` 数组及聊天会话创建(原第 281-341 行)
- `Demo login:` 的 console.log(原第 345 行)

**保留的内容:**
- 全部 `deleteMany()` 清表逻辑(确保重跑 seed 时干净起步)
- 4 个系统角色完整定义(含 permissions JSON)
- admin 用户创建(含 profile / account / notifications 嵌套创建)
- admin 的 console.log 提示

### Change 2: 修改 [Unibox-server/src/services/settings.service.ts](file:///d:/Projects/Unibox/Unibox-server/src/services/settings.service.ts) 中的 `getDashboardOverview` 函数

**Why:** 移除首页概览的 mock 图表数据,保留真实 DB 计数。

**How:** 修改第 216-257 行的 `getDashboardOverview` 函数,删除 `months` 数组生成,直接返回空图表和零收入:

```typescript
export async function getDashboardOverview() {
  const [userCount, taskCount, activeUsers, completedTasks] = await Promise.all([
    prisma.user.count(),
    prisma.task.count(),
    prisma.user.count({ where: { status: 'active' } }),
    prisma.task.count({ where: { status: 'done' } }),
  ])

  return {
    stats: {
      totalRevenue: 0,
      userCount,
      taskCount,
      activeUsers,
      completedTasks,
    },
    chart: [],
    recentSales: await prisma.task.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        assignee: true,
        status: true,
        updatedAt: true,
      },
    }),
  }
}
```

### Change 3: 修改 [Unibox-server/src/services/settings.service.ts](file:///d:/Projects/Unibox/Unibox-server/src/services/settings.service.ts) 中的 `getDashboardAnalytics` 函数

**Why:** 移除首页分析 Tab 的全部 mock 数据(流量、来源、设备)。

**How:** 修改第 259-287 行的 `getDashboardAnalytics` 函数,返回零值和空数组,保持类型结构不变:

```typescript
export async function getDashboardAnalytics() {
  return {
    traffic: {
      totalClicks: 0,
      uniqueVisitors: 0,
      bounceRate: 0,
      avgSessionDuration: '0m 0s',
      weeklyChart: [],
    },
    sources: [],
    devices: [],
  }
}
```

## Assumptions & Decisions

1. **保留 4 个系统角色定义** — 它们是 RBAC 体系的基石,非 mock 数据;前端 [data/data.ts](file:///d:/Projects/Unibox/Unibox-admin/src/features/users/data/data.ts) 和后端 [requireRoles](file:///d:/Projects/Unibox/Unibox-server/src/middleware) 中间件都依赖这些角色名。
2. **保留 `totalRevenue: 0` 字段** — 不修改 [前端 DashboardOverview 类型](file:///d:/Projects/Unibox/Unibox-admin/src/api/types.ts#L89-L105),避免引入跨端类型不一致风险。dashboard 首页未实际展示该字段。
3. **保留 `recentSales` 的 DB 查询逻辑** — 清空 tasks 后会自然返回 `[]`,前端 [recent-sales.tsx](file:///d:/Projects/Unibox/Unibox-admin/src/features/dashboard/components/recent-sales.tsx#L10-L12) 已处理空态。
4. **`getDashboardAnalytics` 返回零值而非空对象** — 保持类型契约完整,前端会显示 "0 / 空图表",而非运行时崩溃。
5. **不修改前端代码** — 所有 mock 数据都在后端,前端已具备空状态处理能力。
6. **不执行 `npm run db:seed`** — 本计划仅修改源码,是否重跑 seed 由用户自行决定(因 `db:seed` 会清空并重建 DB 数据,属于有副作用操作,需用户确认后执行)。

## Verification Steps

执行计划后,通过以下步骤验证:

1. **TypeScript 类型检查**:
   ```bash
   cd Unibox-server && npm run typecheck
   ```
   预期:无错误(seed.ts 与 settings.service.ts 类型完整)。

2. **ESLint 检查**:
   ```bash
   cd Unibox-server && npm run lint
   ```
   预期:无错误(已移除所有未使用的常量和辅助函数)。

3. **手动验证 seed.ts 输出(可选,需用户授权执行)**:
   ```bash
   cd Unibox-server && npm run db:seed
   ```
   预期输出仅包含 `admin@unibox.com`,无 `demo@unibox.com`。

4. **手动验证 Dashboard API**:
   - 启动后端,登录后访问 `GET /dashboard/overview`,确认返回 `chart: []`、`stats.totalRevenue: 0`。
   - 访问 `GET /dashboard/analytics`,确认所有数值字段为 0、数组字段为 `[]`。

5. **前端 UI 验证**:
   - 启动前端,登录后访问首页 → 概览 Tab,确认图表为空、统计卡片显示真实 DB 数值(若未跑 seed,则用户数=0)。
   - 切换到分析 Tab,确认图表为空、统计卡片显示 0。
   - 访问 `/users`,确认用户列表仅显示 admin(若已重跑 seed)或保持空状态。
