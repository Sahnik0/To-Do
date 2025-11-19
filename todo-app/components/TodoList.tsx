"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import confetti from "canvas-confetti";
import { TodoItem } from "./TodoItem";
import { cn } from "@/lib/utils";

interface Todo {
    id: string;
    text: string;
    completed: boolean;
}

type FilterType = "all" | "active" | "completed";

export function TodoList() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [filter, setFilter] = useState<FilterType>("all");
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from local storage
    useEffect(() => {
        const savedTodos = localStorage.getItem("todos");
        if (savedTodos) {
            try {
                setTodos(JSON.parse(savedTodos));
            } catch (e) {
                console.error("Failed to parse todos", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to local storage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("todos", JSON.stringify(todos));
        }
    }, [todos, isLoaded]);

    const addTodo = () => {
        if (inputValue.trim() === "") return;

        const newTodo: Todo = {
            id: crypto.randomUUID(),
            text: inputValue.trim(),
            completed: false,
        };

        setTodos([newTodo, ...todos]);
        setInputValue("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            addTodo();
        }
    };

    const toggleTodo = (id: string) => {
        const newTodos = todos.map((todo) => {
            if (todo.id === id) {
                const isCompleted = !todo.completed;
                if (isCompleted) {
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ["#22c55e", "#10b981", "#34d399"],
                    });
                }
                return { ...todo, completed: isCompleted };
            }
            return todo;
        });
        setTodos(newTodos);
    };

    const deleteTodo = (id: string) => {
        setTodos(todos.filter((todo) => todo.id !== id));
    };

    const editTodo = (id: string, newText: string) => {
        setTodos(
            todos.map((todo) =>
                todo.id === id ? { ...todo, text: newText } : todo
            )
        );
    };

    const clearCompleted = () => {
        setTodos(todos.filter((todo) => !todo.completed));
    };

    const filteredTodos = todos.filter((todo) => {
        if (filter === "active") return !todo.completed;
        if (filter === "completed") return todo.completed;
        return true;
    });

    const activeCount = todos.filter((todo) => !todo.completed).length;
    const completedCount = todos.length - activeCount;
    const progress = todos.length === 0 ? 0 : (completedCount / todos.length) * 100;

    if (!isLoaded) return null; // Prevent hydration mismatch

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-sm mb-2 font-medium text-muted-foreground">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                </div>
            </div>

            <div className="relative mb-8">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add a new task..."
                    className="w-full px-6 py-4 text-lg bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-lg placeholder:text-muted-foreground/50"
                />
                <button
                    onClick={addTodo}
                    disabled={inputValue.trim() === ""}
                    className="absolute right-2 top-2 bottom-2 aspect-square bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </div>

            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
                    {(["all", "active", "completed"] as FilterType[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-sm font-medium transition-all capitalize",
                                filter === f
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <div className="text-sm text-muted-foreground">
                    {activeCount} {activeCount === 1 ? "task" : "tasks"} remaining
                </div>
            </div>

            <Reorder.Group
                axis="y"
                values={todos}
                onReorder={setTodos}
                className="space-y-3 min-h-[200px]"
            >
                <AnimatePresence mode="popLayout">
                    {filteredTodos.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="text-center py-12 text-muted-foreground"
                        >
                            <p className="text-lg font-medium">
                                {filter === "all"
                                    ? "No tasks yet"
                                    : filter === "active"
                                        ? "No active tasks"
                                        : "No completed tasks"}
                            </p>
                            <p className="text-sm opacity-70">
                                {filter === "all" ? "Add a task to get started" : ""}
                            </p>
                        </motion.div>
                    ) : (
                        filteredTodos.map((todo) => (
                            <TodoItem
                                key={todo.id}
                                todo={todo}
                                onToggle={toggleTodo}
                                onDelete={deleteTodo}
                                onEdit={editTodo}
                            />
                        ))
                    )}
                </AnimatePresence>
            </Reorder.Group>

            {todos.some((t) => t.completed) && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-8 flex justify-center"
                >
                    <button
                        onClick={clearCompleted}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-red-500 transition-colors px-4 py-2 rounded-lg hover:bg-red-500/10"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear Completed
                    </button>
                </motion.div>
            )}
        </div>
    );
}
