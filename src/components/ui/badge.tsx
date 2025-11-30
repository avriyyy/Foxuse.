import { cn } from "@/lib/utils";
import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'outline' | 'destructive' | 'secondary';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = 'default', ...props }, ref) => {
        return (
            <span
                ref={ref}
                className={cn(
                    "inline-flex items-center border-2 border-black px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    variant === 'default' && "bg-primary text-primary-foreground",
                    variant === 'secondary' && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                    variant === 'destructive' && "bg-destructive text-destructive-foreground",
                    variant === 'outline' && "text-foreground",
                    className
                )}
                {...props}
            />
        );
    }
);
Badge.displayName = "Badge";
