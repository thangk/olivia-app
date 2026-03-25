"use client";

import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1 border-b px-4 py-2 text-sm"
    >
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && (
            <ChevronRight
              className="h-3 w-3 text-muted-foreground"
              aria-hidden="true"
            />
          )}
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </button>
          ) : (
            <span className="font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
