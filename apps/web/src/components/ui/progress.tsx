"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "destructive";
type Radius = "default" | "full" | "none";

export interface ComponentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  striped?: boolean;
  indicatorClassName?: string;
  showText?: boolean;
  variant?: Variant;
  radius?: Radius;
  overlayClassName?: string;
}

const baseClass =
  "w-full flex items-center justify-center relative overflow-hidden";

const variantClasses: Record<Variant, string> = {
  default: "bg-slate-950 border-4 border-cyan-400/60",
  secondary: "bg-slate-900 border-4 border-purple-400/60",
  destructive: "bg-slate-950 border-4 border-rose-500/60",
};

const radiusClasses: Record<Radius, string> = {
  default: "rounded-3xl",
  full: "rounded-full",
  none: "rounded-none",
};

const indicatorVariant: Record<Variant, string> = {
  default: "bg-gradient-to-b from-cyan-400 to-sky-700",
  secondary: "bg-gradient-to-b from-purple-400 to-fuchsia-700",
  destructive: "bg-gradient-to-b from-rose-400 to-red-700",
};

const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  (
    {
      className,
      value = 0,
      max = 100,
      variant = "default",
      radius = "default",
      striped = true,
      indicatorClassName,
      showText,
      overlayClassName,
      children,
      ...props
    },
    ref,
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className={cn(
          baseClass,
          variantClasses[variant],
          radiusClasses[radius],
          className,
        )}
        {...props}
      >
        <div className="relative w-full h-full overflow-hidden rounded-[inherit]">
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 z-10 transition-[height,background-color] duration-300",
              "overflow-hidden",
              indicatorVariant[variant],
              striped
                ? "[&>div]:bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] [&>div]:bg-size-1"
                : "",
              indicatorClassName,
            )}
            style={{
              height: `${percentage}%`,
            }}
          >
            <div
              data-pattern="stripes"
              className="absolute inset-0 z-10 transition-colors duration-300"
            />
            <div
              className="absolute inset-0 z-20 mix-blend-screen opacity-35 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35) 0%, transparent 45%), radial-gradient(circle at 80% 40%, rgba(255,255,255,0.25) 0%, transparent 40%), radial-gradient(circle at 50% 80%, rgba(255,255,255,0.18) 0%, transparent 35%)",
                backgroundSize: "200% 200%",
                animation: "liquidShift 9s ease-in-out infinite",
              }}
            />
            <div
              className="absolute inset-0 z-10 opacity-25 pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, rgba(255,255,255,0.18) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.18) 75%, transparent 75%, transparent)",
                backgroundSize: "220% 220%",
                animation: "liquidWave 6s ease-in-out infinite",
                mixBlendMode: "overlay",
              }}
            />
          </div>
        </div>
        {(showText || children) && (
          <div
            className={cn(
              "absolute inset-0 z-30 p-4 pointer-events-none",
              overlayClassName ?? "flex items-center justify-center text-center",
            )}
          >
            {children ?? (
              <span className="text-white text-5xl font-bold">
                {percentage.toFixed(0)}
                <span className="text-white text-base font-medium">%</span>
              </span>
            )}
          </div>
        )}
      </div>
    );
  },
);

Component.displayName = "Component";

export { Component, Component as Progress };
