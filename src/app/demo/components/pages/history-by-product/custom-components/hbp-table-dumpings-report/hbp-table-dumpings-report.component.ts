import { Component, Input } from '@angular/core';
import * as Utility from '../../../../../utilities/utility';

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

    getToLocalDateTime(date1: string) {
        return Utility.toLocalDateTime(date1) ?? '';
    }

    getToLocalDate(date1: string) {
        return Utility.toLocalDate(date1) ?? '';
    }

    getToLocalTime(date1: string) {
        return Utility.toLocalTime(date1) ?? '';
    }

    getRoundValue(num: number) {
        return Math.round(num * 100) / 100;
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
        const volume = this.getRoundValue(
            report?.firstPeriodRecord?.volume ?? 0
        );
        const input = this.getRoundValue(report?.input ?? 0);
        const output = this.getRoundValue(report?.output ?? 0);
        const result = volume + input - output;
        return this.getRoundValue(result);
    }

    getEcart(report: any): number {
        const stockTheorique = this.getstockTherorique(report) ?? 0;
        const stockPhysique = this.getstockPhysique(report) ?? 0; // ou autre champ
        return stockPhysique - stockTheorique;
    }

    prepareListDayRecord(): void {
        if (!this.listReport?.listDayRecord) return;

        let cumulVentes = 0;
        let cumulEcarts = 0;

        const newList = this.listReport.listDayRecord.map((record) => {
            const output = Number(record.output ?? 0);

            cumulVentes += output;
            const ecart = this.getEcart(record);

            cumulEcarts += ecart;

            return {
                ...record,
                cumulVentes: Number(cumulVentes),
                ecart: Number(ecart),
                cumulEcarts: Number(cumulEcarts),
            };
        });

        this.listReport.listDayRecord = [...newList];
    }
}
