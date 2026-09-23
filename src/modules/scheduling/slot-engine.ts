import { DateTime } from 'luxon';
import { combineLocalDateAndTime } from '../../shared/utils/timezone';

export interface TimeInterval {
  start: string;
  end: string;
}

export interface GeneratedSlot {
  startAt: string;
  endAt: string;
  startMs: number;
  endMs: number;
}

export interface BusyRange {
  startMs: number;
  endMs: number;
}

export function normalizeTime(value: string | Date): string {
  if (value instanceof Date) {
    return DateTime.fromJSDate(value, { zone: 'utc' }).toFormat('HH:mm:ss');
  }
  const text = String(value);
  if (/^\d{2}:\d{2}$/.test(text)) {
    return `${text}:00`;
  }
  return text.slice(0, 8);
}

export function intervalsOverlap(intervals: TimeInterval[]): boolean {
  const sorted = [...intervals].sort((a, b) => a.start.localeCompare(b.start));
  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i].start < sorted[i - 1].end) {
      return true;
    }
  }
  return false;
}

export function rangesOverlap(startA: number, endA: number, startB: number, endB: number): boolean {
  return startA < endB && startB < endA;
}

export function generateSlots({
  date,
  timezone,
  intervals,
  durationMinutes,
  now = DateTime.utc(),
}: {
  date: string;
  timezone: string;
  intervals: TimeInterval[];
  durationMinutes: number;
  now?: DateTime;
}): GeneratedSlot[] {
  const slots: GeneratedSlot[] = [];
  intervals.forEach((interval) => {
    let cursor = combineLocalDateAndTime(date, interval.start, timezone);
    const intervalEnd = combineLocalDateAndTime(date, interval.end, timezone);
    if (!cursor.isValid || !intervalEnd.isValid) {
      return;
    }
    while (cursor.plus({ minutes: durationMinutes }) <= intervalEnd) {
      const slotEnd = cursor.plus({ minutes: durationMinutes });
      if (cursor.toUTC() >= now) {
        slots.push({
          startAt: cursor.toUTC().toISO() ?? '',
          endAt: slotEnd.toUTC().toISO() ?? '',
          startMs: cursor.toUTC().toMillis(),
          endMs: slotEnd.toUTC().toMillis(),
        });
      }
      cursor = slotEnd;
    }
  });
  return slots;
}

export function filterBusySlots(slots: GeneratedSlot[], busyRanges: BusyRange[]): GeneratedSlot[] {
  return slots.filter(
    (slot) => !busyRanges.some((range) => rangesOverlap(slot.startMs, slot.endMs, range.startMs, range.endMs))
  );
}

export function toBusyRange(
  record: Record<string, unknown>,
  startKey: string,
  endKey: string
): BusyRange {
  return {
    startMs: new Date(record[startKey] as Date | string).getTime(),
    endMs: new Date(record[endKey] as Date | string).getTime(),
  };
}
