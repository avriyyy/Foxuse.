import { cn } from "@/lib/utils";

export function FoxuseLogo({ className = "" }: { className?: string }) {
    return (
        <div className={cn("flex items-center gap-3", className)}>
            {/* User Provided SVG Logo */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
                className="h-10 w-10 shrink-0 text-pink-500"
                aria-label="FOXuse Logo"
            >
                <path d="M15 73 L45 73" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M45 73 L55 27 M55 27 L85 27 M55 44 L85 44" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            {/* Brand Name */}
            <span className="font-black text-2xl tracking-tighter italic">FOXuse.</span>
        </div>
    );
}
