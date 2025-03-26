import { Component, Input } from '@angular/core';
import * as Utility from '../../../../../utilities/utility';

@Component({
  selector: 'app-table-notification',
  templateUrl: './table-notification.component.html',
  styleUrls: ['./table-notification.component.scss']
})
export class TableNotificationComponent {

  @Input()
  listNotification:any[]=[];

  @Input()
  stationProduct:any={};

  @Input()
  period:string="";

  constructor(){

  }

  ngOnInit(){
      console.log("");
  }

  getToLocalDateTime(date1:string){
      return Utility.toLocalDateTime(date1);
  }

  getRoundValue(num:number){
      return Math.round(num*100)/100;
  }
}
