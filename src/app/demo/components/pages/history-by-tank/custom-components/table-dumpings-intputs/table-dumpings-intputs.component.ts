import { Component, Input } from '@angular/core';
import * as Utility from '../../../../../utilities/utility';

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
