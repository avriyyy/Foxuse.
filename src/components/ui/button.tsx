import { cn } from "@/lib/utils";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' | 'success' | 'warning' | 'destructive' | 'info';
    size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        const variants = {
            primary: "bg-primary hover:bg-pink-600 text-white",
            secondary: "bg-secondary hover:bg-purple-600 text-white",
            accent: "bg-accent hover:bg-blue-600 text-white",
            success: "bg-green-400 hover:bg-green-500 text-black",
            warning: "bg-yellow-400 hover:bg-yellow-500 text-black",
            destructive: "bg-red-500 hover:bg-red-600 text-white",
            info: "bg-cyan-400 hover:bg-cyan-500 text-black",
            outline: "bg-white hover:bg-zinc-100 text-black",
            ghost: "bg-transparent border-transparent shadow-none hover:bg-muted",
        };

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 py-2",
            lg: "h-12 px-8 text-lg",
            icon: "h-10 w-10",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
                    variant !== 'ghost' && "neo-border neo-shadow-sm",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";
