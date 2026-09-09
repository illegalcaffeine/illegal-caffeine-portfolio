import type { ElementType, ReactNode } from "react";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
  variant?: "rise" | "mask";
};

export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  variant = "rise",
}: RevealProps) {
  const { ref, visible } = useInView<HTMLDivElement>();

  // For the mask variant the clip-path must live on an inner element: a
  // clipped element reports no intersection, so observing it would deadlock.
  if (variant === "mask") {
    return (
      <Tag ref={ref} className={className}>
        <div
          data-visible={visible}
          style={delay ? { transitionDelay: `${delay}ms` } : undefined}
          className="reveal-mask"
        >
          {children}
        </div>
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref}
      data-visible={visible}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn("reveal", className)}
    >
      {children}
    </Tag>
  );
}

/** Sequential line-by-line headline reveal. */
export function RevealLines({
  lines,
  className,
  lineClassName,
  lineTextClassName,
  immediate = false,
  stagger = 140,
}: {
  lines: string[];
  className?: string;
  lineClassName?: string;
  lineTextClassName?: string;
  immediate?: boolean;
  stagger?: number;
}) {
  const { ref, visible } = useInView<HTMLDivElement>({ threshold: 0.2 });

  return (
    <div ref={ref} className={className}>
      {lines.map((line, i) => (
        <span
          key={line + i}
          data-visible={immediate || visible}
          className={cn("line-rise", lineClassName)}
        >
          <span
            className={lineTextClassName}
            style={{ transitionDelay: `${i * stagger}ms` }}
          >
            {line}
          </span>
        </span>
      ))}
    </div>
  );
}
