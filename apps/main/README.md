# Unibox

个人设计师作品展示与接单官网。

## 技术栈

- Next.js 16（App Router · TypeScript · SSR）
- Tailwind CSS 4 + shadcn/ui（radix-nova）
- GSAP
- Biome（Lint + Format）
- Husky + lint-staged + commitlint（Conventional Commits）

## 开发

```bash
pnpm install
pnpm dev
```

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 本地开发 |
| `pnpm build` | 生产构建 |
| `pnpm start` | 启动生产服务（自建 Node） |
| `pnpm lint` | Biome 检查 |
| `pnpm lint:fix` | Biome 自动修复 |
| `pnpm format` | Biome 格式化 |

## Commit 规范

使用 [Conventional Commits](https://www.conventionalcommits.org/)：

```text
feat: 新增作品画廊区块
fix: 修复移动端导航遮挡
chore: 升级依赖
```

提交时会自动跑 lint-staged（Biome）与 commitlint。

## 添加 shadcn 组件

```bash
pnpm dlx shadcn@latest add card
```
