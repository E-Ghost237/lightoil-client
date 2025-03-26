import { Component, Input } from '@angular/core';
import * as Utility from '../../../../../utilities/utility';

@Component({
  selector: 'app-flow-meter-table',
  templateUrl: './flow-meter-table.component.html',
  styleUrls: ['./flow-meter-table.component.scss']
})
export class FlowMeterTableComponent {

  @Input()
  listRecord:any[]=[];

  @Input()
  flowMeter:any={};

  @Input()
  period:string="";

  flowMeterDetailsData:any;

  constructor(){

  }

  ngOnInit(){
      console.log("");
  }

  getListDayRecord(){
      if(this.flowMeterDetailsData?.listLastRecord?.length > 0){
          //console.log("list last record: ", this.tankDetailsData.listLastRecord);
          return this.flowMeterDetailsData.listLastRecord;
      }
      return [];
  }

  getLastIncomeDateRecord(){
      if(this.flowMeterDetailsData?.listLastRecord?.length > 0){
          return ''+Utility.toLocalDateTime(this.flowMeterDetailsData.listLastRecord[0].updated_at);
      }
      return '0';
  }

  getToLocalDateTime(date1:string){
    return Utility.toLocalDateTime(date1);
  }

  
  getRoundValue(num:number){
      return Math.round(num*100)/100;
  }
}
