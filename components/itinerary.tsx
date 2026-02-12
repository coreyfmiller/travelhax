"use client"

import React, { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { format, parseISO, isSameDay } from "date-fns"

interface TravelEvent {
  event_id: string;
  event_type: string;
  status: string;
  provider: { name: string };
  confirmation: { confirmation_code: string };
  timing: { start_datetime: string; end_datetime?: string };
  location: { name: string };
  flight_details?: any;
  accommodation_details?: any;
  rental_details?: any;
  trip_id: string; // Internal ref to delete
}

function ItineraryCard({
  event,
  onDelete,
}: {
  event: TravelEvent;
  onDelete: () => void;
}) {
  const typeStyles: Record<string, { color: string; icon: React.ReactNode }> = {
    flight: {
      color: "bg-blue-500/10 text-blue-600 border-blue-200",
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" /></svg>
    },
    hotel: {
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM9 14a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg>
    },
    rental_car: {
      color: "bg-orange-500/10 text-orange-600 border-orange-200",
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2.7-3.4A2 2 0 0 0 13.7 6H6.3a2 2 0 0 0-1.6.9L2 10l-2.5 1.1C-.7 11.3-1 12.1-1 13v3c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></svg>
    },
    dining: {
      color: "bg-rose-500/10 text-rose-600 border-rose-200",
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" /></svg>
    }
  };

  const style = typeStyles[event.event_type] || {
    color: "bg-slate-500/10 text-slate-600 border-slate-200",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
  };

  const timeLabel = event.timing?.start_datetime
    ? format(parseISO(event.timing.start_datetime), "h:mm a")
    : "N/A";

  return (
    <div className="relative group">
      {/* Timeline Connector */}
      <div className="absolute -left-7 top-0 bottom-0 w-0.5 bg-border group-last:bottom-auto group-last:h-4" />
      <div className="absolute -left-[31px] top-4 h-4 w-4 rounded-full border-2 border-background bg-primary shadow-sm ring-4 ring-background" />

      <div className="mb-6 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${style.color}`}>
              {style.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-card-foreground">
                  {event.event_type === 'flight' ? `Flight ${event.flight_details?.flight_number || ''}` :
                    event.event_type === 'hotel' ? `Stay at ${event.provider?.name}` :
                      event.provider?.name || 'Travel Event'}
                </h4>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 border border-border px-1.5 py-0.5 rounded">
                  {event.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{timeLabel} • {event.location?.name}</p>
            </div>
          </div>
          <button
            onClick={onDelete}
            className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-lg bg-secondary/30 p-4 sm:grid-cols-3">
          <div className="space-y-0.5">
            <span className="text-[10px] font-medium uppercase text-muted-foreground">Confirmation</span>
            <p className="text-sm font-medium">{event.confirmation?.confirmation_code || 'N/A'}</p>
          </div>

          {event.event_type === 'flight' && (
            <>
              <div className="space-y-0.5">
                <span className="text-[10px] font-medium uppercase text-muted-foreground">Gate / Terminal</span>
                <p className="text-sm font-medium">{event.flight_details?.departure_airport?.gate || '-'} / {event.flight_details?.departure_airport?.terminal || '-'}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-medium uppercase text-muted-foreground">Seat</span>
                <p className="text-sm font-medium">{event.flight_details?.seat || 'Unassigned'}</p>
              </div>
            </>
          )}

          {event.event_type === 'hotel' && (
            <>
              <div className="space-y-0.5">
                <span className="text-[10px] font-medium uppercase text-muted-foreground">Guests</span>
                <p className="text-sm font-medium">{event.accommodation_details?.number_of_guests || '1'}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-medium uppercase text-muted-foreground">Check-in</span>
                <p className="text-sm font-medium">{event.accommodation_details?.check_in ? format(parseISO(event.accommodation_details.check_in), "MMM d") : '-'}</p>
              </div>
            </>
          )}
        </div>
      </div>
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

  const handleDelete = async (tripId: string) => {
    if (!confirm("Delete all events from this parsing?")) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await fetch(`/api/trips/${tripId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${session?.access_token}` }
      })
      fetchTrips()
      toast({ title: "Deleted", description: "Events removed from your itinerary." })
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete trip" })
    }
  }

  const flattenedEvents = useMemo(() => {
    const events: TravelEvent[] = [];
    trips.forEach(trip => {
      const tripEvents = trip.parsed_data?.events || [];
      tripEvents.forEach((event: any) => {
        events.push({ ...event, trip_id: trip.id });
      });
    });

    // Sort chronologically
    return events.sort((a, b) => {
      const dateA = a.timing?.start_datetime ? new Date(a.timing.start_datetime).getTime() : 0;
      const dateB = b.timing?.start_datetime ? new Date(b.timing.start_datetime).getTime() : 0;
      return dateA - dateB;
    });
  }, [trips]);

  const groupedByDay = useMemo(() => {
    const groups: { date: Date; events: TravelEvent[] }[] = [];
    flattenedEvents.forEach(event => {
      if (!event.timing?.start_datetime) return;
      const date = parseISO(event.timing.start_datetime);
      const existingGroup = groups.find(g => isSameDay(g.date, date));
      if (existingGroup) {
        existingGroup.events.push(event);
      } else {
        groups.push({ date, events: [event] });
      }
    });
    return groups;
  }, [flattenedEvents]);

  return (
    <section className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm shadow-xl p-8">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">My Travels</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {flattenedEvents.length} events across {groupedByDay.length} days
          </p>
        </div>
      </div>

      <div className="space-y-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : groupedByDay.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-secondary p-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
            </div>
            <h3 className="text-lg font-semibold">No plans yet</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs">
              Upload a travel confirmation or paste an email above to see your itinerary.
            </p>
          </div>
        ) : (
          groupedByDay.map((group) => (
            <div key={group.date.toISOString()}>
              <div className="mb-6 flex items-center gap-4">
                <div className="flex flex-col items-center justify-center rounded-xl bg-primary px-3 py-2 text-primary-foreground shadow-lg">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{format(group.date, "MMM")}</span>
                  <span className="text-xl font-black">{format(group.date, "dd")}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{format(group.date, "EEEE, MMMM do")}</h3>
                  <div className="h-1 w-12 rounded-full bg-primary/30 mt-1" />
                </div>
              </div>

              <div className="ml-7 flex flex-col pt-2">
                {group.events.map((event) => (
                  <ItineraryCard
                    key={event.event_id}
                    event={event}
                    onDelete={() => handleDelete(event.trip_id)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
