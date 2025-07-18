import { Item, ItemType } from "@/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, CalendarClock } from "lucide-react";
import dayjs from "dayjs";

export default function ItemCard({
  item,
  type,
}: {
  item: Item;
  type?: ItemType;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="font-medium">{item.name}</p>
        {type && <Badge variant="secondary">{type.name}</Badge>}
      </div>

      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <span>Qty: {item.quantity}</span>
        {item.last_used && (
          <>
            <CalendarClock size={14} />
            {dayjs(item.last_used).fromNow()}
          </>
        )}
      </div>

      {item.photo_url ? (
        <img
          src={item.photo_url}
          alt={item.name}
          className="mt-1 h-24 w-full rounded border object-cover"
        />
      ) : (
        <div className="mt-1 flex h-24 w-full items-center justify-center rounded border text-muted-foreground">
          <ImageIcon size={32} />
        </div>
      )}
    </div>
  );
}
