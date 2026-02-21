import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-14 w-full rounded-[20px] border border-white/[0.05] bg-black/40 px-5 py-2 text-sm text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-bold placeholder:text-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:border-accent/40 transition-all duration-500 disabled:cursor-not-allowed disabled:opacity-50 font-medium tracking-wide",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    "flex min-h-[120px] w-full rounded-[24px] border border-white/[0.05] bg-black/40 px-5 py-4 text-sm text-white ring-offset-background placeholder:text-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:border-accent/40 transition-all duration-500 disabled:cursor-not-allowed disabled:opacity-50 font-medium tracking-wide resize-none",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Textarea.displayName = "Textarea";
