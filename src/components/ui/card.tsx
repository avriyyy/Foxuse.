import { cn } from "@/lib/utils";
import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    noShadow?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, noShadow, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "bg-card text-card-foreground neo-border p-6",
                    !noShadow && "neo-shadow",
                    className
                )}
                {...props}
            />
        );
    }
);
Card.displayName = "Card";
