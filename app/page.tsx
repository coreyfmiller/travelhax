"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Header } from "@/components/header"
import { EmailInput } from "@/components/email-input"
import { ApprovedSenders } from "@/components/approved-senders"
import { Itinerary } from "@/components/itinerary"
import { Button } from "@/components/ui/button"
import { User } from "@supabase/supabase-js"

export default function Page() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8 flex flex-col gap-8">
        <div className="relative">
          <EmailInput />
          {!user && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-background/60 backdrop-blur-[2px] border border-dashed border-primary/20 p-8 text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Sign in to Start Parsing</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-[280px]">
                Create a free account to transform your travel emails into structured itineraries.
              </p>
            </div>
          )}
        </div>

        {user && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">✨ Automatic Sync</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Forward your confirmation emails (flights, hotels, rental cars) to:
            </p>
            <div className="inline-block rounded-lg bg-background px-4 py-2 border border-primary/20 font-mono text-primary font-bold text-lg mb-2">
              trips@itinery5.com
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Make sure you forward from an <strong>Approved Sender</strong> listed below.
            </p>
          </div>
        )}

        {user && <ApprovedSenders />}

        <div className="relative">
          <Itinerary />
          {!user && (
            <div className="absolute inset-0 z-10 bg-background/20" />
          )}
        </div>
      </main>
    </div>
  )
}
