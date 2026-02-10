"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function ApprovedSenders() {
    const [senders, setSenders] = useState<any[]>([])
    const [newEmail, setNewEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const fetchSenders = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const { data, error } = await supabase
            .from("user_email_senders")
            .select("*")
            .order("created_at", { ascending: true })

        if (data) setSenders(data)
    }

    useEffect(() => {
        fetchSenders()
    }, [])

    const handleAddSender = async () => {
        if (!newEmail) return
        setLoading(true)

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const { error } = await supabase
                .from("user_email_senders")
                .insert([{
                    email_address: newEmail,
                    user_id: session.user.id,
                    is_verified: true // Auto-verify for now
                }])

            if (error) throw error

            setNewEmail("")
            toast({ title: "Success", description: "Sender added!" })
            fetchSenders()
        } catch (e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from("user_email_senders")
                .delete()
                .eq("id", id)

            if (error) throw error

            setSenders(senders.filter(s => s.id !== id))
            toast({ title: "Removed", description: "Sender removed" })
        } catch (e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" })
        }
    }

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Approved Email Senders</h3>
            <p className="text-sm text-muted-foreground mb-4">
                Add the email addresses you will forward trips from. We use this to match incoming emails to your account.
            </p>

            <div className="flex gap-2 mb-6">
                <Input
                    placeholder="e.g. your.name@gmail.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                />
                <Button onClick={handleAddSender} disabled={loading}>
                    {loading ? "Adding..." : "Add Email"}
                </Button>
            </div>

            <div className="space-y-2">
                {senders.map((sender) => (
                    <div key={sender.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <span className="font-medium">{sender.email_address}</span>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(sender.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            Remove
                        </Button>
                    </div>
                ))}
                {senders.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No approved senders yet.</p>
                )}
            </div>
        </div>
    )
}
