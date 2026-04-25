import * as moment from "moment";

function parseDateTime(dateValue: any) {
    if (dateValue === null || dateValue === undefined || dateValue === '') {
        return null;
    }

    if (moment.isMoment(dateValue)) {
        return dateValue.isValid() ? dateValue.clone() : null;
    }

    if (dateValue instanceof Date) {
        const fromDate = moment(dateValue);
        return fromDate.isValid() ? fromDate : null;
    }

    const dateString = String(dateValue).trim();
    if (!dateString) {
        return null;
    }

    const zonedDate = moment.parseZone(dateString, moment.ISO_8601, true);
    if (zonedDate.isValid()) {
        return zonedDate;
    }

    const knownFormats = [
        'DD/MM/YYYY',
        'D/M/YYYY',
        'MM/DD/YYYY',
        'M/D/YYYY',
        'DD/MM/YYYY HH:mm:ss',
        'DD/MM/YYYY HH:mm',
        'MM/DD/YYYY HH:mm:ss',
        'MM/DD/YYYY HH:mm',
        'YYYY-MM-DD',
        'YYYY-MM-DD HH:mm:ss',
        'YYYY-MM-DD HH:mm'
    ];

    const parsedKnown = moment(dateString, knownFormats, true);
    if (parsedKnown.isValid()) {
        return parsedKnown;
    }

    const fallback = moment.parseZone(dateString);
    return fallback.isValid() ? fallback : null;
}

function formatDateTimeSource(dateValue: any, format: string): string {
    if (dateValue === null || dateValue === undefined || dateValue === '') {
        return '';
    }

    const parsed = parseDateTime(dateValue);
    if (!parsed) {
        return '';
    }

    return parsed.locale('fr').format(format);
}

export function toUTC(dateTimeString:string) {
    return moment(dateTimeString).utc().format('YYYY-MM-DD HH:mm:ss');
}

export function toLocalDateTime(dateValue: any) {
    return formatDateTimeSource(dateValue, 'DD/MM/YYYY HH:mm:ss');
}

export function toLocalTime(dateValue: any) {
    return formatDateTimeSource(dateValue, 'HH:mm');
}

export function toLocalDate(dateValue: any) {
    return formatDateTimeSource(dateValue, 'DD/MM/YYYY');
}

export function normalizeDateTokens(text: string): string {
    if (!text) {
        return '';
    }

    let normalized = String(text);
    const dateTokenRegex = /\b(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})\b/g;
    normalized = normalized.replace(dateTokenRegex, (token) => toLocalDate(token) || token);

    return normalized;
}
