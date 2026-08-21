export const ETHIOPIAN_MONTHS = [
  "Meskerem",
  "Tikimt",
  "Hidar",
  "Tahsas",
  "Tir",
  "Yekatit",
  "Megabit",
  "Miazia",
  "Ginbot",
  "Sene",
  "Hamle",
  "Nehase",
  "Pagumen",
] as const;

export interface EthiopianDate {
  day: number;
  month: number;
  year: number;
}

const ETHIOPIAN_EPOCH_JDN = 1_724_221;

export function daysInEthiopianMonth(year: number, month: number) {
  if (month >= 1 && month <= 12) return 30;
  if (month === 13) return year % 4 === 3 ? 6 : 5;
  throw new RangeError("Ethiopian month must be between 1 and 13.");
}

export function formatEthiopianDate({ day, month, year }: EthiopianDate) {
  assertValidEthiopianDate(year, month, day);
  return `${String(day).padStart(2, "0")}-${ETHIOPIAN_MONTHS[month - 1]}-${year}`;
}

export function parseEthiopianDate(value: string): EthiopianDate | null {
  const match = /^(\d{1,2})-([A-Za-z]+)-(\d{1,4})$/.exec(value.trim());
  if (!match) return null;

  const month = ETHIOPIAN_MONTHS.findIndex(
    (name) => name.toLowerCase() === match[2].toLowerCase(),
  );
  if (month === -1) return null;

  const parsed = {
    day: Number(match[1]),
    month: month + 1,
    year: Number(match[3]),
  };

  try {
    assertValidEthiopianDate(parsed.year, parsed.month, parsed.day);
    return parsed;
  } catch {
    return null;
  }
}

export function ethiopianToGregorian(year: number, month: number, day: number) {
  assertValidEthiopianDate(year, month, day);
  return jdnToGregorian(ethiopianToJdn(year, month, day));
}

export function gregorianToEthiopian(isoDate: string): EthiopianDate | null {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!parts) return null;

  const year = Number(parts[1]);
  const month = Number(parts[2]);
  const day = Number(parts[3]);
  const check = new Date(Date.UTC(year, month - 1, day));

  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }

  return jdnToEthiopian(gregorianToJdn(year, month, day));
}

export function ethiopianWeekday(year: number, month: number, day = 1) {
  const isoDate = ethiopianToGregorian(year, month, day);
  return new Date(`${isoDate}T00:00:00Z`).getUTCDay();
}

function assertValidEthiopianDate(year: number, month: number, day: number) {
  if (!Number.isInteger(year) || year < 1) {
    throw new RangeError("Ethiopian year must be a positive integer.");
  }
  if (!Number.isInteger(month) || month < 1 || month > 13) {
    throw new RangeError("Ethiopian month must be between 1 and 13.");
  }
  const maximumDay = daysInEthiopianMonth(year, month);
  if (!Number.isInteger(day) || day < 1 || day > maximumDay) {
    throw new RangeError(`Day must be between 1 and ${maximumDay}.`);
  }
}

function ethiopianToJdn(year: number, month: number, day: number) {
  return (
    ETHIOPIAN_EPOCH_JDN +
    365 * (year - 1) +
    Math.floor(year / 4) +
    30 * (month - 1) +
    day -
    1
  );
}

function gregorianToJdn(year: number, month: number, day: number) {
  const a = Math.floor((14 - month) / 12);
  const adjustedYear = year + 4800 - a;
  const adjustedMonth = month + 12 * a - 3;

  return (
    day +
    Math.floor((153 * adjustedMonth + 2) / 5) +
    365 * adjustedYear +
    Math.floor(adjustedYear / 4) -
    Math.floor(adjustedYear / 100) +
    Math.floor(adjustedYear / 400) -
    32045
  );
}

function jdnToGregorian(jdn: number) {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);

  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function jdnToEthiopian(jdn: number): EthiopianDate {
  const daysSinceEpoch = jdn - ETHIOPIAN_EPOCH_JDN;
  const cycle = Math.floor(daysSinceEpoch / 1461);
  const dayInCycle = positiveModulo(daysSinceEpoch, 1461);

  let yearInCycle: number;
  let daysBeforeYear: number;

  if (dayInCycle < 365) {
    yearInCycle = 0;
    daysBeforeYear = 0;
  } else if (dayInCycle < 730) {
    yearInCycle = 1;
    daysBeforeYear = 365;
  } else if (dayInCycle < 1096) {
    yearInCycle = 2;
    daysBeforeYear = 730;
  } else {
    yearInCycle = 3;
    daysBeforeYear = 1096;
  }

  const year = cycle * 4 + yearInCycle + 1;
  const dayOfYear = dayInCycle - daysBeforeYear;

  return {
    day: (dayOfYear % 30) + 1,
    month: Math.floor(dayOfYear / 30) + 1,
    year,
  };
}

function positiveModulo(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}
