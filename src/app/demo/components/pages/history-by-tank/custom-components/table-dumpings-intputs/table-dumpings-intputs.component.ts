import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-table-dumpings-intputs',
    templateUrl: './table-dumpings-intputs.component.html',
    styleUrls: ['./table-dumpings-intputs.component.scss'],
})
export class TableDumpingsIntputsComponent {
    @Input()
    listInputs!: any;

    @Input()
    tank: any = {};

    @Input()
    period: string = '';

    listrecords = []

    constructor() {}

    ngOnInit() {
        this.listrecords = this.listInputs?.periodInputs;
    }

    private formatLabelValue(value: any, fallback = '-'): string {
        if (value === null || value === undefined) {
            return fallback;
        }

        const text = String(value).trim();
        return text !== '' ? text : fallback;
    }

    getPeriodLabel(): string {
        const explicit = this.formatLabelValue(this.listInputs?.periodLabel, '');
        if (explicit !== '') {
            return explicit;
        }

        const startDate = this.formatLabelValue(this.listInputs?.dateStartLabel);
        const endDate = this.formatLabelValue(this.listInputs?.dateEndLabel);
        const startTime = this.formatLabelValue(this.listInputs?.timeStartLabel);
        const endTime = this.formatLabelValue(this.listInputs?.timeCloseLabel);

        return `Du ${startDate} au ${endDate} entre ${startTime} et ${endTime}`;
    }

    getInputDateLabel(income: any): string {
        return this.formatLabelValue(income?.dateLabel ?? income?.startDateLabel ?? income?.takedDay);
    }

    getInputTimeRangeLabel(income: any): string {
        const explicit = this.formatLabelValue(income?.timeRangeLabel, '');
        if (explicit !== '') {
            return explicit;
        }

        const startTime = this.formatLabelValue(income?.startTimeLabel);
        const endTime = this.formatLabelValue(income?.endTimeLabel);

        if (startTime === '-' || endTime === '-') {
            return '-';
        }

        return `de ${startTime} à ${endTime}`;
    }

    getRoundValue(num: number) {
        return Math.round(num * 100) / 100;
    }

    getDepotage(report: any) {
        const input = this.getRoundValue(report?.start_volume ?? 0);
        const output = this.getRoundValue(report?.end_volume ?? 0);
        const result = output - input;
        return this.getRoundValue(result > 0 ? result : 0);
    }

    getTotalDepotage(): number {
    if (!this.listrecords || !Array.isArray(this.listrecords)) {

        return 0;
    }

    const filtered = this.listrecords.filter((item) => !item?.isTheLast);


    const total = filtered.reduce((sum, item) => {
        const value = this.getDepotage(item);

        return sum + (isNaN(value) ? 0 : value);
    }, 0);


    return Math.round(total * 100) / 100;
}

}
