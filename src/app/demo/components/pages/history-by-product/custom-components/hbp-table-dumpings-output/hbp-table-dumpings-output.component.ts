import { Component, Input } from '@angular/core';
import * as Utility from '../../../../../utilities/utility';

@Component({
  selector: 'app-hbp-table-dumpings-output',
  templateUrl: './hbp-table-dumpings-output.component.html',
  styleUrls: ['./hbp-table-dumpings-output.component.scss']
})
export class HbpTableDumpingsOutputComponent {
  @Input()
  listOutputs!:any;

  @Input()
  stationProduct:any={};

  @Input()
  period:string="";


  constructor(){

  }

  ngOnInit(){
      //;
  }

  getToLocalDateTime(date1:string){
      return Utility.toLocalDateTime(date1)??"";
  }

  getToLocalDate(date1:string){
      return Utility.toLocalDate(date1)??"";
  }

  getToLocalTime(date1:string){
      return Utility.toLocalTime(date1)??"";
  }

  getRoundValue(num:number){
      return Math.round(num*100)/100;
  }

  countTotalOutput(periodRecord:any[]){
    let total = 0;
    if (periodRecord.length > 0) {
      for(let i=0; i<periodRecord.length; i++){
        total = total + periodRecord[i].outputs;
      }
    }
    return total;
  }
}
