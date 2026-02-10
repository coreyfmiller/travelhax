import React from "react"
function ItineraryCard({
  title,
  savedDate,
  type,
  typeColor,
  datetime,
  location,
  details,
}: {
  title: string;
  savedDate: string;
  type: string;
  typeColor: string;
  datetime: string;
  location: string;
  details: { label: string; value: string; icon?: string }[];
}) {
  const typeColorClasses: Record<string, string> = {
    blue: "bg-primary/10 text-primary",
    green: "bg-accent/10 text-accent-foreground",
    amber: "bg-[hsl(43,74%,66%)]/15 text-[hsl(30,70%,40%)]",
  };

  return (
    <div className="group relative rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Card header */}
      <div className="flex items-start justify-between border-b border-border px-5 py-4">
        <div>
          <h4 className="text-sm font-semibold text-card-foreground">{title}</h4>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Saved: {savedDate}
          </p>
        </div>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-card-foreground"
            aria-label="Edit"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
            </svg>
          </button>
          <button
            type="button"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label="Delete"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Card body */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${typeColorClasses[typeColor] || typeColorClasses.blue}`}>
            {type}
          </span>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-card-foreground">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted-foreground">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            {datetime}
          </div>

          <div className="flex items-center gap-2 text-sm text-card-foreground">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted-foreground">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {location}
          </div>
        </div>

        {/* Details */}
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

function DaySection({
  date,
  children,
}: {
  date: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-foreground">{date}</h3>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="ml-4 flex flex-col gap-4 border-l-2 border-primary/20 pl-6">
        {children}
      </div>
    </div>
  );
}

export function Itinerary() {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Section header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/15">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-accent-foreground"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold tracking-wide uppercase text-card-foreground">
            My Itinerary
          </h2>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            3 items
          </span>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-card-foreground transition-colors hover:bg-secondary"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect width="12" height="8" x="6" y="14" />
          </svg>
          Print
        </button>
      </div>

      {/* Itinerary content */}
      <div className="flex flex-col gap-8 p-6">
        <DaySection date="Saturday, 3/14/2026">
          <ItineraryCard
            title="Stay at Marriott Downtown Toronto"
            savedDate="2/9/2026"
            type="Hotel"
            typeColor="green"
            datetime="3/14/2026 at 7:00 PM"
            location="Marriott Downtown Toronto"
            details={[
              { label: "Hotel", value: "Marriott Downtown Toronto" },
              { label: "Conf", value: "1234567890" },
              { label: "Phone", value: "(416) 597-9200" },
              { label: "Address", value: "525 Bay Street, Toronto, ON M5G 2L2, Canada" },
            ]}
          />
        </DaySection>

        <DaySection date="Sunday, 3/15/2026">
          <ItineraryCard
            title="Flight to Toronto Pearson International Airport (YYZ)"
            savedDate="2/9/2026"
            type="Flight"
            typeColor="blue"
            datetime="3/15/2026 at 5:00 PM"
            location="Toronto Pearson International Airport (YYZ)"
            details={[
              { label: "Airline", value: "Air Canada" },
              { label: "Conf", value: "ABC123" },
              { label: "Phone", value: "1-888-247-2262" },
              { label: "Terminal", value: "Terminal 1, Gate B12" },
            ]}
          />
          <ItineraryCard
            title="Rental Car"
            savedDate="2/10/2026"
            type="Rental Car"
            typeColor="amber"
            datetime="3/15/2026 at 6:30 PM"
            location="Toronto Pearson Airport (YYZ)"
            details={[
              { label: "Company", value: "Enterprise" },
              { label: "Conf", value: "987654321" },
            ]}
          />
        </DaySection>
      </div>
    </section>
  );
}
