# 前端 Feature 模块化规范

> 适用范围：`Unibox-admin`
> 依据：2026 年主流 React 社区最佳实践（feature-based architecture、colocation、Bulletproof React、FSD 思想）综合提炼，结合本仓库现状裁剪而成。

## 1. 核心原则

### 1.1 Colocation（就近放置）
"会一起改变的东西，就放在一起。"

- 某个组件专属的 hook、工具函数、类型、测试，应当与该组件位于同一目录或其子目录，而不是按文件类型分散到顶层 `hooks/` `utils/` `types/`。
- 判定标准：删除该组件时，能否通过删除一个文件夹就把所有相关物一并清理掉。若需要跨目录"考古"，说明违反了 colocation。

### 1.2 Feature-based（按业务领域分类）
按"业务领域 / 用户场景"分文件夹，而不是按"文件是什么类型"分。

```
src/
  features/
    users/              ← 一个业务领域就是一个文件夹
      components/
      data/             ← schema、静态枚举
      hooks/            ← 该领域专属 hook
      api/              ← 该领域专属 API 调用
      index.tsx         ← 页面入口
  components/           ← 仅放真正领域无关的通用 UI 基元（Button、Modal、Input）
  hooks/               ← 仅放真正全局复用的 hook（useDebounce、useLocalStorage）
  lib/                 ← 外部库的薄封装
```

### 1.3 抽象时机：三次法则（Rule of Three）
- 第 1 次出现：直接内联写，不要抽。
- 第 2 次相似：再写一遍（重复优于错误的抽象）。
- 第 3 次出现：信号足够，抽成 hook / util。

过早抽象比重复更糟——一个形状不对的抽象会污染后续所有调用方。本仓库已有的 `useAuthorization`、`useUsers` 等均符合"已被多处复用"的标准。

### 1.4 `components/` 与 `shared/` 的纪律
- `src/components/`（全局）：只能放 **领域无关** 的 UI 基元。若一个组件包含任何业务逻辑、引用了 `features/` 下的东西，它就不属于这里。
- 一个组件即使被两个页面使用，只要它是"用户业务"概念（如 `UserCard`），也应放在 `features/users/`，而非全局。

---

## 2. Folder-Module 模式（扁平文件 → 文件夹）

当单个 `.tsx` 文件开始承载多类职责（UI 渲染 + 事件处理 + 副作用），将其升级为"文件夹模块"：

### 2.1 结构

升级前（扁平）：
```
components/
  data-table-row-actions.tsx     ← 组件 + handler + toast 全堆在一起
```

升级后（文件夹模块）：
```
components/
  data-table-row-actions/
    index.tsx                    ← 仅保留 UI 与组装，保持"页面整洁"
    use-row-status-change.ts     ← 抽离的副作用/事件 hook
```

### 2.2 规则
- **文件夹名 = 原文件名（去掉扩展名）**，组件文件固定命名为 `index.tsx`。
- 升级后，原导入路径 `'./data-table-row-actions'` **无需修改**：模块解析会自动命中 `data-table-row-actions/index.tsx`。
- **必须删除旧的扁平 `.tsx` 文件**，否则与同名文件夹产生解析歧义。
- 每个被抽离的 hook / util 用 `use-xxx.ts` / `xxx.ts` 命名，kebab-case。
- hook 文件与 `index.tsx` 位于同一文件夹，相对路径多加一层 `../`（详见 §3）。

### 2.3 何时升级
满足任一条件即可升级为文件夹模块：
- 文件内出现 ≥2 类职责（UI + 数据获取 / 复杂事件处理 / 副作用）。
- 有需要就近放置的专属 hook、常量、子组件、测试。
- 单文件超过 ~150 行且仍在一个关注点上（若跨多个关注点则更应拆）。

不满足时保持扁平 `.tsx`，**不要为统一而统一**。

---

## 3. 导入路径约定

本仓库用 `@/` 别名指向 `src/`。规则：

- **优先用 `@/` 别名**：`import { useAuthorization } from '@/lib/authorization'`。
  - 别名路径 **不受文件位置影响**，迁移文件时零改动，是首选。
- **仅本文件夹内、或向上越级到 feature 根时用相对路径**：
  - `import { type User } from '../../data/schema'`（从 `components/xxx/index.tsx` 回到 `features/users/data/schema`）
  - `import { useUsers } from '../users-provider'`（从 `components/xxx/index.tsx` 回到 `components/users-provider`）
- **文件夹模块内的 hook 文件**：与 `index.tsx` 同目录，相对路径写法一致。

### 迁移前后路径对照
| 含义 | 扁平 `components/X.tsx` | 文件夹 `components/X/index.tsx` |
|---|---|---|
| feature data | `../data/schema` | `../../data/schema` |
| 同级组件 | `./users-provider` | `../users-provider` |
| `@/` 别名 | 不变 | 不变 |

---

## 4. 页面整洁度要求

"页面文件"（如 `features/users/index.tsx`、各 `components/X/index.tsx`）应当：

1. 只负责 **组装与渲染**：拉数据、组合子组件、传 props。
2. **不内联复杂 handler 逻辑**：事件处理、副作用、toast 反馈抽到专属 hook（`use-xxx.ts`）。
3. **不直接 fetch**：数据获取走 `@/api/*` + react-query，或封装进 hook。
4. 行数控制在易扫读范围；超出说明该抽 hook 或拆子组件。

---

## 5. 本次落地的样例

依据本规范，对刚修改的两个文件做 folder-module 升级：

| 升级前 | 升级后 |
|---|---|
| `components/data-table-row-actions.tsx` | `components/data-table-row-actions/index.tsx` + `components/data-table-row-actions/use-row-status-change.ts` |
| `components/data-table-bulk-actions.tsx` | `components/data-table-bulk-actions/index.tsx` + `components/data-table-bulk-actions/use-bulk-status-change.ts` |

- `index.tsx`：保留 UI 与菜单结构，`handleStatusChange` 改为调用 hook 返回的方法。
- `use-*-status-change.ts`：封装"调用 API → invalidateQueries → toast 成功/失败"的副作用。
- 原有引用方（`users-columns.tsx`、`users-table.tsx`）的 `import` 路径 **无需改动**。

---

## 6. 反模式清单（避免）

- ❌ 为"统一"把只有一个组件的扁平文件也升级成文件夹。
- ❌ 在 `src/components/` 全局目录里放带业务逻辑的组件。
- ❌ 第 2 次出现重复就急于抽象（违反三次法则）。
- ❌ 升级为文件夹后保留同名扁平 `.tsx`（解析歧义）。
- ❌ 在页面 `index.tsx` 里内联 fetch / 复杂 handler。

---

## 7. 参考来源

- [React Folder Structure Best Practices in 2026 — AdeptDev](https://www.adeptdev.io/blogs/react-folder-structure-best-practices)
- [Structuring Large React Apps — Paulund](https://paulund.co.uk/notebook/react/structuring-large-react-apps/)
- [React Folder Structures That Scale — dev.to](https://dev.to/ufomadu_nnaemeka_89/react-folder-structures-that-scale-a-practical-guide-for-modern-frontend-teams-49b2)
- [React Folder Structures — CosmicLearn](https://www.cosmiclearn.com/js/react_folder_patterns.php)
- Bulletproof React 架构 / Feature-Sliced Design 思想
