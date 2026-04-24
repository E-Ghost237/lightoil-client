import * as moment from "moment";

const browserLocale =
    typeof navigator !== 'undefined' && navigator.languages && navigator.languages.length
        ? navigator.languages[0]
        : typeof navigator !== 'undefined'
          ? navigator.language
          : 'en';

function parseDateTime(dateString: string) {
    const zonedDate = moment.parseZone(dateString, moment.ISO_8601, true);
    if (zonedDate.isValid()) {
        return zonedDate;
    }

    const fallback = moment.parseZone(dateString);
    return fallback.isValid() ? fallback : null;
}

function formatDateTimeSource(dateString: string, format: string): string {
    if (!dateString) {
        return '';
    }

    const parsed = parseDateTime(dateString);
    if (!parsed) {
        return '';
    }

    return parsed.locale(browserLocale).format(format);
}

export function toUTC(dateTimeString:string) {
    return moment(dateTimeString).utc().format('YYYY-MM-DD HH:mm:ss');
}

export function toLocalDateTime(dateString: string) {
    return formatDateTimeSource(dateString, 'l LT');
}

export function toLocalTime(dateString: string) {
    return formatDateTimeSource(dateString, 'LT');
}

export function toLocalDate(dateString: string) {
    return formatDateTimeSource(dateString, 'l');
}
