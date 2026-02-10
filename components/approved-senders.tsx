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
            <div className="bg-primary/5 p-4 border-b border-border">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background border border-primary/20 text-primary">
                            <Mail size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Forward emails to:</p>
                            <div className="flex items-center gap-2">
                                <code className="text-sm font-bold text-foreground bg-background px-2 py-0.5 rounded border border-primary/10">
                                    {forwardingEmail}
                                </code>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                    onClick={copyToClipboard}
                                >
                                    {copying ? <Check size={14} /> : <Clipboard size={14} />}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 max-w-sm">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add your sending email..."
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="h-9 text-sm"
                            />
                            <Button onClick={handleAddSender} disabled={loading} size="sm" className="shrink-0 gap-1.5">
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                Add
                            </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 px-1">
                            Only emails from these addresses will be parsed.
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-card/50">
                <div className="flex flex-wrap gap-2">
                    {senders.map((sender) => (
                        <div key={sender.id} className="flex items-center gap-2 px-3 py-1 bg-background border border-border rounded-full group">
                            <span className="text-xs font-medium">{sender.email_address}</span>
                            <button
                                onClick={() => handleDelete(sender.id)}
                                className="text-muted-foreground hover:text-destructive p-0.5 transition-colors"
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
