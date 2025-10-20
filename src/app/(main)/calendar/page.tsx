import { getAppointments } from "@/app/lib/data";
import { PageHeader } from "@/components/page-header";
import { AppointmentCalendar } from "./appointment-calendar";


export default async function CalendarPage() {
    const appointments = await getAppointments();
    
    return (
        <>
            <PageHeader 
                title="Calendar"
                description="Manage your appointments and schedule."
            />
            <AppointmentCalendar initialAppointments={appointments} />
        </>
    );
}
