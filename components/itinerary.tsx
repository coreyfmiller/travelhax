"use client"

import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

function ItineraryCard({
  title,
  savedDate,
  type,
  typeColor,
  datetime,
  location,
  details,
  onDelete,
}: {
  title: string;
  savedDate: string;
  type: string;
  typeColor: string;
  datetime: string;
  location: string;
  details: { label: string; value: string; icon?: string }[];
  onDelete: () => void;
}) {
  const typeColorClasses: Record<string, string> = {
    blue: "bg-primary/10 text-primary",
    green: "bg-accent/10 text-accent-foreground",
    amber: "bg-[hsl(43,74%,66%)]/15 text-[hsl(30,70%,40%)]",
  };

  return (
    <div className="group relative rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between border-b border-border px-5 py-4">
        <div>
          <h4 className="text-sm font-semibold text-card-foreground">{title}</h4>
          <p className="mt-0.5 text-xs text-muted-foreground">Saved: {savedDate}</p>
        </div>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button onClick={onDelete} type="button" className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive" aria-label="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
          </button>
        </div>
      </div>
      <div className="px-5 py-4">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${typeColorClasses[typeColor] || typeColorClasses.blue}`}>
            {type}
          </span>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-card-foreground">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted-foreground"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
            {datetime}
          </div>
          <div className="flex items-center gap-2 text-sm text-card-foreground">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted-foreground"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
            {location}
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-3">
          <div className="flex flex-col gap-1.5">
            {details.map((detail) => (
              <div key={detail.label} className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">{detail.label}:</span>
                <span className="font-medium text-card-foreground">{detail.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DaySection({ date, children }: { date: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
        </div>
        <h3 className="text-base font-semibold text-foreground">{date}</h3>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="ml-4 flex flex-col gap-4 border-l-2 border-primary/20 pl-6">{children}</div>
    </div>
  );
}

export function Itinerary() {
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchTrips = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch("/api/trips", {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      })
      const data = await response.json()
      setTrips(data)
    } catch (e: any) {
      console.error("Fetch error:", e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrips()
    window.addEventListener("refresh-trips", fetchTrips)
    return () => window.removeEventListener("refresh-trips", fetchTrips)
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this trip?")) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await fetch(`/api/trips/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${session?.access_token}` }
      })
      fetchTrips()
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete trip" })
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/15">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-foreground"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
          </div>
          <h2 className="text-sm font-semibold tracking-wide uppercase text-card-foreground">My Itinerary</h2>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{trips.length} items</span>
        </div>
      </div>
      <div className="flex flex-col gap-8 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : trips.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No trips yet. Try parsing an email!</div>
        ) : (
          trips.map((trip) => {
            const data = trip.parsed_data;
            const event = data.events?.[0];
            if (!event) return null;
            return (
              <DaySection key={trip.id} date={new Date(trip.created_at).toLocaleDateString()}>
                <ItineraryCard
                  title={trip.trip_name}
                  savedDate={new Date(trip.created_at).toLocaleDateString()}
                  type={event.event_type}
                  typeColor={event.event_type === "flight" ? "blue" : event.event_type === "hotel" ? "green" : "amber"}
                  datetime={event.timing?.start_datetime || "N/A"}
                  location={event.location?.name || "Unknown"}
                  onDelete={() => handleDelete(trip.id)}
                  details={[
                    { label: "Confirmation", value: event.confirmation?.confirmation_code || "N/A" },
                    { label: "Provider", value: event.provider?.name || "N/A" },
                    ...(event.hotel_details ? [{ label: "Room", value: event.hotel_details.room_type || "N/A" }] : []),
                  ]}
                />
              </DaySection>
            )
          })
        )}
      </div>
    </section>
  );
}
