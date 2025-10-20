"use client";

import React, { useState, useMemo } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Appointment } from '@/app/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"

interface AppointmentCalendarProps {
    initialAppointments: Appointment[];
}

export function AppointmentCalendar({ initialAppointments }: AppointmentCalendarProps) {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [appointments, setAppointments] = useState(initialAppointments);

    const selectedDayAppointments = useMemo(() => {
        if (!date) return [];
        return appointments.filter(apt => {
            const aptDate = new Date(apt.date);
            return aptDate.toDateString() === date.toDateString();
        });
    }, [date, appointments]);
    
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-2">
                <CardContent className="p-2 md:p-4">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md"
                        classNames={{
                            day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90",
                            day_today: "bg-accent text-accent-foreground",
                        }}
                    />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>
                        Appointments for {date ? date.toLocaleDateString() : '...'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {selectedDayAppointments.length > 0 ? (
                        selectedDayAppointments.map(apt => (
                            <div key={apt.id} className="p-3 bg-secondary/50 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <p className="font-semibold">{apt.title}</p>
                                    <Badge variant="outline">{apt.time}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{apt.description}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-sm py-8 text-center">No appointments for this day.</p>
                    )}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="w-full mt-4">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Appointment
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Appointment</DialogTitle>
                                <DialogDescription>
                                    Fill in the details to schedule a new appointment. A full form would be here.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <p className="text-sm text-muted-foreground">Appointment form fields would go here.</p>
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </div>
    );
}
