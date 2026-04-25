import { Component, Input } from '@angular/core';
import * as Utility from 'src/app/demo/utilities/utility';

@Component({
  selector: 'app-hbp-table-dumpings-input',
  templateUrl: './hbp-table-dumpings-input.component.html',
  styleUrls: ['./hbp-table-dumpings-input.component.scss']
})
export class HbpTableDumpingsInputComponent {
  @Input()
  listInputs!:any;

  @Input()
  stationProduct:any={};

  @Input()
  period:string="";


  constructor(){

  }

  ngOnInit(){
      //;
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
      const startDate = this.formatDateValue(this.listInputs?.dateStart ?? this.listInputs?.dateStartLabel);
      const endDate = this.formatDateValue(this.listInputs?.dateEnd ?? this.listInputs?.dateEndLabel);
      const startTime = this.formatTimeValue(this.listInputs?.timeStart ?? this.listInputs?.timeStartLabel);
      const endTime = this.formatTimeValue(this.listInputs?.timeClose ?? this.listInputs?.timeCloseLabel);

      if (startDate !== '-' && endDate !== '-') {
          return `Du ${startDate} au ${endDate} entre ${startTime} et ${endTime}`;
      }

      const explicit = this.normalizeLabel(this.listInputs?.periodLabel, '');
      return explicit !== '' ? explicit : '-';
  }

  getInputDateLabel(income: any): string {
      return this.formatDateValue(
          income?.takedDay ?? income?.start ?? income?.date ?? income?.dateLabel ?? income?.startDateLabel
      );
  }

  getInputTimeRangeLabel(income: any): string {
      const explicit = this.normalizeLabel(income?.timeRangeLabel, '');
      if (explicit !== '') {
          return explicit;
      }

      const startTime = this.formatTimeValue(income?.start ?? income?.startTimeLabel);
      const endTime = this.formatTimeValue(income?.end ?? income?.endTimeLabel);

      if (startTime === '-' || endTime === '-') {
          return '-';
      }

      return `de ${startTime} à ${endTime}`;
  }

  getRoundValue(num:number){
      return Math.round(num*100)/100;
  }
}
