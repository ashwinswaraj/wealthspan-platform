import * as React from "react";
import { cn } from "@wealthspan/utils/utils";

const sizes = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
} as const;

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: keyof typeof sizes;
}

export const Avatar = ({ src, alt, name, size = "md", className, ...props }: AvatarProps) => {
  const initial = name ? name.trim()[0]?.toUpperCase() : "?";
  return (
    <div
      className={cn(
        "rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold overflow-hidden shrink-0",
        sizes[size],
        className,
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt ?? name ?? ""} className="w-full h-full object-cover" />
      ) : (
        initial
      )}
    </div>
  );
};
