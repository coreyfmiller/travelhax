"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface EditTripModalProps {
    trip?: any // Optional now
    isOpen: boolean
    onClose: () => void
    onSave: (updatedTrip: any) => Promise<void>
}

export function EditTripModal({ trip, isOpen, onClose, onSave }: EditTripModalProps) {
    const [loading, setLoading] = useState(false)
    const isEditing = !!trip

    const [formData, setFormData] = useState({
        trip_name: trip?.trip_name || "",
        event_type: trip?.parsed_data?.events?.[0]?.event_type || "other",
        start_datetime: trip?.parsed_data?.events?.[0]?.timing?.start_datetime || "",
        location: trip?.parsed_data?.events?.[0]?.location?.name || "",
        confirmation_code: trip?.parsed_data?.events?.[0]?.confirmation?.confirmation_code || "",
    })

    // Format datetime for input (YYYY-MM-DDTHH:mm)
    const formatForInput = (isoString: string) => {
        if (!isoString) return ""
        return isoString.split('.')[0].slice(0, 16)
    }

    const [dateInput, setDateInput] = useState(formatForInput(formData.start_datetime))

    const handleSave = async () => {
        setLoading(true)
        try {
            let payload;

            if (isEditing) {
                // Update existing trip structure
                payload = {
                    ...trip,
                    trip_name: formData.trip_name,
                    parsed_data: {
                        ...trip.parsed_data,
                        events: [
                            {
                                ...trip.parsed_data.events[0],
                                event_type: formData.event_type,
                                timing: {
                                    ...trip.parsed_data.events[0].timing,
                                    start_datetime: dateInput ? new Date(dateInput).toISOString() : null
                                },
                                location: {
                                    ...trip.parsed_data.events[0].location,
                                    name: formData.location
                                },
                                confirmation: {
                                    ...trip.parsed_data.events[0].confirmation,
                                    confirmation_code: formData.confirmation_code
                                }
                            },
                            ...trip.parsed_data.events.slice(1)
                        ]
                    }
                }
            } else {
                // Create new trip structure
                payload = {
                    trip_name: formData.trip_name || "New Trip",
                    parsed_data: {
                        extraction_metadata: {
                            email_subject: formData.trip_name || "Manual Entry",
                            extracted_at: new Date().toISOString(),
                        },
                        events: [{
                            event_type: formData.event_type,
                            timing: {
                                start_datetime: dateInput ? new Date(dateInput).toISOString() : new Date().toISOString()
                            },
                            location: {
                                name: formData.location
                            },
                            confirmation: {
                                confirmation_code: formData.confirmation_code
                            }
                        }]
                    }
                }
            }

            await onSave(payload)
            onClose()
        } catch (e) {
            console.error("Failed to save trip", e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Trip Details" : "Add New Trip"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="trip_name" className="text-right">
                            Trip Name
                        </Label>
                        <Input
                            id="trip_name"
                            value={formData.trip_name}
                            onChange={(e) => setFormData({ ...formData, trip_name: e.target.value })}
                            className="col-span-3"
                            placeholder="e.g. Flight to NYC"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="event_type" className="text-right">
                            Category
                        </Label>
                        <select
                            id="event_type"
                            value={formData.event_type}
                            onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                            className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <optgroup label="Transportation">
                                <option value="flight">Flight</option>
                                <option value="train">Train</option>
                                <option value="bus">Bus</option>
                                <option value="ferry">Ferry</option>
                                <option value="car_rental">Car Rental</option>
                                <option value="public_transit">Public Transit</option>
                                <option value="taxi">Taxi</option>
                            </optgroup>
                            <optgroup label="Lodging">
                                <option value="hotel">Hotel</option>
                                <option value="vacation_rental">Vacation Rental</option>
                                <option value="hostel">Hostel</option>
                                <option value="cruise">Cruise</option>
                                <option value="camping">Camping</option>
                            </optgroup>
                            <optgroup label="Culinary">
                                <option value="restaurant">Restaurant</option>
                                <option value="bar">Bar</option>
                                <option value="food_tour">Food Tour</option>
                            </optgroup>
                            <optgroup label="Activities & Sightseeing">
                                <option value="tour">Tour</option>
                                <option value="attraction">Attraction</option>
                                <option value="performance">Performance</option>
                                <option value="wellness">Wellness</option>
                            </optgroup>
                            <optgroup label="Administrative">
                                <option value="border_control">Border Control</option>
                                <option value="health">Health</option>
                                <option value="meeting">Meeting</option>
                                <option value="note">Note</option>
                                <option value="other">Other</option>
                            </optgroup>
                        </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                            Date
                        </Label>
                        <Input
                            id="date"
                            type="datetime-local"
                            value={dateInput}
                            onChange={(e) => setDateInput(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="location" className="text-right">
                            Location
                        </Label>
                        <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="col-span-3"
                            placeholder="e.g. JFK Airport"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="confirmation" className="text-right">
                            Confirm #
                        </Label>
                        <Input
                            id="confirmation"
                            value={formData.confirmation_code}
                            onChange={(e) => setFormData({ ...formData, confirmation_code: e.target.value })}
                            className="col-span-3"
                            placeholder="Optional"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : (isEditing ? "Save changes" : "Create Trip")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
