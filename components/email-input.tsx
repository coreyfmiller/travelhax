const sampleButtons = [
  { label: "Flight", icon: "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" },
  { label: "Hotel", icon: "M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM9 14a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" },
  { label: "Rental", icon: "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2.7-3.4A2 2 0 0 0 13.7 6H6.3a2 2 0 0 0-1.6.9L2 10l-2.5 1.1C-.7 11.3-1 12.1-1 13v3c0 .6.4 1 1 1h2M7 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" },
  { label: "Dinner", icon: "M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" },
  { label: "Lunch", icon: "M18 8h1a4 4 0 0 0 0-8h-1M2 8h16M6 1v3M10 1v3M14 1v3M2 8a5 5 0 0 0 5 5h2a5 5 0 0 0 5-5M6 15v3M14 15v3M4 18h12" },
];

export function EmailInput() {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Section header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold tracking-wide uppercase text-card-foreground">
            Email Input
          </h2>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          </svg>
          Parse Email
        </button>
      </div>

      {/* Sample buttons */}
      <div className="border-b border-border bg-secondary/50 px-6 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium text-muted-foreground">Samples:</span>
          {sampleButtons.map((btn) => (
            <button
              key={btn.label}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-card-foreground transition-colors hover:bg-secondary"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground"
              >
                <path d={btn.icon} />
              </svg>
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <div className="p-6">
        <textarea
          rows={8}
          placeholder="Paste your travel confirmation email here..."
          className="w-full resize-y rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          defaultValue={`Subject: Flight Confirmation - AC123 Toronto to Vancouver

Dear John Smith,

Your flight is confirmed!

Confirmation Code: ABC123
Ticket Number: 0142345678901`}
        />
      </div>
    </section>
  );
}
