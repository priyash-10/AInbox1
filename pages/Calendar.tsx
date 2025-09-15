import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import CalendarPage from "@/components/calendar/CalendarPage";

const Calendar = () => {
  return (
    <AppShell>
      <CalendarPage />
    </AppShell>
  );
};

export default Calendar;
