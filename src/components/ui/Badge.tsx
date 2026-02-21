import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "primary" | "secondary" | "accent" | "outline";
}

export function Badge({ className, variant = "primary", ...props }: BadgeProps) {
    const variants = {
        primary: "bg-primary/20 text-primary border-primary/30 shadow-lg shadow-primary/5",
        secondary: "bg-white/5 text-white/60 border-white/[0.08]",
        accent: "bg-accent/20 text-accent border-accent/30 shadow-lg shadow-accent/5",
        outline: "border-white/[0.1] text-white/40 hover:border-white/20 transition-colors",
    };

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                variants[variant],
                className
            )}
            {...props}
        />
    );
}
