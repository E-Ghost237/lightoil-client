import { Component, Input } from '@angular/core';
import * as Utility from '../../../../../utilities/utility';

@Component({
  selector: 'app-table-dumpings-report',
  templateUrl: './table-dumpings-report.component.html',
  styleUrls: ['./table-dumpings-report.component.scss']
})
export class TableDumpingsReportComponent {


  @Input()
  listReport!:any;

  @Input()
  tank:any={};

  constructor(){

  }

  ngOnInit(){
    console.log("list report by table: ", this.listReport);
    console.log("tank by table: ", this.tank);
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
