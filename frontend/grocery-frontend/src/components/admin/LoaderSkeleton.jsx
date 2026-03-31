import React from "react";

function Block({ className = "" }) {
  return <div className={`animate-pulse rounded-2xl bg-white/40 dark:bg-white/10 ${className}`} />;
}

export default function LoaderSkeleton({ variant = "page" }) {
  if (variant === "cards") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Block className="h-28" />
        <Block className="h-28" />
        <Block className="h-28" />
        <Block className="h-28" />
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className="space-y-3">
        <Block className="h-10" />
        <Block className="h-12" />
        <Block className="h-12" />
        <Block className="h-12" />
        <Block className="h-12" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Block className="h-10 w-56" />
      <LoaderSkeleton variant="cards" />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Block className="h-72" />
        <Block className="h-72" />
      </div>
      <LoaderSkeleton variant="table" />
    </div>
  );
}

