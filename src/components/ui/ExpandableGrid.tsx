"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ExpandableGridProps {
  children: React.ReactNode[];
  mobileInitialCount?: number;
  gridClassName: string;
}

export default function ExpandableGrid({
  children,
  mobileInitialCount = 4,
  gridClassName,
}: ExpandableGridProps) {
  const [expanded, setExpanded] = useState(false);

  const hasMore = children.length > mobileInitialCount;

  return (
    <>
      {hasMore && (
        <div className="mb-4 flex justify-end md:hidden">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-emerald-600"
          >
            {expanded ? "Show Less" : "Show More"}

            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      )}

      <div className={gridClassName}>
        {children.map((child, index) => (
          <div
            key={index}
            className={
              !expanded && index >= mobileInitialCount
                ? "hidden md:block"
                : "block"
            }
          >
            {child}
          </div>
        ))}
      </div>
    </>
  );
}