"use client";

import { useState, type ButtonHTMLAttributes } from "react";
import { CalendarDays, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatFullDate, fromISODate, toISODate } from "@/lib/date";
import { cn } from "@/lib/utils";

export function PickerTrigger({
  children,
  onClear,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  onClear?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-xl border border-input bg-background px-3 transition-colors hover:bg-accent/50 focus-within:outline-none focus-within:ring-1 focus-within:ring-ring",
        className,
      )}
    >
      <button
        type="button"
        className="flex h-11 min-w-0 flex-1 cursor-pointer items-center gap-2 text-left text-sm font-medium focus:outline-none"
        {...props}
      >
        {children}
      </button>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear selection"
          className="grid size-5 shrink-0 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

export function DatePickerField({
  id,
  value,
  onChange,
  placeholder,
}: {
  id?: string;
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? fromISODate(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <PickerTrigger
          id={id}
          aria-label={value ? `Date, ${formatFullDate(value)}` : "No date selected"}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClear={value ? () => onChange(null) : undefined}
        >
          <CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          {value ? (
            <span className="truncate">{formatFullDate(value)}</span>
          ) : (
            <span className="truncate text-muted-foreground">
              {placeholder ?? "No date selected"}
            </span>
          )}
        </PickerTrigger>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto rounded-xl border-border bg-popover p-1 shadow-md"
      >
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            onChange(date ? toISODate(date) : null);
            setOpen(false);
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
