import * as React from "react";
import { motion, HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLMotionProps<"div"> {
    hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, hover = true, children, ...props }, ref) => {
        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={hover ? { y: -8, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } : undefined}
                className={cn(
                    "bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/[0.08] rounded-[40px] p-10 shadow-3xl overflow-hidden relative group",
                    className
                )}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);

Card.displayName = "Card";
