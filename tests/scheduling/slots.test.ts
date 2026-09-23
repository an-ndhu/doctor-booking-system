import { DateTime } from 'luxon';
import { generateSlots, filterBusySlots, rangesOverlap } from '../../src/modules/scheduling/slot-engine';

describe('slot generation', () => {
  test('generates 30-minute slots from working hours', () => {
    const slots = generateSlots({
      date: '2026-09-25',
      timezone: 'Asia/Kolkata',
      intervals: [{ start: '09:00:00', end: '12:00:00' }],
      durationMinutes: 30,
      now: DateTime.fromISO('2026-09-01T00:00:00.000Z'),
    });

    expect(slots.map((slot) => slot.startAt)).toEqual([
      '2026-09-25T03:30:00.000Z',
      '2026-09-25T04:00:00.000Z',
      '2026-09-25T04:30:00.000Z',
      '2026-09-25T05:00:00.000Z',
      '2026-09-25T05:30:00.000Z',
      '2026-09-25T06:00:00.000Z',
    ]);
  });

  test('interprets the same wall clock in America/New_York as a different instant', () => {
    const slots = generateSlots({
      date: '2026-09-25',
      timezone: 'America/New_York',
      intervals: [{ start: '09:00:00', end: '09:30:00' }],
      durationMinutes: 30,
      now: DateTime.fromISO('2026-09-01T00:00:00.000Z'),
    });

    expect(slots).toHaveLength(1);
    expect(slots[0].startAt).toBe('2026-09-25T13:00:00.000Z');
  });

  test('keeps local 09:00 after a DST spring-forward in America/New_York', () => {
    const before = generateSlots({
      date: '2026-03-07',
      timezone: 'America/New_York',
      intervals: [{ start: '09:00:00', end: '09:30:00' }],
      durationMinutes: 30,
      now: DateTime.fromISO('2026-01-01T00:00:00.000Z'),
    });
    const after = generateSlots({
      date: '2026-03-08',
      timezone: 'America/New_York',
      intervals: [{ start: '09:00:00', end: '09:30:00' }],
      durationMinutes: 30,
      now: DateTime.fromISO('2026-01-01T00:00:00.000Z'),
    });

    expect(before[0].startAt).toBe('2026-03-07T14:00:00.000Z');
    expect(after[0].startAt).toBe('2026-03-08T13:00:00.000Z');
  });

  test('handles day boundary by converting local midnight independently of server TZ', () => {
    const slots = generateSlots({
      date: '2026-09-25',
      timezone: 'Asia/Kolkata',
      intervals: [{ start: '00:00:00', end: '00:30:00' }],
      durationMinutes: 30,
      now: DateTime.fromISO('2026-09-01T00:00:00.000Z'),
    });

    expect(slots[0].startAt).toBe('2026-09-24T18:30:00.000Z');
  });

  test('excludes overlapping busy ranges', () => {
    const slots = generateSlots({
      date: '2026-09-25',
      timezone: 'Asia/Kolkata',
      intervals: [{ start: '09:00:00', end: '11:00:00' }],
      durationMinutes: 30,
      now: DateTime.fromISO('2026-09-01T00:00:00.000Z'),
    });
    const busyStart = DateTime.fromISO('2026-09-25T04:30:00.000Z').toMillis();
    const filtered = filterBusySlots(slots, [
      { startMs: busyStart, endMs: busyStart + 30 * 60 * 1000 },
    ]);

    expect(filtered.map((slot) => slot.startAt)).toEqual([
      '2026-09-25T03:30:00.000Z',
      '2026-09-25T04:00:00.000Z',
      '2026-09-25T05:00:00.000Z',
    ]);
  });

  test('adjacent ranges do not overlap', () => {
    expect(rangesOverlap(0, 30, 30, 60)).toBe(false);
    expect(rangesOverlap(0, 30, 15, 45)).toBe(true);
  });
});
