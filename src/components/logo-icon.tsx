
'use client';

import { cn } from "@/lib/utils";

export function LogoIcon({ className, ...props }: React.HTMLAttributes<SVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={cn("h-8 w-8", className)}
      {...props}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--accent))" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="20" fill="url(#logo-gradient)"></rect>
      <text
        x="50%"
        y="50%"
        fontFamily="var(--font-headline), sans-serif"
        fontSize="80"
        fontWeight="bold"
        fill="hsl(var(--primary-foreground))"
        textAnchor="middle"
        dy=".38em"
      >
        S
      </text>
    </svg>
  );
}
