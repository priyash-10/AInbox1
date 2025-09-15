import { useState, useEffect, useRef } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import "./calendar-page.css";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  backgroundColor?: string;
  classNames?: string[];
  extendedProps?: {
    type?: string;
  };
}

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  colorId?: string;
}

const CalendarPage = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState("timeGridWeek");
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const calendarRef = useRef<any>(null);
  const { toast } = useToast();

  // Fetch Google Calendar events on component mount
  useEffect(() => {
    const fetchCalendarEvents = async () => {
      try {
        setLoading(true);
        const res = await axios.get<GoogleCalendarEvent[]>(
          "http://localhost:5000/api/calendar/events",
          { withCredentials: true }
        );

        // Transform Google Calendar events to FullCalendar format
        const transformedEvents = res.data.map((event: GoogleCalendarEvent) => {
          // Determine event type based on title or other properties
          const eventType = determineEventType(event.summary);

          return {
            id: event.id,
            title: event.summary,
            start: event.start.dateTime || event.start.date || "",
            end: event.end.dateTime || event.end.date || "",
            allDay: !event.start.dateTime,
            backgroundColor: getEventColor(event),
            classNames: [eventType],
            extendedProps: {
              type: eventType,
            },
          };
        });

        // Add sample events to match the image
        const sampleEvents = getSampleEvents();

        setEvents([...transformedEvents, ...sampleEvents]);
        setError(null);
      } catch (err) {
        console.error("Error fetching calendar events:", err);
        setError("Failed to load calendar events");
        toast({
          title: "Error",
          description: "Failed to load calendar events. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarEvents();
  }, [toast]);

  // Determine event type based on title
  const determineEventType = (title: string): string => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("lunch")) return "lunch-event";
    if (lowerTitle.includes("meeting")) return "meeting-event";
    if (lowerTitle.includes("dinner")) return "dinner-event";
    if (lowerTitle.includes("night") || lowerTitle.includes("evening"))
      return "late-night-event";
    return "";
  };

  // Sample events to match the image
  const getSampleEvents = (): CalendarEvent[] => {
    const today = new Date();
    const currentDay = today.getDay();

    // Calculate date for Monday (index 1)
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDay + 1);

    // Calculate dates for the rest of the week
    const tuesday = new Date(monday);
    tuesday.setDate(monday.getDate() + 1);

    const wednesday = new Date(monday);
    wednesday.setDate(monday.getDate() + 2);

    const thursday = new Date(monday);
    thursday.setDate(monday.getDate() + 3);

    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);

    const saturday = new Date(monday);
    saturday.setDate(monday.getDate() + 5);

    return [
      {
        id: "sample-1",
        title: "Lunch",
        start: new Date(monday.setHours(12, 0, 0, 0)).toISOString(),
        end: new Date(monday.setHours(13, 0, 0, 0)).toISOString(),
        backgroundColor: "#2c6dbf",
        classNames: ["lunch-event"],
        extendedProps: { type: "lunch-event" },
      },
      {
        id: "sample-2",
        title: "JHON's Birthday - Mom's House",
        start: new Date(monday.setHours(11, 0, 0, 0)).toISOString(),
        end: new Date(monday.setHours(12, 30, 0, 0)).toISOString(),
        backgroundColor: "#2c6dbf",
        extendedProps: { type: "birthday-event" },
      },
      {
        id: "sample-3",
        title: "Meeting",
        start: new Date(monday.setHours(14, 0, 0, 0)).toISOString(),
        end: new Date(monday.setHours(15, 30, 0, 0)).toISOString(),
        backgroundColor: "#2c6dbf",
        classNames: ["meeting-event"],
        extendedProps: { type: "meeting-event" },
      },
      {
        id: "sample-4",
        title: "Dinner",
        start: new Date(monday.setHours(19, 0, 0, 0)).toISOString(),
        end: new Date(monday.setHours(20, 0, 0, 0)).toISOString(),
        backgroundColor: "#2c6dbf",
        classNames: ["dinner-event"],
        extendedProps: { type: "dinner-event" },
      },
      {
        id: "sample-5",
        title: "Late Night Event",
        start: new Date(friday.setHours(20, 0, 0, 0)).toISOString(),
        end: new Date(friday.setHours(23, 0, 0, 0)).toISOString(),
        backgroundColor: "#2c6dbf",
        classNames: ["late-night-event"],
        extendedProps: { type: "late-night-event" },
      },
      {
        id: "sample-6",
        title: "Late Night Event",
        start: new Date(saturday.setHours(21, 0, 0, 0)).toISOString(),
        end: new Date(saturday.setHours(23, 30, 0, 0)).toISOString(),
        backgroundColor: "#2c6dbf",
        classNames: ["late-night-event"],
        extendedProps: { type: "late-night-event" },
      },
    ];
  };

  // Assign different colors to different event types
  const getEventColor = (event: GoogleCalendarEvent): string => {
    // You can customize this based on event properties
    if (event.colorId === "1") return "#4285F4"; // Blue
    if (event.colorId === "2") return "#EA4335"; // Red
    if (event.colorId === "3") return "#FBBC04"; // Yellow
    if (event.colorId === "4") return "#34A853"; // Green
    return "#3788d8"; // Default blue
  };

  const handleDateClick = (arg: any) => {
    // Store the clicked date/time
    setSelectedTime(arg.date);

    // Start creating a new event
    setSelectedEventId(null);
    setEventTitle("");

    // Focus the view on the clicked time
    const calendarApi = calendarRef.current.getApi();
    calendarApi.changeView("timeGrid", {
      start: arg.date,
      end: new Date(arg.date.getTime() + 30 * 60000), // 30 minutes later
    });
  };

  const handleEventClick = (info: any) => {
    // Select an existing event
    setSelectedEventId(info.event.id);
    setEventTitle(info.event.title);
  };

  const createEvent = () => {
    if (!eventTitle.trim()) return;

    // Use the selected time if available, otherwise use current view's start date
    let startDate: Date;

    if (selectedTime) {
      startDate = new Date(selectedTime);
    } else {
      // Fallback to the current view's start date at noon
      const calendarApi = calendarRef.current.getApi();
      const view = calendarApi.view;
      startDate = new Date(view.activeStart);
      startDate.setHours(12, 0, 0);
    }

    // End time is 1 hour later
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: eventTitle,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      backgroundColor: "#3788d8",
    };

    setEvents([...events, newEvent]);
    setEventTitle("");
    setSelectedTime(null);

    toast({
      title: "Success",
      description: "Event created successfully!",
    });
  };

  const updateEvent = () => {
    if (!selectedEventId || !eventTitle.trim()) return;

    const updatedEvents = events.map((event) => {
      if (event.id === selectedEventId) {
        return { ...event, title: eventTitle };
      }
      return event;
    });

    setEvents(updatedEvents);
    setSelectedEventId(null);
    setEventTitle("");

    toast({
      title: "Success",
      description: "Event updated successfully!",
    });
  };

  const deleteEvent = () => {
    if (!selectedEventId) return;

    const filteredEvents = events.filter(
      (event) => event.id !== selectedEventId
    );
    setEvents(filteredEvents);
    setSelectedEventId(null);
    setEventTitle("");

    toast({
      title: "Success",
      description: "Event deleted successfully!",
    });
  };

  const handleViewChange = (viewType: string) => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.changeView(viewType);
    setCurrentView(viewType);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col-reverse md:flex-row gap-4 mb-4">
        <div className="w-full md:w-9/12">
          <Card className="shadow-md">
            <CardContent className="p-0 md:p-4">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <p>Loading calendar events...</p>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center h-40">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : (
                <div className="fullcalendar-container">
                  <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                      left: "prev,next today",
                      center: "title",
                      right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
                    }}
                    height="auto"
                    events={events}
                    weekends={true}
                    slotMinTime="07:00:00"
                    slotMaxTime="22:00:00"
                    nowIndicator={true}
                    dayHeaderFormat={{
                      weekday: "short",
                      month: "numeric",
                      day: "numeric",
                    }}
                    titleFormat={{
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }}
                    allDaySlot={true}
                    allDayText="All Day"
                    dateClick={handleDateClick}
                    eventClick={handleEventClick}
                    slotDuration="00:30:00"
                    eventTimeFormat={{
                      hour: "2-digit",
                      minute: "2-digit",
                      meridiem: false,
                    }}
                    eventContent={(eventInfo) => {
                      const type = eventInfo.event.extendedProps?.type || "";

                      // Special rendering for late night events
                      if (type === "late-night-event") {
                        return (
                          <>
                            <div className="event-time">
                              {eventInfo.timeText}
                            </div>
                            <div className="event-title font-medium">
                              {eventInfo.event.title}
                            </div>
                          </>
                        );
                      }

                      return (
                        <>
                          <div className="event-time">{eventInfo.timeText}</div>
                          <div className="event-title">
                            {eventInfo.event.title}
                          </div>
                        </>
                      );
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-3/12">
          <Card className="shadow-md mb-4">
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold mb-4">
                {selectedEventId ? "Edit Event" : "Add Event"}
              </h2>

              {selectedTime && !selectedEventId && (
                <p className="text-sm text-muted-foreground mb-4">
                  Selected Time:{" "}
                  {selectedTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}{" "}
                  on{" "}
                  {selectedTime.toLocaleDateString([], {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              )}

              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Event Title"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                />

                {selectedEventId ? (
                  <div className="flex space-x-2">
                    <Button
                      className="flex-1"
                      onClick={updateEvent}
                      disabled={!eventTitle.trim()}
                    >
                      Update
                    </Button>
                    <Button variant="destructive" onClick={deleteEvent}>
                      Delete
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={createEvent}
                    disabled={!eventTitle.trim()}
                  >
                    Add Event
                  </Button>
                )}

                {selectedEventId && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSelectedEventId(null);
                      setEventTitle("");
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold mb-4">View Options</h2>
              <div className="flex flex-col space-y-2">
                <Button
                  variant={
                    currentView === "dayGridMonth" ? "default" : "outline"
                  }
                  className="w-full justify-start"
                  onClick={() => handleViewChange("dayGridMonth")}
                >
                  Month
                </Button>
                <Button
                  variant={
                    currentView === "timeGridWeek" ? "default" : "outline"
                  }
                  className="w-full justify-start"
                  onClick={() => handleViewChange("timeGridWeek")}
                >
                  Week
                </Button>
                <Button
                  variant={
                    currentView === "timeGridDay" ? "default" : "outline"
                  }
                  className="w-full justify-start"
                  onClick={() => handleViewChange("timeGridDay")}
                >
                  Day
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    const calendarApi = calendarRef.current.getApi();
                    calendarApi.today();
                  }}
                >
                  Today
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
