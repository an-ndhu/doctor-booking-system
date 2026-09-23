import { DateTime } from 'luxon';

export function isValidIanaTimezone(timezone: unknown): timezone is string {
  if (!timezone || typeof timezone !== 'string') {
    return false;
  }
  return DateTime.now().setZone(timezone).isValid;
}

export function parseClinicDate(dateString: string, timezone: string): DateTime {
  return DateTime.fromISO(dateString, { zone: timezone }).startOf('day');
}

export function combineLocalDateAndTime(
  dateString: string,
  timeString: string,
  timezone: string
): DateTime {
  const [hour, minute, second] = timeString.split(':').map(Number);
  return DateTime.fromISO(dateString, { zone: timezone }).set({
    hour,
    minute,
    second: second || 0,
    millisecond: 0,
  });
}

export function toIso(dateTimeOrJsDate: Date | DateTime): string {
  if (dateTimeOrJsDate instanceof Date) {
    return dateTimeOrJsDate.toISOString();
  }
  return dateTimeOrJsDate.toUTC().toISO() ?? dateTimeOrJsDate.toUTC().toISO()!;
}

export function formatTimeFromDate(jsDate: Date, timezone: string): string {
  return DateTime.fromJSDate(jsDate, { zone: 'utc' }).setZone(timezone).toFormat('HH:mm:ss');
}

export function weekdayInTimezone(dateString: string, timezone: string): number {
  return parseClinicDate(dateString, timezone).weekday % 7;
}
