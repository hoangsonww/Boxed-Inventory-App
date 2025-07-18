import Link from "next/link";
import type { Box } from "@/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Archive, MapPin } from "lucide-react";

export default function BoxCard({ box }: { box: Box }) {
  const statusLabel = box.status.replace("_", " ");

  // Map each status to a badge variant & color
  const statusStyles: Record<
    Box["status"],
    { variant: "outline" | "secondary" | "destructive"; className?: string }
  > = {
    unpacked: {
      variant: "secondary",
      className: "text-green-600 border-green-600",
    },
    packed: {
      variant: "secondary",
      className: "text-blue-600 border-blue-600",
    },
    in_transit: {
      variant: "outline",
      className: "text-yellow-600 border-yellow-600",
    },
  };

  const { variant, className } = statusStyles[box.status];

  return (
    <Link
      href={`/boxes/${box.id}`}
      className="group relative block overflow-hidden rounded-lg border border-border bg-card p-4 pb-10 transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {/* Title */}
      <div className="flex items-center gap-2 pr-8">
        <Archive size={18} className="text-primary" />
        <h3 className="min-w-0 truncate text-lg font-semibold group-hover:text-primary">
          {box.name}
        </h3>
      </div>

      {/* Location */}
      {box.location && (
        <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin size={14} />
          <span className="truncate">{box.location}</span>
        </p>
      )}

      {/* Status badge */}
      <span className="pointer-events-none absolute bottom-2 right-2">
        <Badge
          variant={variant}
          className={`capitalize text-xs leading-none px-2 py-0.5 ${className}`}
        >
          {statusLabel}
        </Badge>
      </span>
    </Link>
  );
}
