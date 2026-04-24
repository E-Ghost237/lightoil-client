import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-table-dumpings-report',
    templateUrl: './table-dumpings-report.component.html',
    styleUrls: ['./table-dumpings-report.component.scss'],
})
export class TableDumpingsReportComponent {

    @Input()
    listReport!: any;

    @Input()
    tank: any = {};

    constructor() {}

    ngOnInit() {
        this.prepareListDayRecord();
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

    getPeriodLabel(): string {
        const explicit = this.formatLabelValue(this.listReport?.periodLabel, '');
        if (explicit !== '') {
            return explicit;
        }

        const startDate = this.formatLabelValue(this.listReport?.dateStartLabel);
        const endDate = this.formatLabelValue(this.listReport?.dateEndLabel);
        const startTime = this.formatLabelValue(this.listReport?.timeStartLabel);
        const endTime = this.formatLabelValue(this.listReport?.timeCloseLabel);

        return `Du ${startDate} au ${endDate} entre ${startTime} et ${endTime}`;
    }

    getRowDateLabel(report: any): string {
        return this.formatLabelValue(report?.dateLabel ?? report?.startDateLabel ?? report?.start);
    }

    getRowTimeRangeLabel(report: any): string {
        const explicit = this.formatLabelValue(report?.timeRangeLabel, '');
        if (explicit !== '') {
            return explicit;
        }

        const startTime = this.formatLabelValue(report?.startTimeLabel);
        const endTime = this.formatLabelValue(report?.endTimeLabel);

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
