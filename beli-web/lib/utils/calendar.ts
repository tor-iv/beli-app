import type { Restaurant, User } from '@/types';

/**
 * Format date for ICS file (YYYYMMDDTHHMMSSZ)
 */
function formatICS(date: Date): string {
  return `${date.toISOString().replace(/[-:]/g, '').split('.')[0]  }Z`;
}

/**
 * Add hours to a date
 */
function addHours(date: Date, hours: number): Date {
  const newDate = new Date(date);
  newDate.setHours(newDate.getHours() + hours);
  return newDate;
}

/**
 * Create and download an ICS calendar event file
 */
export function createCalendarEvent(
  restaurant: Restaurant,
  participants: User[],
  dateTime: Date = new Date()
): void {
  const participantNames = participants.map((p) => p.displayName).join(', ');
  const description =
    participants.length > 0 ? `Dining with ${participantNames}` : `Dinner at ${restaurant.name}`;

  // Create ICS content
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Beli//Group Dinner//EN
BEGIN:VEVENT
UID:${Date.now()}@beli.app
DTSTAMP:${formatICS(new Date())}
DTSTART:${formatICS(dateTime)}
DTEND:${formatICS(addHours(dateTime, 2))}
SUMMARY:Dinner at ${restaurant.name}
LOCATION:${restaurant.location.address}
DESCRIPTION:${description}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  // Create blob and download
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `dinner-${restaurant.name.toLowerCase().replace(/\s+/g, '-')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
