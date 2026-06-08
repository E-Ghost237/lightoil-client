export const DEFAULT_TANK_TIMEZONE = 'Africa/Douala';

export function parseTankMetric(value: any): number | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
}

export function roundTankMetric(value: number): number {
    return Math.round(value * 100) / 100;
}

export function getTankFuelVolume(record: any): number | null {
    return parseTankMetric(record?.fuel_volume ?? record?.volume);
}

function getRawTankTimestamp(value: any): string | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) {
            return null;
        }

        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');
        const hours = String(value.getHours()).padStart(2, '0');
        const minutes = String(value.getMinutes()).padStart(2, '0');
        const seconds = String(value.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    const timestamp = String(value).trim();
    return timestamp.length > 0 ? timestamp : null;
}

function getRawTankDateKey(value: any): string | null {
    const timestamp = getRawTankTimestamp(value);
    const match = timestamp?.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}

function getRawTankMoment(value: any): number {
    const timestamp = getRawTankTimestamp(value);
    if (!timestamp) {
        return 0;
    }

    const normalized = timestamp.includes('T') ? timestamp : timestamp.replace(' ', 'T');
    const parsed = new Date(normalized).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
}

export function getTankRecordMoment(record: any): number {
    const updatedAt = getRawTankMoment(record?.updated_at);
    if (updatedAt > 0) {
        return updatedAt;
    }

    return getRawTankMoment(record?.created_at);
}

export function sortTankRecordsByMoment(records: any[] = []): any[] {
    return [...records].sort((a, b) => getTankRecordMoment(b) - getTankRecordMoment(a));
}

export function getTankLocalDateKey(date: Date = new Date(), timezone: string = DEFAULT_TANK_TIMEZONE): string {
    try {
        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).formatToParts(date);

        const year = parts.find((part) => part.type === 'year')?.value;
        const month = parts.find((part) => part.type === 'month')?.value;
        const day = parts.find((part) => part.type === 'day')?.value;
        if (year && month && day) {
            return `${year}-${month}-${day}`;
        }
    } catch {
        // Fallback to local timezone if Intl timezone formatting fails.
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getTankRecordDateKey(record: any, timezone: string = DEFAULT_TANK_TIMEZONE): string | null {
    const rawDateKey = getRawTankDateKey(record?.updated_at ?? record?.created_at ?? null);
    if (rawDateKey) {
        return rawDateKey;
    }

    const candidate = record?.updated_at ?? record?.created_at ?? null;
    if (!candidate) {
        return null;
    }

    const timestamp = new Date(candidate);
    if (Number.isNaN(timestamp.getTime())) {
        return null;
    }

    return getTankLocalDateKey(timestamp, timezone);
}

export function getStrictTankDayRecords(records: any[], dayKey: string, timezone: string = DEFAULT_TANK_TIMEZONE): any[] {
    const source = Array.isArray(records) ? records : [];
    return source
        .filter((record: any) => getTankRecordDateKey(record, timezone) === dayKey)
        .sort((a: any, b: any) => getTankRecordMoment(b) - getTankRecordMoment(a));
}

export function getTankRowDropVolume(currentRecord: any, previousRecord: any): number {
    const currentVolume = getTankFuelVolume(currentRecord);
    const previousVolume = getTankFuelVolume(previousRecord);

    if (currentVolume === null || previousVolume === null || currentVolume > previousVolume) {
        return 0;
    }

    return roundTankMetric(previousVolume - currentVolume);
}

export function buildTankOutputVolumeRows(records: any[]): Array<{ id: any; volume: number }> {
    const sorted = sortTankRecordsByMoment(Array.isArray(records) ? records : []);
    const outputVolumes: Array<{ id: any; volume: number }> = [];

    if (sorted.length < 2) {
        return outputVolumes;
    }

    for (let i = 0; i < sorted.length - 1; i++) {
        outputVolumes.push({
            id: sorted[i]?.id,
            volume: getTankRowDropVolume(sorted[i], sorted[i + 1])
        });
    }

    return outputVolumes;
}

export function computeTankOutputSumFromRecords(records: any[]): number {
    const sorted = sortTankRecordsByMoment(Array.isArray(records) ? records : []);

    if (sorted.length < 2) {
        return 0;
    }

    let total = 0;

    for (let i = 0; i < sorted.length - 1; i++) {
        total += getTankRowDropVolume(sorted[i], sorted[i + 1]);
    }

    return roundTankMetric(total);
}
