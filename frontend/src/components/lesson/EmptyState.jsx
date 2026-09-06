import { Inbox } from "lucide-react";

export const EmptyState = ({ message, hint }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/30 px-6 py-10 text-center">
    <div className="grid h-11 w-11 place-items-center rounded-full bg-secondary text-muted-foreground">
      <Inbox className="h-5 w-5" />
    </div>
    <p className="mt-3 text-sm font-semibold text-muted-foreground">{message}</p>
    {hint && <p className="mt-1 text-xs text-muted-foreground/80">{hint}</p>}
  </div>
);
