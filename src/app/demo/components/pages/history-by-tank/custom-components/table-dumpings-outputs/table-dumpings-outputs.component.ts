import { Component, Input } from '@angular/core';
import * as Utility from 'src/app/demo/utilities/utility';

@Component({
  selector: 'app-table-dumpings-outputs',
  templateUrl: './table-dumpings-outputs.component.html',
  styleUrls: ['./table-dumpings-outputs.component.scss']
})
export class TableDumpingsOutputsComponent {


    @Input()
    listOutputs!:any;

    @Input()
    tank:any={};

    @Input()
    period:string="";

    @Input()
    timezone: string | null = null;


    constructor(){

    }

    ngOnInit(){
        //;
    }

    private parseNumericValue(value: any): number | null {
        if (value === null || value === undefined || value === '') {
            return null;
        }

        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
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

    private formatNumericValue(value: any): string {
        const parsed = this.parseNumericValue(value);
        if (parsed === null) {
            return '-';
        }

        return String(this.getRoundValue(parsed));
    }

    private getFuelVolume(record: any): number | null {
        const normalized = this.parseNumericValue(record?.fuel_volume);
        if (normalized !== null) {
            return normalized;
        }

        return this.parseNumericValue(record?.volume);
    }

    getOutputRows(): any[] {
        if (Array.isArray(this.listOutputs?.listDayRecord)) {
            return this.listOutputs.listDayRecord.filter((row: any) => !row?.isTheLast);
        }

        if (Array.isArray(this.listOutputs?.periodRecord)) {
            return this.listOutputs.periodRecord.filter((row: any) => !row?.isTheLast);
        }

        return [];
    }

    getSummaryRow(): any | null {
        const rows = Array.isArray(this.listOutputs?.listDayRecord)
            ? this.listOutputs.listDayRecord
            : Array.isArray(this.listOutputs?.periodRecord)
              ? this.listOutputs.periodRecord
              : [];
        return rows.find((row: any) => row?.isTheLast) ?? null;
    }

    getRoundValue(num:number){
        return Math.round(num*100)/100;
    }

    getPeriodLabel(): string {
        const startDate = this.formatDateValue(this.listOutputs?.dateStart ?? this.listOutputs?.dateStartLabel);
        const endDate = this.formatDateValue(this.listOutputs?.dateEnd ?? this.listOutputs?.dateEndLabel);
        const startTime = this.formatTimeValue(this.listOutputs?.timeStart ?? this.listOutputs?.timeStartLabel);
        const endTime = this.formatTimeValue(this.listOutputs?.timeClose ?? this.listOutputs?.timeCloseLabel);

        if (startDate !== '-' && endDate !== '-') {
            return `Du ${startDate} au ${endDate} entre ${startTime} et ${endTime}`;
        }

        const explicit = this.normalizeLabel(this.listOutputs?.periodLabel, '');
        return explicit !== '' ? explicit : '-';
    }

    getRowDateLabel(output: any): string {
        return this.formatDateValue(
            output?.start ?? output?.date ?? output?.dateLabel ?? output?.startDateLabel
        );
    }

    getRowTimeRangeLabel(output: any): string {
        const explicit = this.normalizeLabel(output?.timeRangeLabel, '');
        if (explicit !== '') {
            return explicit;
        }

        const startTime = this.formatTimeValue(output?.start ?? output?.startTimeLabel);
        const endTime = this.formatTimeValue(output?.end ?? output?.endTimeLabel);

        if (startTime === '-' || endTime === '-') {
            return '-';
        }

        return `de ${startTime} à ${endTime}`;
    }

    getStartVolumeDisplay(output: any): string {
        return this.formatNumericValue(this.getFuelVolume(output?.firstPeriodRecord));
    }

    getStartTimeDisplay(output: any): string {
        return this.formatLabelValue(output?.firstPeriodRecord?.updated_at);
    }

    getStartTemperatureDisplay(output: any): string {
        return this.formatNumericValue(output?.firstPeriodRecord?.liquid_temperature);
    }

    getOutputQuantityDisplay(output: any): string {
        return this.formatNumericValue(output?.outputs ?? output?.output);
    }

    getEndVolumeDisplay(output: any): string {
        return this.formatNumericValue(this.getFuelVolume(output?.lastPeriodRecord));
    }

    getEndTimeDisplay(output: any): string {
        return this.formatLabelValue(output?.lastPeriodRecord?.updated_at);
    }

    getEndTemperatureDisplay(output: any): string {
        return this.formatNumericValue(output?.lastPeriodRecord?.liquid_temperature);
    }
}
