"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function CustomCursor() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const updatePosition = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
            setIsVisible(true);
        };

        const handleMouseEnter = () => setIsHovering(true);
        const handleMouseLeave = () => setIsHovering(false);

        window.addEventListener("mousemove", updatePosition);

        // Add listeners to interactive elements
        const interactiveElements = document.querySelectorAll("a, button, input, [role='button']");
        interactiveElements.forEach((el) => {
            el.addEventListener("mouseenter", handleMouseEnter);
            el.addEventListener("mouseleave", handleMouseLeave);
        });

        // Mutation observer to handle dynamically added elements
        const observer = new MutationObserver(() => {
            const elements = document.querySelectorAll("a, button, input, [role='button']");
            elements.forEach((el) => {
                el.removeEventListener("mouseenter", handleMouseEnter);
                el.removeEventListener("mouseleave", handleMouseLeave);
                el.addEventListener("mouseenter", handleMouseEnter);
                el.addEventListener("mouseleave", handleMouseLeave);
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.removeEventListener("mousemove", updatePosition);
            interactiveElements.forEach((el) => {
                el.removeEventListener("mouseenter", handleMouseEnter);
                el.removeEventListener("mouseleave", handleMouseLeave);
            });
            observer.disconnect();
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div
            className={cn(
                "fixed pointer-events-none z-[9999] transition-transform duration-100 ease-out mix-blend-difference",
                isHovering ? "scale-150" : "scale-100"
            )}
            style={{
                left: position.x,
                top: position.y,
                transform: `translate(-50%, -50%) scale(${isHovering ? 1.5 : 1})`,
            }}
        >
            {/* Outer Ring - Follower */}
            <div className={cn(
                "rounded-full border-2 border-white transition-all duration-300",
                isHovering ? "h-12 w-12 bg-white/20" : "h-8 w-8 opacity-50"
            )} />
        </div>
    );
}
