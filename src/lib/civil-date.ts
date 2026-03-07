export interface CivilDateParts {
  year: number;
  month: number;
  day: number;
}

export interface CivilTimeParts {
  hour: number;
  minute: number;
  second?: number;
}

const CIVIL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;
const CIVIL_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;

function isValidDateParts(parts: CivilDateParts): boolean {
  const probe = new Date(parts.year, parts.month - 1, parts.day, 12, 0, 0, 0);
  return (
    probe.getFullYear() === parts.year &&
    probe.getMonth() === parts.month - 1 &&
    probe.getDate() === parts.day
  );
}

export function extractCivilDateString(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const match = CIVIL_DATE_PATTERN.exec(value.trim());
  if (!match) return null;

  const candidate = `${match[1]}-${match[2]}-${match[3]}`;
  const parts = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
  return isValidDateParts(parts) ? candidate : null;
}

export function parseCivilDateParts(value: string | null | undefined): CivilDateParts | null {
  const match = extractCivilDateString(value);
  if (!match) return null;

  const [year, month, day] = match.split("-").map(Number);
  const parts = { year, month, day };
  return isValidDateParts(parts) ? parts : null;
}

export function parseCivilTimeParts(value: string | null | undefined): CivilTimeParts | null {
  if (typeof value !== "string") return null;
  const match = CIVIL_TIME_PATTERN.exec(value.trim());
  if (!match) return null;

  return {
    hour: Number(match[1]),
    minute: Number(match[2]),
    second: match[3] ? Number(match[3]) : 0,
  };
}

export function buildLocalCivilDate(
  date: CivilDateParts,
  time: CivilTimeParts = { hour: 12, minute: 0, second: 0 },
): Date {
  return new Date(
    date.year,
    date.month - 1,
    date.day,
    time.hour,
    time.minute,
    time.second ?? 0,
    0,
  );
}

export function parseCivilDate(
  value: string | Date | null | undefined,
  options?: {
    time?: string | CivilTimeParts | null;
    fallbackTime?: CivilTimeParts;
  },
): Date | null {
  const fallbackTime = options?.fallbackTime ?? { hour: 12, minute: 0, second: 0 };
  const explicitTime =
    typeof options?.time === "string"
      ? parseCivilTimeParts(options.time)
      : options?.time ?? null;
  const time = explicitTime ?? fallbackTime;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return buildLocalCivilDate(
      {
        year: value.getFullYear(),
        month: value.getMonth() + 1,
        day: value.getDate(),
      },
      time,
    );
  }

  const parts = parseCivilDateParts(value);
  if (!parts) return null;
  return buildLocalCivilDate(parts, time);
}

export function formatCivilDate(value: Date | string | null | undefined): string | null {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return extractCivilDateString(value);
}

export function formatClockTime(value: Date | string | null | undefined): string | null {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;
  }

  const timeParts = parseCivilTimeParts(value);
  if (!timeParts) return null;
  return `${String(timeParts.hour).padStart(2, "0")}:${String(timeParts.minute).padStart(2, "0")}`;
}

export function isFutureCivilDate(value: Date, today: Date = new Date()): boolean {
  const current = Number(
    `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`,
  );
  const target = Number(
    `${value.getFullYear()}${String(value.getMonth() + 1).padStart(2, "0")}${String(value.getDate()).padStart(2, "0")}`,
  );
  return target > current;
}

export function getCurrentCivilDateInTimeZone(timeZone: string, now: Date = new Date()): Date {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = formatter.formatToParts(now);
    const year = Number(parts.find((part) => part.type === "year")?.value);
    const month = Number(parts.find((part) => part.type === "month")?.value);
    const day = Number(parts.find((part) => part.type === "day")?.value);
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
    }
    return new Date(year, month - 1, day, 12, 0, 0, 0);
  } catch {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
  }
}
