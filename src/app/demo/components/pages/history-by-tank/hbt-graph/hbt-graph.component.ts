import { Component } from '@angular/core';

import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../../auth/services/auth.service';
import { RecordService } from '../../../dashboard/services/record.service';
import { StationService } from '../../services/station.service';
import * as Utility from '../../../../utilities/utility';
import { HbtGraphService } from '../../services/hbt-graph.service';
import { InteractionService } from 'src/app/demo/services/interaction.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-hbt-graph',
  templateUrl: './hbt-graph.component.html',
  styleUrls: ['./hbt-graph.component.scss'],
  providers: [MessageService]
})
export class HbtGraphComponent {

  date: Date;
  maxDate: Date | undefined;
  rangeDates: Date[] | undefined;

  Tableau: boolean = false;
  user_details!:any;
  period:string = "";

  selectedTank:any;
  listTanks:any[]=[];
  listRecords:any={};

 constructor(
    private router: Router,
    private cookieService: CookieService,
    private authService: AuthService,
    private stationService: StationService,
    private recordService: RecordService,
    private interactionService: InteractionService,
    private messageService: MessageService,
    private hbtGraphService: HbtGraphService
    ){}

  ngOnInit(){

    this.maxDate = new Date();
    this.user_details = this.authService.getUserData();
    this.getListTanks();
  }

  getListTanks(){
    this.stationService.getServiceStationListTanks(this.user_details?.service_station_id).subscribe((res)=>{
        this.listTanks = res;
        if(res.length > 0){
            this.selectedTank = this.listTanks[0]
        }

    });

  }

  getPeriodRecords(){
    let usefullData:any = {};
    if(this.selectedTank){
        if(this.rangeDates?.length == 2 && this.rangeDates[1] == null){
            usefullData = {
                tankId: this.selectedTank.id,
                dateStart: this.rangeDates[0].getFullYear()+'-'+
                            ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                            (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate())
            };
            this.period = "Date : "+Utility.toLocalDate(this.rangeDates[0].toDateString());


            this.hbtGraphService.getListRecordsForGraph(usefullData).subscribe((res)=>{
              if(res.status == true){
                this.listRecords = res;
                this.sendInitGraph();
                this.messageService.add({ severity: 'info', summary: "Informations", detail: "Données chargées" });
              }else{
                this.emptyTheGraph();
                this.messageService.add({
                  severity: 'error',
                  summary: "Informations",
                  detail: "Aucune données disponible dans la période"
                });
              }

            });

        }else if(this.rangeDates?.length == 2 && this.rangeDates[1] != null){
            usefullData = {
                tankId: this.selectedTank.id,
                dateStart: this.rangeDates[0].getFullYear()+'-'+
                            ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                            (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate()),
                dateEnd: this.rangeDates[1].getFullYear()+'-'+
                            ((this.rangeDates[1].getMonth()+1) <= 9 ? '0'+(this.rangeDates[1].getMonth()+1) : (this.rangeDates[1].getMonth()+1)) +'-'+
                            (this.rangeDates[1].getDate() <= 9 ? '0'+this.rangeDates[1].getDate() : this.rangeDates[1].getDate())
            };
            this.period = "Periode du "+Utility.toLocalDate(this.rangeDates[0].toDateString())+" au "+Utility.toLocalDate(this.rangeDates[1].toDateString());


            this.hbtGraphService.getListRecordsForGraph(usefullData).subscribe((res)=>{
              if(res.status == true){
                this.listRecords = res;
                this.sendInitGraph();
                this.messageService.add({ severity: 'info', summary: "Informations", detail: "Données chargées" });
              }else{
                this.emptyTheGraph();
                this.messageService.add({
                  severity: 'error',
                  summary: "Informations",
                  detail: "Aucune données disponible dans la période"
                });
              }

            });
            /* this.recordService.getListRecordsForPeriod(usefullData).subscribe((res)=>{
                this.listRecords = res;
                ;
            }); */
        }else{
            this.listRecords=[];
        }
    }else{
        this.listRecords=[];
    }

  }

  backToDshboard(){
    this.router.navigate(['/pages/dashboard']);
    //(this.listCuve);
  }

  onDropDownChange(event:any){

    this.getPeriodRecords();
  }

  onDateSelect(event:any){

    this.getPeriodRecords();
  }

  sendInitGraph(){
    this.interactionService.addNewDataToShare({
      from: "hbt-graph",
      for: "custom-hbt-graph",
      action: "reinitialize the graph",
      listRecord: this.listRecords,
      selectedTank: this.selectedTank,
      period: this.period
    });
  }

  emptyTheGraph(){
    this.interactionService.addNewDataToShare({
      from: "hbt-graph",
      for: "custom-hbt-graph",
      action: "empty the graph"
    });
  }

  generateTankGraphPdf(){
    this.interactionService.addNewDataToShare({
      from: "hbt-graph",
      for: "custom-hbt-graph",
      action: "export the graph"
    });
  }

}
