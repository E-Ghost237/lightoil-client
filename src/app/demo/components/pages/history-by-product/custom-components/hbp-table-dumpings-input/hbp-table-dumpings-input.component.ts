import { Component, Input } from '@angular/core';
import * as Utility from '../../../../../utilities/utility';

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
}
