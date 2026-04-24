import { Component, Input } from '@angular/core';

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

  getRoundValue(num:number){
      return Math.round(num*100)/100;
  }
}
