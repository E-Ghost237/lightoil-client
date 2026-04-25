import { Component, Input } from '@angular/core';
import * as Utility from 'src/app/demo/utilities/utility';

@Component({
    selector: 'app-hbp-table-dumpings-report',
    templateUrl: './hbp-table-dumpings-report.component.html',
    styleUrls: ['./hbp-table-dumpings-report.component.scss'],
})
export class HbpTableDumpingsReportComponent {
    @Input()
    listReport!: any;

    @Input()
    stationProduct: any = {};

    constructor() {}

    ngOnInit() {

    }

    ngOnChanges() {
        if (this.listReport?.listDayRecord) {
            this.prepareListDayRecord();
        }
    }

    private formatLabelValue(value: any, fallback = '-'): string {
        if (value === null || value === undefined) {
            return fallback;
        }

        const text = String(value).trim();
        return text !== '' ? text : fallback;
    }

    private normalizeLabel(value: any, fallback = '-'): string {
        const text = this.formatLabelValue(value, fallback);
        if (text === fallback) {
            return fallback;
        }

        return Utility.normalizeDateTokens(text);
    }

    private formatDateValue(value: any, fallback = '-'): string {
        if (value === null || value === undefined || value === '') {
            return fallback;
        }

        const formatted = Utility.toLocalDate(String(value));
        if (formatted) {
            return formatted;
        }

        return this.normalizeLabel(value, fallback);
    }

    private formatTimeValue(value: any, fallback = '-'): string {
        if (value === null || value === undefined || value === '') {
            return fallback;
        }

        const formatted = Utility.toLocalTime(String(value));
        if (formatted) {
            return formatted;
        }

        return this.normalizeLabel(value, fallback);
    }

    getPeriodLabel(): string {
        const startDate = this.formatDateValue(this.listReport?.dateStart ?? this.listReport?.dateStartLabel);
        const endDate = this.formatDateValue(this.listReport?.dateEnd ?? this.listReport?.dateEndLabel);
        const startTime = this.formatTimeValue(this.listReport?.timeStart ?? this.listReport?.timeStartLabel);
        const endTime = this.formatTimeValue(this.listReport?.timeClose ?? this.listReport?.timeCloseLabel);

        if (startDate !== '-' && endDate !== '-') {
            return `Du ${startDate} au ${endDate} entre ${startTime} et ${endTime}`;
        }

        const explicit = this.normalizeLabel(this.listReport?.periodLabel, '');
        return explicit !== '' ? explicit : '-';
    }

    getRowDateLabel(report: any): string {
        return this.formatDateValue(
            report?.start ?? report?.date ?? report?.dateLabel ?? report?.startDateLabel
        );
    }

    getRowTimeRangeLabel(report: any): string {
        const explicit = this.normalizeLabel(report?.timeRangeLabel, '');
        if (explicit !== '') {
            return explicit;
        }

        const startTime = this.formatTimeValue(report?.start ?? report?.startTimeLabel);
        const endTime = this.formatTimeValue(report?.end ?? report?.endTimeLabel);

        if (startTime === '-' || endTime === '-') {
            return '-';
        }

        return `de ${startTime} à ${endTime}`;
    }

    getRoundValue(num: number) {
        return Math.round(num * 100) / 100;
    }

    formatTwoDecimals(value: any): string {
        const parsed = this.parseMetric(value);
        if (parsed === null) {
            return '-';
        }

        return this.getRoundValue(parsed).toFixed(2);
    }

    private parseMetric(value: any): number | null {
        if (value === null || value === undefined || value === '') {
            return null;
        }

        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }

    getstockTherorique(report: any) {
        const volume = this.getRoundValue(
            report?.firstPeriodRecord?.volume ?? 0
        );
        const input = this.getRoundValue(report?.input ?? 0);
        const output = this.getRoundValue(report?.output ?? 0);
        const result = volume + input - output;
        return this.getRoundValue(result);
    }

    getstockPhysique(report: any) {
        const fuelVolume = this.parseMetric(report?.lastPeriodRecord?.fuel_volume);
        if (fuelVolume !== null) {
            return this.getRoundValue(fuelVolume);
        }

        const fallbackVolume = this.parseMetric(report?.lastPeriodRecord?.volume);
        if (fallbackVolume !== null) {
            return this.getRoundValue(fallbackVolume);
        }

        return 0;
    }

    getEcart(report: any): number {
        const stockTheorique = this.getstockTherorique(report) ?? 0;
        const stockPhysique = this.getstockPhysique(report) ?? 0;
        return stockPhysique - stockTheorique;
    }

    prepareListDayRecord(): void {
        if (!this.listReport?.listDayRecord) return;
        let cumulEcarts = 0;

        const newList = this.listReport.listDayRecord.map((record: any) => {
            const ecart = this.getEcart(record);

            cumulEcarts += ecart;

            return {
                ...record,
                ecart: Number(ecart),
                cumulEcarts: Number(cumulEcarts),
            };
        });

        this.listReport.listDayRecord = [...newList];
    }
}
