import { Component, Input } from '@angular/core';
import * as Utility from '../../../../../utilities/utility';

@Component({
  selector: 'app-table-dumpings-intputs',
  templateUrl: './table-dumpings-intputs.component.html',
  styleUrls: ['./table-dumpings-intputs.component.scss']
})
export class TableDumpingsIntputsComponent {
    @Input()
    listInputs!:any;

    @Input()
    tank:any={};

    @Input()
    period:string="";


    constructor(){

    }

    ngOnInit(){
        console.log("on table: ", this.listInputs);
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
