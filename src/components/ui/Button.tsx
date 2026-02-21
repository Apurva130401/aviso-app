import * as React from "react";
import { motion, HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg" | "icon";
    loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", loading, children, ...props }, ref) => {
        const variants = {
            primary: "bg-primary text-black hover:bg-white shadow-lg shadow-primary/10 font-bold uppercase tracking-wider",
            secondary: "bg-accent/10 text-accent border border-accent/20 hover:bg-accent hover:text-black shadow-lg shadow-accent/5",
            outline: "bg-transparent border border-border-light text-white hover:border-primary",
            ghost: "bg-transparent hover:bg-surface-hover text-text-secondary hover:text-white",
        };

        const sizes = {
            sm: "px-4 py-2 text-[10px] rounded-xl font-bold uppercase tracking-widest",
            md: "px-6 py-3.5 text-xs font-bold rounded-2xl uppercase tracking-widest",
            lg: "px-10 py-5 text-sm font-extrabold rounded-[28px] uppercase tracking-[0.2em]",
            icon: "p-2 rounded-lg",
        };

        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading || (props.disabled as boolean)}
                className={cn(
                    "inline-flex items-center justify-center transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {loading ? (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : null}
                {children as React.ReactNode}
            </motion.button>
        );
    }
);

Button.displayName = "Button";
