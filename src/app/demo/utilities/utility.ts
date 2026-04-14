import * as moment from "moment";

const timedifference = new Date().getTimezoneOffset();
const locale = navigator.languages && navigator.languages.length ? navigator.languages[0] : navigator.language;
const INCOMING_DATA_OFFSET_MS = 60 * 60 * 1000; // Remove +1h drift from incoming backend timestamps.

function parseDateTime(dateString: string) {
    const zonedDate = moment.parseZone(dateString, moment.ISO_8601, true);
    return zonedDate.isValid() ? zonedDate : moment(dateString);
}

function hasTimePart(dateString: string): boolean {
    if (!dateString) return false;
    return dateString.includes('T') || dateString.includes(':') || /^\d{4}-\d{2}-\d{2}\s+\d{2}/.test(dateString);
}

function getAdjustedDate(dateString: string, shiftWhenTimePresent = true): Date {
    const dateTime = parseDateTime(dateString).toDate();
    if (!shiftWhenTimePresent || !hasTimePart(dateString)) {
        return dateTime;
    }

    return new Date(dateTime.getTime() - INCOMING_DATA_OFFSET_MS);
}

export function toUTC(dateTimeString:string) {
    return moment(dateTimeString).utc().format('YYYY-MM-DD HH:mm:ss');
}

export function toLocalDateTime(dateString: string) {
    const dateTime = getAdjustedDate(dateString, true);
    return dateTime.toLocaleDateString() + ' ' + dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function toLocalTime(dateString: string) {
    const dateTime = getAdjustedDate(dateString, true);
    return dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function toLocalDate(dateString: string) {
    const dateTime = getAdjustedDate(dateString, true);
    return dateTime.toLocaleDateString();
}
