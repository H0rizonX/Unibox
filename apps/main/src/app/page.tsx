import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Unibox</h1>
      <p className="text-muted-foreground text-center text-sm">
        设计师作品展示与接单 · 脚手架已就绪
      </p>
      <Button>Get Started</Button>
    </main>
  );
}
