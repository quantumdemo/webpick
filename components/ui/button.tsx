import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "danger";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-xl text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      default: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/25",
      outline: "border border-white/10 bg-transparent text-white hover:bg-white/5",
      secondary: "bg-zinc-800 text-white hover:bg-zinc-700 border border-white/10",
      ghost: "text-zinc-400 hover:text-white hover:bg-zinc-800",
      link: "text-indigo-400 underline-offset-4 hover:underline p-0",
      danger: "bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-600/25",
    };

    const sizes = {
      default: "h-9 px-4 py-2",
      sm: "h-8 px-3 text-[11px]",
      lg: "h-11 px-6 text-sm",
      icon: "h-9 w-9",
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
