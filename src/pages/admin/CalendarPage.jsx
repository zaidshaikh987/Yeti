import { db } from '@/api/base44Client';

import React from "react";
import { CalendarClock, ChevronLeft, ChevronRight, Clock } from "lucide-react";

import { ReviewBadge, PrototypeTag } from "@/components/Badges";
import { cn } from "@/lib/utils";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const [content, setContent] = React.useState([]);
  const [view, setView] = React.useState("month");
  const [currentDate, setCurrentDate] = React.useState(new Date());

  React.useEffect(() => {
    (async () => {
      try {
        const res = await db.entities.GeneratedContent.filter({ status: { $in: ["scheduled", "published"] } }, { sort: "-created_date", limit: 50 });
        setContent(res.items || []);
      } catch (e) {
        setContent([]);
      }
    })();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getScheduledForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return content.filter((c) => c.scheduled_time?.startsWith(dateStr));
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
            <CalendarClock className="h-6 w-6 text-[#4DA8D8]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#071A2B]">Publishing Calendar</h1>
            <p className="text-sm text-muted-foreground">Scheduled and published content across platforms</p>
          </div>
        </div>
        <div className="flex gap-1 rounded-lg border border-border bg-white p-1">
          {["month", "week", "day"].map((v) => (
            <button key={v} onClick={() => setView(v)} className={cn("rounded-md px-3 py-1.5 text-sm font-medium capitalize", view === v ? "bg-[#0B2942] text-white" : "text-muted-foreground hover:bg-muted")}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar header */}
      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#071A2B]">{MONTHS[month]} {year}</h2>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="rounded-lg border border-border p-2 hover:bg-muted"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={nextMonth} className="rounded-lg border border-border p-2 hover:bg-muted"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Month view */}
      {view === "month" && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-white">
          <div className="grid grid-cols-7 border-b border-border bg-muted">
            {DAYS.map((d) => <div key={d} className="px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {[...Array(firstDay)].map((_, i) => <div key={`e${i}`} className="min-h-[80px] border-b border-r border-border bg-muted/30" />)}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const scheduled = getScheduledForDay(day);
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
              return (
                <div key={day} className="min-h-[80px] border-b border-r border-border p-1.5">
                  <div className={cn("text-xs font-medium", isToday ? "flex h-5 w-5 items-center justify-center rounded-full bg-[#4DA8D8] text-white" : "text-muted-foreground")}>
                    {day}
                  </div>
                  <div className="mt-1 space-y-1">
                    {scheduled.map((c) => (
                      <div key={c.id} className="truncate rounded bg-[#4DA8D8]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#071A2B]" title={c.title}>
                        {c.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week / Day view */}
      {view !== "month" && (
        <div className="mt-4 rounded-xl border border-border bg-white p-6">
          {content.length > 0 ? (
            <div className="space-y-3">
              {content.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-lg border border-border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Clock className="h-5 w-5 text-[#4DA8D8]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-[#071A2B]">{c.title}</div>
                    <div className="text-xs text-muted-foreground">{c.platform} · {c.scheduled_time ? new Date(c.scheduled_time).toLocaleString("en-IN") : "Unscheduled"}</div>
                  </div>
                  <ReviewBadge status={c.status} />
                  {c.is_prototype && <PrototypeTag />}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <CalendarClock className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">No content scheduled yet.</p>
              <p className="text-xs text-muted-foreground">Schedule content from the Publishing page to see it here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}