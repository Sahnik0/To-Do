import { TodoList } from "@/components/TodoList";

export default function Home() {
  return (
    <main className="w-full max-w-2xl px-4">
      <div className="mb-12 text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
          Tasks
        </h1>
        <p className="text-muted-foreground">Stay organized and focused</p>
      </div>
      <TodoList />
    </main>
  );
}
