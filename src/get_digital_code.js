const ONE = 'one';
const ZERO = 'zero';
const MARKER = 'marker';

/**
 *
 * @param {Number} value
 * @returns {Array<string>}
 */
function encodeBinary(value, len) {
  const seq = new Array(len).fill(ZERO);

  // Encode binary left to right
  let v = value;
  let i = 0;
  while (v > 0) {
    seq[i] = v % 2 === 0 ? ZERO : ONE;
    i += 1;
    v = Math.floor(v / 2);
  }

  return seq;
}

function getDigitAtPlace(number, place) {
  if (place < 0) {
    throw new Error('Invalid place value. Place must be non-negative.');
  }

  const placeValue = 10 ** place;
  return Math.floor((number / placeValue) % 10);
}

function getUTCJulianDayOfYear(date) {
  // Calculate the UTC Julian day
  const utcDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const startOfYear = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const julianDay = Math.ceil((utcDate - startOfYear) / (1000 * 60 * 60 * 24)) + 1;

  return julianDay;
}

function findDate(year, month, dayOfWeek, weekOfMonth) {
  const firstOfMonth = new Date(
    Date.UTC(year, month, 1 + (weekOfMonth - 1) * 7),
  );
  const day = firstOfMonth.getUTCDay();
  const diff = (dayOfWeek + 7 - day) % 7;
  const start = firstOfMonth.getUTCDate() + diff;
  return new Date(Date.UTC(year, month, start));
}

// Current US DST rules are hardcoded here, as they are not expected to change often.

function getDstStartUtc(year) {
  const MONTH = 2;
  const DAY_OF_WEEK = 0; // Sunday
  const WEEK_OF_MONTH = 2; // Second Sunday
  return findDate(year, MONTH, DAY_OF_WEEK, WEEK_OF_MONTH);
}

function getDstEndUtc(year) {
  const MONTH = 10;
  const DAY_OF_WEEK = 0; // Sunday
  const WEEK_OF_MONTH = 1; // First Sunday
  return findDate(year, MONTH, DAY_OF_WEEK, WEEK_OF_MONTH);
}

function getDstBits(date) {
  const year = date.getUTCFullYear();
  const dst1Start = getDstStartUtc(year);
  const dst1End = getDstEndUtc(year);
  // Dst2 is 24 hours after dst1
  const dst2Start = new Date(dst1Start);
  dst2Start.setUTCHours(24);
  const dst2End = new Date(dst1End);
  dst2End.setUTCHours(24);

  return [
    date >= dst1Start && date < dst1End ? ONE : ZERO,
    date >= dst2Start && date < dst2End ? ONE : ZERO,
  ];
}

/**
 *
 * @param {Date} date
 * @returns {Array<string>}
 */
export default function getDigitalCode(date) {
  const year = date.getUTCFullYear();
  const minute = date.getUTCMinutes();
  const hour = date.getUTCHours();
  const dayOfYear = getUTCJulianDayOfYear(date);

  const [dst1, dst2] = getDstBits(date);

  return [
    // :01 - Unused
    ZERO,

    // :02 - DST1, DST at 00:00 UTC today
    dst1,

    // :03 - Leap second TODO
    ZERO,

    // :04 - :07 - Ones of year
    ...encodeBinary(getDigitAtPlace(year, 0), 4),

    // :08 - Unused
    ZERO,

    // :09
    MARKER,

    // :10 - :13 - Ones of minutes
    ...encodeBinary(getDigitAtPlace(minute, 0), 4),

    // :14
    ZERO,

    // :15 - :17 - Tens of minutes
    ...encodeBinary(getDigitAtPlace(minute, 1), 3),

    // :18
    ZERO,

    // :19
    MARKER,

    // :20 - :23 - Ones of hours
    ...encodeBinary(getDigitAtPlace(hour, 0), 4),

    // :24
    ZERO,

    // :25 - :26 - Tens of hours
    ...encodeBinary(getDigitAtPlace(hour, 1), 2),

    // :27 - :28 (UNUSED)
    ...new Array(2).fill(ZERO),

    // :29
    MARKER,

    // :30 - :33 - Ones of day of year
    ...encodeBinary(getDigitAtPlace(dayOfYear, 0), 4),

    // :34
    ZERO,

    // :35 - :38 - Tens of day of year
    ...encodeBinary(getDigitAtPlace(dayOfYear, 1), 4),

    // :39
    MARKER,

    // :40 - :41 - Hundreds of day of year
    ...encodeBinary(getDigitAtPlace(dayOfYear, 2), 2),

    // :42-48 (UNUSED)
    ...new Array(7).fill(ZERO),

    // :49
    MARKER,

    // :50 - DUT1 sign (TODO)
    ONE,

    // :51 - :54 - Tens digit of year
    ...encodeBinary(getDigitAtPlace(year, 1), 4),

    // :55 - DST2, DST at 24:00 UTC today
    dst2,

    // :56 - :58 DUT1 (TODO)
    ...new Array(3).fill(ZERO),

    // :59
    MARKER,
  ];
}
