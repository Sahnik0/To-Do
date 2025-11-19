"use client";

import { useState, useRef, useEffect } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { Trash2, Check, Pencil, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface Todo {
    id: string;
    text: string;
    completed: boolean;
}

interface TodoItemProps {
    todo: Todo;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (id: string, newText: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(todo.text);
    const inputRef = useRef<HTMLInputElement>(null);
    const dragControls = useDragControls();

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
        }
    }, [isEditing]);

    const handleSave = () => {
        if (editText.trim() !== "") {
            onEdit(todo.id, editText.trim());
            setIsEditing(false);
        } else {
            setEditText(todo.text);
            setIsEditing(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSave();
        } else if (e.key === "Escape") {
            setEditText(todo.text);
            setIsEditing(false);
        }
    };

    return (
        <Reorder.Item
            value={todo}
            id={todo.id}
            dragListener={false}
            dragControls={dragControls}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            whileDrag={{ scale: 1.02, zIndex: 10 }}
            className={cn(
                "flex items-center justify-between p-4 mb-3 rounded-xl bg-card border border-border shadow-sm group transition-all duration-300",
                todo.completed && !isEditing && "opacity-50"
            )}
        >
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                    onPointerDown={(e) => dragControls.start(e)}
                    className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                    <GripVertical className="w-5 h-5" />
                </div>

                <button
                    onClick={() => onToggle(todo.id)}
                    className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300 shrink-0",
                        todo.completed
                            ? "bg-green-500 border-green-500"
                            : "border-muted-foreground hover:border-primary"
                    )}
                >
                    {todo.completed && <Check className="w-4 h-4 text-white" />}
                </button>

                {isEditing ? (
                    <div className="flex-1 flex items-center gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleSave}
                            className="flex-1 bg-transparent border-b border-primary focus:outline-none text-lg text-foreground px-1"
                        />
                    </div>
                ) : (
                    <span
                        onClick={() => !todo.completed && setIsEditing(true)}
                        className={cn(
                            "text-lg transition-all duration-300 truncate cursor-pointer select-none",
                            todo.completed ? "line-through text-muted-foreground" : "text-foreground"
                        )}
                    >
                        {todo.text}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {!isEditing && !todo.completed && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 hover:bg-primary/10 rounded-full text-muted-foreground hover:text-primary transition-colors"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                )}
                <button
                    onClick={() => onDelete(todo.id)}
                    className="p-2 hover:bg-red-500/10 rounded-full text-muted-foreground hover:text-red-500 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </Reorder.Item>
    );
}
