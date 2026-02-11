"use client"

import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { EditTripModal } from "@/components/edit-trip-modal"

function ItineraryCard({
  title,
  savedDate,
  type,
  typeColor,
  datetime,
  location,
  details,
  milestones,
  onEdit,
  onDelete,
}: {
  title: string;
  savedDate: string;
  type: string;
  typeColor: string;
  datetime: string;
  location: string;
  details: { label: string; value: string; icon?: string }[];
  milestones?: { label: string; datetime: string }[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const typeColorClasses: Record<string, string> = {
    blue: "bg-primary/10 text-primary",
    green: "bg-emerald-500/15 text-emerald-800",
    amber: "bg-[hsl(43,74%,66%)]/15 text-[hsl(30,70%,40%)]",
    rose: "bg-rose-500/15 text-rose-800",
    indigo: "bg-indigo-500/15 text-indigo-800",
  };

  const getIcon = () => {
    const t = type.toLowerCase();

    // Transportation
    if (['flight', 'taxi', 'public_transit'].includes(t)) {
      if (t === 'flight') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" /></svg>;
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7c0 .6.4 1 1 1h1" /><circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" /></svg>;
    }
    if (t === 'train') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="3" rx="2" /><path d="M4 11h16" /><path d="M12 3v8" /><path d="m8 19-2 3" /><path d="m18 22-2-3" /><path d="M8 15h.01" /><path d="M16 15h.01" /></svg>;
    if (t === 'bus') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="3" rx="2" /><path d="M4 11h16" /><circle cx="12" cy="15" r="1.5" /><circle cx="8" cy="15" r="1.5" /><circle cx="16" cy="15" r="1.5" /><path d="m8 19-2 3" /><path d="m18 22-2-3" /></svg>;

    // Lodging
    if (['hotel', 'vacation_rental', 'hostel', 'camping'].includes(t)) {
      if (t === 'camping') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 20 10 4 1 20h18Z" /><path d="M10 4l9 16" /><path d="m5 11 10 0" /></svg>;
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20V9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v11" /><path d="M2 17h14" /><path d="M2 14h14" /><path d="M18 17h4" /><path d="M18 14h4" /><path d="M22 22V11a2 2 0 0 0-2-2h-2" /><path d="M7 21v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4" /></svg>;
    }
    if (t === 'cruise') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-1 5-1 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-1 5-1 1.3 0 1.9.5 2.5 1" /><path d="M19.38 20.42a2.4 2.4 0 0 0 3.81.47l.81-1.07V15H2v4.82l.81 1.07a2.4 2.4 0 0 0 3.81-.47l.88-1.18a2.4 2.4 0 0 1 3.81 0l.88 1.18a2.4 2.4 0 0 0 3.81 0l.88-1.18a2.4 2.4 0 0 1 3.81 0l.5.66Z" /><path d="M19 12.1V10l2-2V4h-5v4l2 2v2.1" /><path d="M11 15V7l2-2V4H8v1l2 2v8" /></svg>;

    // Culinary
    if (['restaurant', 'bar', 'food_tour', 'dining'].includes(t)) {
      if (t === 'bar') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 22h8" /><path d="M12 11v11" /><path d="m19 22-7-11-7 11" /><path d="M12 11c3.3 0 6-2.7 6-6V2H6v3c0 3.3 2.7 6 6 6Z" /></svg>;
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></svg>;
    }

    // Activities
    if (['tour', 'attraction', 'performance', 'wellness'].includes(t)) {
      if (t === 'wellness') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>;
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.5 3.5 6.5 1.5 2 1 4.5-1 6.5" /></svg>;
    }

    // Admin
    if (['border_control', 'health', 'meeting', 'note'].includes(t)) {
      return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>;
    }

    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>;
  };

  return (
    <div className="group relative rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between border-b border-border px-5 py-4">
        <div>
          <h4 className="text-sm font-semibold text-card-foreground">{title}</h4>
          <p className="mt-0.5 text-xs text-muted-foreground">Saved: {savedDate}</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onEdit} type="button" className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary" aria-label="Edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
          </button>
          <button onClick={onDelete} type="button" className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive" aria-label="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
          </button>
        </div>
      </div>
      <div className="px-5 py-4">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${typeColorClasses[typeColor] || typeColorClasses.blue}`}>
            {getIcon()}
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
            <span className="line-clamp-1">{location}</span>
          </div>

          {milestones && milestones.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {milestones.map((m, idx) => (
                <div key={idx} className="flex flex-col rounded-md border border-primary/20 bg-primary/5 px-2 py-1">
                  <span className="text-[9px] font-bold uppercase text-primary/60">{m.label}</span>
                  <span className="text-[10px] font-semibold text-primary">
                    {new Date(m.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-3">
          <div className="flex flex-col gap-1.5">
            {details.map((detail) => (
              <div key={detail.label} className="flex items-start gap-2 text-xs">
                <span className="text-muted-foreground whitespace-nowrap">{detail.label}:</span>
                <span className="font-medium text-card-foreground line-clamp-2">{detail.value}</span>
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
  const [editingTrip, setEditingTrip] = useState<any>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [realtimeStatus, setRealtimeStatus] = useState<string>("init")
  const { toast } = useToast()

  const fetchTrips = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      console.log('🔄 [Itinerary] Fetching trips...')
      const response = await fetch("/api/trips", {
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        },
        cache: 'no-store'
      })
      const data = await response.json()
      setTrips(data)
    } catch (e: any) {
      console.error("Fetch error:", e.message)
    } finally {
      setLoading(false)
    }
  }

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

  const handleUpdateTrip = async (updatedTrip: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`/api/trips/${updatedTrip.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${session?.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedTrip)
      })

      if (!response.ok) throw new Error("Failed to update")

      toast({ title: "Success", description: "Trip updated successfully" })
      fetchTrips()
    } catch (e) {
      toast({ title: "Error", description: "Failed to update trip", variant: "destructive" })
    }
  }

  const handleCreateTrip = async (newTrip: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session?.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ tripData: newTrip.parsed_data })
      })

      if (!response.ok) throw new Error("Failed to create")

      toast({ title: "Success", description: "Trip created successfully" })
      fetchTrips()
    } catch (e) {
      toast({ title: "Error", description: "Failed to create trip", variant: "destructive" })
    }
  }

  // Filter out any trips that don't have events or valid parsed data
  const validTrips = Array.isArray(trips)
    ? trips.filter(trip => trip && trip.parsed_data?.events?.length > 0)
    : []

  useEffect(() => {
    let channel: any;

    const setupSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.warn('⚠️ [Realtime] No session found, skipping subscription')
        return
      }

      console.log('📡 [Realtime] Initializing for user:', session.user.id)

      // Clean up previous channel if it exists
      if (channel) {
        console.log('🔄 [Realtime] Cleaning up old channel before restart')
        supabase.removeChannel(channel)
      }

      // Create a fresh channel
      // We use a unique name each time to avoid cache/stale issues
      const channelName = `itinerary-debug-${Date.now()}`
      channel = supabase.channel(channelName)

      console.log('📡 [Realtime] Subscribing to ALL changes on "trips" table for debug...')

      channel
        .on(
          'postgres_changes',
          {
            event: '*', // Listen for EVERYTHING (Insert, Update, Delete)
            schema: 'public',
            table: 'trips',
            // REMOVING FILTER TEMPORARILY FOR DEBUG
          },
          (payload: any) => {
            console.log('🚨 [Realtime] EVENT DETECTED!', payload.eventType, payload)

            // Check if the user_id matches manually in the callback
            const payloadUserId = payload.new?.user_id || payload.old?.user_id
            if (payloadUserId === session.user.id) {
              console.log('✅ [Realtime] Match found for current user. Refreshing...')
              fetchTrips()
            } else {
              console.log('ℹ️ [Realtime] Event detected but for different user:', payloadUserId)
            }
          }
        )
        .subscribe((status: string) => {
          console.log('🌐 [Realtime] Status:', status, 'on debug channel:', channelName)
          setRealtimeStatus(status)
          if (status === 'CHANNEL_ERROR') {
            console.error('❌ [Realtime] Subscription failed. Action required: Enable Realtime for the "trips" table in Supabase Dashboard (Replication -> supabase_realtime).')
          }
        })
    }

    fetchTrips()
    setupSubscription()

    return () => {
      if (channel) {
        console.log('🔌 [Realtime] Cleaning up...')
        supabase.removeChannel(channel)
      }
    }
  }, [])

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/15">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-foreground"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
          </div>
          <h2 className="text-sm font-semibold tracking-wide uppercase text-card-foreground">My Itinerary</h2>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{validTrips.length} items</span>
          <div className="flex items-center gap-1.5 ml-2" title={`Real-time sync: ${realtimeStatus}`}>
            <div className={`h-1.5 w-1.5 rounded-full ${realtimeStatus === 'SUBSCRIBED' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Live</span>
          </div>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
          Add Event
        </button>
      </div>

      <div className="flex flex-col gap-8 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : validTrips.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No trips yet. Try parsing an email!</div>
        ) : (
          (Object.entries(
            validTrips.reduce((acc, trip) => {
              const event = trip.parsed_data?.events?.[0];
              if (!event) return acc;

              // Use event start date or fallback to created_at
              const rawDate = event.timing?.start_datetime || trip.created_at;
              // Format: "Monday, October 23, 2026"
              const dateObj = new Date(rawDate);
              const dateKey = dateObj.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });

              if (!acc[dateKey]) acc[dateKey] = [];
              acc[dateKey].push({ ...trip, _sortTime: dateObj.getTime() });
              return acc;
            }, {} as Record<string, any[]>)
          ) as [string, any[]][]).sort((a: any, b: any) => {
            // Sort days chronologically based on the first item in the group
            return (a[1][0]._sortTime - b[1][0]._sortTime);
          }).map(([dateHeader, dayTrips]: [string, any[]]) => (
            <DaySection key={dateHeader} date={dateHeader}>
              <div className="flex flex-col gap-4">
                {dayTrips.map((trip: any) => {
                  const data = trip.parsed_data;
                  const event = data.events?.[0];

                  // Collect rich details
                  const cardDetails = [
                    // Verification
                    ...(event.confirmation?.pnr ? [{ label: "PNR", value: event.confirmation.pnr }] : []),
                    ...(event.confirmation?.confirmation_code ? [{ label: "Confirmation", value: event.confirmation.confirmation_code }] : []),
                    ...(event.confirmation?.ticket_number ? [{ label: "Ticket", value: event.confirmation.ticket_number }] : []),

                    { label: "Provider", value: event.provider?.name || "N/A" },

                    // Sub-locations
                    ...(event.location?.sub_location?.terminal ? [{ label: "Terminal", value: event.location.sub_location.terminal }] : []),
                    ...(event.location?.sub_location?.gate ? [{ label: "Gate", value: event.location.sub_location.gate }] : []),
                    ...(event.location?.sub_location?.platform ? [{ label: "Platform", value: event.location.sub_location.platform }] : []),
                    ...(event.location?.sub_location?.room ? [{ label: "Room", value: event.location.sub_location.room }] : []),
                    ...(event.location?.sub_location?.table ? [{ label: "Table", value: event.location.sub_location.table }] : []),

                    ...(event.location?.address ? [{ label: "Address", value: event.location.address }] : []),
                    ...(event.location?.phone ? [{ label: "Phone", value: event.location.phone }] : []),

                    // Operational info
                    ...(event.operational_info?.party_size ? [{ label: "Party Size", value: event.operational_info.party_size.toString() }] : []),
                    ...(event.operational_info?.check_in_window ? [{ label: "Check-in", value: event.operational_info.check_in_window }] : []),
                    ...(event.operational_info?.items ? [{ label: "Items", value: event.operational_info.items.join(", ") }] : []),

                    // Financials
                    ...(event.cost?.total_amount ? [{ label: "Total", value: `${event.cost.total_amount} ${event.cost.currency || 'USD'}${event.cost.payment_status === 'paid' ? ' (Paid)' : ''}` }] : []),
                  ];

                  // Determine color based on UTO group
                  const getCategoryColor = (t: string): string => {
                    if (!t) return 'blue';
                    const lowT = t.toLowerCase();
                    if (['flight', 'train', 'bus', 'ferry', 'car_rental', 'public_transit', 'taxi'].includes(lowT)) return 'blue';
                    if (['hotel', 'vacation_rental', 'hostel', 'cruise', 'camping', 'lodging'].includes(lowT)) return 'green';
                    if (['restaurant', 'bar', 'food_tour', 'dining', 'dining_reservation'].includes(lowT)) return 'rose';
                    if (['tour', 'attraction', 'performance', 'wellness'].includes(lowT)) return 'amber';
                    if (['border_control', 'health', 'meeting', 'note'].includes(lowT)) return 'indigo';
                    return 'amber'; // fallback
                  };

                  return (
                    <ItineraryCard
                      key={trip.id}
                      title={trip.trip_name}
                      savedDate={new Date(trip.created_at).toLocaleDateString()}
                      type={event.event_type}
                      typeColor={getCategoryColor(event.event_type)}
                      datetime={event.timing?.start_datetime ? new Date(event.timing.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "All Day"}
                      location={event.location?.name || "Unknown"}
                      onEdit={() => setEditingTrip(trip)}
                      onDelete={() => handleDelete(trip.id)}
                      details={cardDetails}
                      milestones={event.milestones}
                    />
                  );
                })}
              </div>
            </DaySection>
          ))
        )}
      </div>

      {
        editingTrip && (
          <EditTripModal
            trip={editingTrip}
            isOpen={true}
            onClose={() => setEditingTrip(null)}
            onSave={handleUpdateTrip}
          />
        )}

      {isCreating && (
        <EditTripModal
          isOpen={true}
          onClose={() => setIsCreating(false)}
          onSave={handleCreateTrip}
        />
      )}
    </section>
  );
}
