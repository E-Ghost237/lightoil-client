import * as moment from "moment";

const timedifference = new Date().getTimezoneOffset();
const locale = navigator.languages && navigator.languages.length ? navigator.languages[0] : navigator.language;

function parseDateTime(dateString: string) {
    const zonedDate = moment.parseZone(dateString, moment.ISO_8601, true);
    return zonedDate.isValid() ? zonedDate : moment(dateString);
}

export function toUTC(dateTimeString:string) {
    return moment(dateTimeString).utc().format('YYYY-MM-DD HH:mm:ss');
}

export function toLocalDateTime(dateString: string) {
    const dateTime = parseDateTime(dateString).toDate();
    return dateTime.toLocaleDateString() + ' ' + dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function toLocalTime(dateString: string) {
    const dateTime = parseDateTime(dateString).toDate();
    return dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function toLocalDate(dateString: string) {
    const dateTime = parseDateTime(dateString).toDate();
    return dateTime.toLocaleDateString();
}
