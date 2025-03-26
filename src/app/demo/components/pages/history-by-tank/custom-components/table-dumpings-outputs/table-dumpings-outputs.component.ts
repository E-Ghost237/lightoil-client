import { Component, Input } from '@angular/core';
import * as Utility from '../../../../../utilities/utility';

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


    constructor(){

    }

    ngOnInit(){
        //console.log("on table: ", this.listOutputs);
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
