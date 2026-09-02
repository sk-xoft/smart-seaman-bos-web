const BANGKOK_TIME_ZONE = 'Asia/Bangkok';
const THAI_LOCALE = 'th-TH-u-ca-buddhist-nu-latn';

function createWallClockDate(year, month, day, hours = 0, minutes = 0, seconds = 0) {
    const gregorianYear = Number(year) > 2400 ? Number(year) - 543 : Number(year);
    return new Date(Date.UTC(
        gregorianYear,
        Number(month) - 1,
        Number(day),
        Number(hours),
        Number(minutes),
        Number(seconds),
    ));
}

function parseDateValue(value) {
    if (!value) return null;
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : { date: value, timeZone: BANGKOK_TIME_ZONE, hasTime: true };
    }

    if (typeof value === 'string') {
        const normalized = value.trim();
        const yearFirstMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?)?$/);
        if (yearFirstMatch) {
            const [, year, month, day, hours, minutes, seconds] = yearFirstMatch;
            return {
                date: createWallClockDate(year, month, day, hours, minutes, seconds),
                timeZone: 'UTC',
                hasTime: hours != null,
            };
        }

        const dayFirstMatch = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
        if (dayFirstMatch) {
            const [, day, month, year, hours, minutes, seconds] = dayFirstMatch;
            return {
                date: createWallClockDate(year, month, day, hours, minutes, seconds),
                timeZone: 'UTC',
                hasTime: hours != null,
            };
        }
    }

    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime())
        ? null
        : { date: parsedDate, timeZone: BANGKOK_TIME_ZONE, hasTime: true };
}

function formatDatePart(date, timeZone) {
    return new Intl.DateTimeFormat(THAI_LOCALE, {
        timeZone,
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

export function formatThaiDate(value) {
    const parsed = parseDateValue(value);
    return parsed ? formatDatePart(parsed.date, parsed.timeZone) : (value || '-');
}

export function formatThaiDateTime(value) {
    const parsed = parseDateValue(value);
    if (!parsed) return value || '-';

    const dateText = formatDatePart(parsed.date, parsed.timeZone);
    if (!parsed.hasTime) return dateText;

    const timeText = new Intl.DateTimeFormat(THAI_LOCALE, {
        timeZone: parsed.timeZone,
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    }).format(parsed.date);
    return `${dateText} ${timeText} น.`;
}