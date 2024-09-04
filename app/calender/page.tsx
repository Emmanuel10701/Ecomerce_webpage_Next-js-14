"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Button, Dialog, TextField, IconButton, Typography, CircularProgress, MenuItem, Select, FormControl, InputLabel, Drawer, Badge } from '@mui/material';
import { AiOutlineClose, AiOutlineBell } from 'react-icons/ai';
import Sidebar from '@/components/sidebar/page';
import LoadingSpinner from '@/components/spinner/page';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Event = {
  title: string;
  date: string;
  color: string;
  id: string;
};

type Notification = {
  id: string;
  message: string;
};

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

const CalendarPage: React.FC = () => {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [recipientType, setRecipientType] = useState('employees');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isEventsDrawerOpen, setIsEventsDrawerOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const router = useRouter();

  useEffect(() => {
    if (session) {
      const storedEvents = localStorage.getItem('events');
      const storedNotifications = localStorage.getItem('notifications');
      if (storedEvents) {
        setEvents(JSON.parse(storedEvents));
      }
      if (storedNotifications) {
        const notifications = JSON.parse(storedNotifications);
        setNotifications(notifications);
        setNotificationCount(notifications.length);
      }
    }
  }, [session]);

  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem('events', JSON.stringify(events));
    }
    if (notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [events, notifications]);

  const handleDateClick = (arg: any) => {
    const today = new Date().toISOString().split('T')[0];
    if (arg.dateStr >= today) {
      setEventDate(arg.dateStr);
      setOpenEventDialog(true);
      setSelectedEventId(null);
    }
  };

  const handleAddEvent = async () => {
    if (eventTitle && eventDate) {
      setLoading(true);
      try {
        const newEvent: Event = { title: eventTitle, date: eventDate, color: 'green', id: Date.now().toString() };
        setEvents([...events, newEvent]);
        toast.success('Event added successfully!');
        setOpenEventDialog(false);
        setEventTitle('');
        setEventDate('');
        setRecipientType('employees');
      } catch (error) {
        toast.error('Failed to add event.');
      } finally {
        setLoading(false);
      }
    } else {
      toast.error('Please fill out all fields.');
    }
  };

  const handleUpdateEvent = async () => {
    if (eventTitle && eventDate && selectedEventId) {
      setLoading(true);
      try {
        const updatedEvents = events.map(event =>
          event.id === selectedEventId
            ? { ...event, title: eventTitle, date: eventDate, color: 'green' }
            : event
        );
        setEvents(updatedEvents);
        toast.success('Event updated successfully!');
        setOpenEventDialog(false);
        setEventTitle('');
        setEventDate('');
        setRecipientType('employees');
        setSelectedEventId(null);
      } catch (error) {
        toast.error('Failed to update event.');
      } finally {
        setLoading(false);
      }
    } else {
      toast.error('Please fill out all fields.');
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
    toast.success('Event deleted successfully!');
  };

  const handleEventClick = (arg: any) => {
    const event = events.find(e => e.id === arg.event.id);
    if (event && event.date >= new Date().toISOString().split('T')[0]) {
      setEventTitle(event.title);
      setEventDate(event.date);
      setSelectedEventId(event.id);
      setOpenEventDialog(true);
    }
  };

  const handleNotificationClick = () => {
    setIsEventsDrawerOpen(true);
  };

  const handleAddNotification = () => {
    if ((session?.user as User)?.role === 'admin') {
      const newNotification: Notification = { id: Date.now().toString(), message: 'New Notification' };
      setNotifications([...notifications, newNotification]);
      setNotificationCount(prev => prev + 1);
      toast.success('Notification created successfully!');
    } else {
      toast.error('Only admins can create notifications.');
    }
  };

  const toggleEventsDrawer = () => {
    setIsEventsDrawerOpen(!isEventsDrawerOpen);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    if (path === '/account') {
      setNotificationCount(0);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className="flex-1 p-4 bg-blue-400 flex items-center justify-center">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-400">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm text-center">
          <h2 className="text-2xl font-bold mb-4 text-blue-500">Please Log In</h2>
          <p className="mb-6 text-gray-600">You need to log in to access this page.</p>
          <button 
            onClick={() => router.push("/login")} 
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
          >
            Go to Login Page
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className={`flex-1 p-4 ${isSidebarOpen ? 'ml-[24%] w-[75%]' : 'ml-0 w-full'} bg-blue-400`}>
        <div className="mb-4 flex justify-between items-center">
          <Typography variant="h4" component="h1" className="font-semibold text-white">
            Calendar
          </Typography>
          <Button
            onClick={() => handleNavigation("/analytics")}
            className="text-sm text-white bg-blue-600 rounded-md px-4 py-2 hover:bg-blue-700"
          >
            Dashboard
          </Button>
          <IconButton
            color="inherit"
            onClick={handleNotificationClick}
          >
            <Badge badgeContent={totalCount} color="error">
              <AiOutlineBell size={32} className="text-slate-100" />
            </Badge>
          </IconButton>

        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events.map(event => ({
              title: event.title,
              date: event.date,
              id: event.id,
              backgroundColor: event.date < new Date().toISOString().split('T')[0] ? 'gray' : event.color,
              borderColor: event.date < new Date().toISOString().split('T')[0] ? 'lightgray' : event.color,
              textColor: 'white'
            }))}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek,dayGridDay'
            }}
            themeSystem='bootstrap'
            eventContent={({ event }) => (
              <div>
                <b>{event.title}</b>
              </div>
            )}
          />
        </div>

        <Dialog open={openEventDialog} onClose={() => setOpenEventDialog(false)}>
          <div className="p-4 relative">
            <IconButton
              edge="end"
              color="inherit"
              onClick={() => setOpenEventDialog(false)}
              aria-label="close"
              className="absolute right-2 top-2"
            >
              <AiOutlineClose size={24} />
            </IconButton>
            <Typography variant="h6" className="mb-4 text-orange-600">{selectedEventId ? 'Edit Event' : 'Add Event'}</Typography>
            <TextField
              label="Event Title"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              fullWidth
              margin="normal"
              disabled={!!selectedEventId}
            />
            <TextField
              label="Event Date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              disabled={!!selectedEventId}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Recipient Type</InputLabel>
              <Select
                value={recipientType}
                onChange={(e) => setRecipientType(e.target.value)}
                label="Recipient Type"
                disabled={!!selectedEventId}
              >
                <MenuItem value="employees">Employees</MenuItem>
                <MenuItem value="users">Users</MenuItem>
              </Select>
            </FormControl>
            <div className="mt-4 flex justify-end">
              {selectedEventId ? (
                <Button
                  onClick={handleUpdateEvent}
                  color="primary"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Update Event'}
                </Button>
              ) : (
                <Button
                  onClick={handleAddEvent}
                  color="primary"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Add Event'}
                </Button>
              )}
              <Button
                onClick={() => setOpenEventDialog(false)}
                color="secondary"
                variant="outlined"
                className="ml-2"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Dialog>

        <Drawer
          anchor="right"
          open={isEventsDrawerOpen}
          onClose={toggleEventsDrawer}
          sx={{
            '.MuiDrawer-paper': {
              width: '50vw',
              maxWidth: '300px',
            },
          }}
        >
          <div className="p-4 h-full bg-slate-100 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h6" className="text-blue-600">All Events</Typography>
              <IconButton
                edge="end"
                color="inherit"
                onClick={toggleEventsDrawer}
                aria-label="close"
              >
                <AiOutlineClose size={24} />
              </IconButton>
            </div>
            <Typography variant="body2" className="mb-4 text-gray-700">
              Here is the list of all upcoming events. You can also delete events directly from this list.
            </Typography>
            <ul className="flex-1 overflow-y-auto">
              {events.map(event => (
                <li key={event.id} className="mb-2 flex justify-between items-center">
                  <Typography variant="body1" style={{ color: event.color }}>
                    {event.title} - {event.date}
                  </Typography>
                  <Button
                    onClick={() => {
                      handleDeleteEvent(event.id || '');
                      if (events.length === 1) { // Close drawer if last event is deleted
                        toggleEventsDrawer();
                      }
                    }}
                    className="text-red-500"
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </Drawer>

        <ToastContainer />
      </main>
    </div>
  );
};

export default CalendarPage;
