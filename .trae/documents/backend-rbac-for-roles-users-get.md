# 后端接口权限控制加固计划

## Context（背景）

前端已完成基于角色的 UI 隐藏：
- 侧边栏「用户」菜单仅对 `superadmin`/`admin` 可见
- 用户管理页面的「角色管理 / 邀请用户 / 添加用户」按钮、表格行操作、批量操作均对非管理员隐藏
- `/users` 路由添加了 `beforeLoad` 守卫，非管理员直接重定向回首页

**问题**：前端只是 UI 隐藏，攻击者仍可通过 Postman/curl 直接调用后端接口获取敏感数据。后端的 `GET /roles`、`GET /roles/:id`、`GET /users`、`GET /users/:id` 这 4 个读取接口目前只有 `authenticate`（只校验是否登录），没有角色限制。任何已登录的普通 `user` 用户都能拉取全部角色配置（含权限列表）和全部用户列表（含邮箱、手机号等）。

**目标**：给这 4 个 GET 接口补上 `requireRoles('superadmin', 'admin')`，与前端 UI 隐藏保持一致，形成"前端隐藏 + 后端校验"的双重防护。

## 现状对比

| 路由文件 | 接口 | 当前权限 | 目标权限 |
|---------|------|---------|---------|
| `roles.routes.ts` | `GET /roles` | `authenticate` | `authenticate` + `requireRoles('superadmin', 'admin')` |
| `roles.routes.ts` | `GET /roles/:id` | `authenticate` | `authenticate` + `requireRoles('superadmin', 'admin')` |
| `users.routes.ts` | `GET /users` | `authenticate` | `authenticate` + `requireRoles('superadmin', 'admin')` |
| `users.routes.ts` | `GET /users/:id` | `authenticate` | `authenticate` + `requireRoles('superadmin', 'admin')` |

其余接口（写操作）已正确使用 `requireRoles('superadmin', 'admin')`，无需改动。

## 修改方案

### 核心修改（必须）

#### 1. `Unibox-server/src/routes/roles.routes.ts`

给 `GET /` 和 `GET /:id` 添加 `requireRoles('superadmin', 'admin')` 中间件：

```diff
 rolesRouter.get(
   '/',
+  requireRoles('superadmin', 'admin'),
   asyncHandler(async (_req, res) => {
     const result = await rolesService.listRoles()
     res.suc(result)
   })
 )

 rolesRouter.get(
   '/:id',
+  requireRoles('superadmin', 'admin'),
   asyncHandler(async (req, res) => {
     const result = await rolesService.getRoleById(routeParam(req.params.id))
     res.suc(result)
   })
 )
```

#### 2. `Unibox-server/src/routes/users.routes.ts`

给 `GET /` 和 `GET /:id` 添加 `requireRoles('superadmin', 'admin')` 中间件：

```diff
 usersRouter.get(
   '/',
+  requireRoles('superadmin', 'admin'),
   asyncHandler(async (req, res) => {
     const result = await usersService.listUsers(req.query)
     res.suc(result)
   })
 )

 usersRouter.get(
   '/:id',
+  requireRoles('superadmin', 'admin'),
   asyncHandler(async (req, res) => {
     const result = await usersService.getUserById(routeParam(req.params.id))
     res.suc(result)
   })
 )
```

### 复用的现有工具

- `requireRoles(...roles)` 中间件：定义于 `Unibox-server/src/middleware/auth.ts#L46-L57`，已在本文件的其他写操作接口中使用，模式一致，直接复用即可，无需新建。

### 不在本次修改范围（说明）

以下接口现状合理或超出"对应前端改动"范围，本次不动：

| 接口 | 现状 | 不动原因 |
|------|------|---------|
| `auth.routes.ts` 全部 | 公开或 `authenticate` | 登录/注册/改密等自身操作，合理 |
| `dashboard.routes.ts` | `authenticate` | 所有登录用户都能看仪表盘，合理 |
| `settings.routes.ts` / `chats.routes.ts` | `authenticate` + `req.user.sub` | 操作自身数据，合理 |
| `tasks.routes.ts` 写操作 | 仅 `authenticate` | seed 中权限设计表明 `user` 角色不应 create/edit/delete 任务，但前端未做对应隐藏，属另一议题 |
| `test.routes.ts` | 完全公开 | 测试接口，建议生产环境禁用，属另一议题 |

如需一并处理 tasks 写操作或 test 接口加固，可后续单独提需求。

## 验证方式

### 1. 启动后端服务
```bash
cd Unibox-server
pnpm dev   # 或 npm run dev
```

### 2. 准备两个测试账号
- 管理员：`admin@unibox.com` / `Admin1234`（seed 中的 superadmin）
- 普通用户：`demo@unibox.com` / `Demo1234`（seed 中的 user 角色）

### 3. 分别登录获取 token
```bash
# 管理员登录
curl -X POST http://localhost:3000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@unibox.com","password":"Admin1234"}'

# 普通用户登录
curl -X POST http://localhost:3000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@unibox.com","password":"Demo1234"}'
```

### 4. 验证 4 个接口的权限拦截

**普通用户（demo）应全部返回 403：**
```bash
TOKEN=<demo 的 accessToken>

curl http://localhost:3000/api/roles      -H "Authorization: Bearer $TOKEN"   # 期望 403
curl http://localhost:3000/api/roles/xxx  -H "Authorization: Bearer $TOKEN"   # 期望 403
curl http://localhost:3000/api/users      -H "Authorization: Bearer $TOKEN"   # 期望 403
curl http://localhost:3000/api/users/xxx  -H "Authorization: Bearer $TOKEN"   # 期望 403
```

**管理员（admin）应全部返回 200：**
```bash
TOKEN=<admin 的 accessToken>

curl http://localhost:3000/api/roles      -H "Authorization: Bearer $TOKEN"   # 期望 200
curl http://localhost:3000/api/users      -H "Authorization: Bearer $TOKEN"   # 期望 200
```

**未登录应返回 401：**
```bash
curl http://localhost:3000/api/roles      # 期望 401
curl http://localhost:3000/api/users      # 期望 401
```

### 5. 前端联调验证
- 用 `demo@unibox.com` 登录前端，确认侧边栏无「用户」菜单，直接访问 `/users` 被重定向回首页
- 用 `admin@unibox.com` 登录前端，确认能正常进入用户管理、角色管理页面，数据正常加载

## 影响评估

- **改动范围**：仅 2 个文件，每个文件加 2 行中间件，共 4 处改动
- **兼容性**：不改变任何接口的请求/响应格式，只是给原本开放的读取接口加了一层角色校验
- **风险**：极低。`requireRoles` 中间件已被同文件其他接口使用，模式成熟
- **回归**：管理员账号不受影响；普通用户账号原本就不应访问这些接口（前端已隐藏），现在后端也补上了校验
