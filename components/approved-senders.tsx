import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check, Clipboard, Loader2, Mail, Plus, Trash2 } from "lucide-react"

export function ApprovedSenders() {
    const [senders, setSenders] = useState<any[]>([])
    const [newEmail, setNewEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [copying, setCopying] = useState(false)
    const { toast } = useToast()
    const forwardingEmail = "trips@itinery5.com"

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
                    is_verified: true
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

    const copyToClipboard = () => {
        navigator.clipboard.writeText(forwardingEmail)
        setCopying(true)
        toast({ title: "Copied!", description: "Email address copied to clipboard." })
        setTimeout(() => setCopying(false), 2000)
    }

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="bg-primary/5 p-5 border-b border-border">
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-sm border border-primary/20">
                        <Mail size={22} />
                    </div>
                    <h3 className="font-extrabold text-2xl tracking-tight">Setup Instructions</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                    {/* Step 1: Add Senders */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">1</span>
                            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Authorize your emails</p>
                        </div>
                        <div className="rounded-lg bg-background border border-primary/20 p-5 shadow-sm flex flex-col justify-between flex-1">
                            <div>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest px-1 mb-3">Adding sender email:</p>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="your@email.com"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        className="h-10 text-sm shadow-sm"
                                    />
                                    <Button onClick={handleAddSender} disabled={loading} className="h-10 px-4 gap-2 font-bold shadow-sm shrink-0">
                                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                        Add Email
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Forwarding Email */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">2</span>
                            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Forward your travels</p>
                        </div>
                        <div className="rounded-lg bg-background border border-primary/20 p-5 shadow-sm flex flex-col justify-between flex-1">
                            <div>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest px-1 mb-3">Send emails to:</p>
                                <div className="flex items-center justify-between gap-2">
                                    <code className="text-sm font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-md border border-primary/10 select-all flex-1 text-center">
                                        {forwardingEmail}
                                    </code>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-10 gap-2 font-medium px-4"
                                        onClick={copyToClipboard}
                                    >
                                        {copying ? <Check size={14} className="text-green-500" /> : <Clipboard size={14} />}
                                        {copying ? "Copied" : "Copy"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-muted/30">
                <div className="flex flex-wrap gap-2">
                    <div className="w-full flex items-center gap-2 mb-1 px-1">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none">Your Trusted Senders</span>
                        <div className="h-px flex-1 bg-border/50" />
                    </div>
                    {senders.map((sender) => (
                        <div key={sender.id} className="flex items-center gap-2 px-4 py-1.5 bg-background border border-border shadow-sm rounded-full group transition-all hover:border-primary/30">
                            <span className="text-xs font-semibold">{sender.email_address}</span>
                            <button
                                onClick={() => handleDelete(sender.id)}
                                className="text-muted-foreground hover:text-destructive p-0.5 transition-colors"
                                title="Remove authorized sender"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                    {senders.length === 0 && (
                        <p className="text-xs text-muted-foreground italic px-1">No approved senders yet.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
