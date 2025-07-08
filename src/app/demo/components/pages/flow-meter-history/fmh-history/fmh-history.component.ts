import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PdfService } from 'src/app/demo/services/pdf.service';
import { AuthService } from '../../../auth/services/auth.service';
import { RecordService } from '../../../dashboard/services/record.service';
import { StationService } from '../../services/station.service';
import * as Utility from '../../../../utilities/utility';

@Component({
  selector: 'app-fmh-history',
  templateUrl: './fmh-history.component.html',
  styleUrls: ['./fmh-history.component.scss'],
  providers: [MessageService]
})
export class FmhHistoryComponent {

  date: Date;
  maxDate: Date | undefined;
  rangeDates: Date[] | undefined;

  Tableau: boolean = false;
  user_details!:any;
  period:string = "";

  selectedFlowMeter:any;
  listFlowMeters:any[]=[];
  listRecords:any[]=[];

  constructor(
    private router: Router,
    private authService: AuthService,
    private stationService: StationService,
    private messageService: MessageService,
    private recordService: RecordService,
    private pdfService: PdfService
    ){}

  ngOnInit(){
    this.maxDate = new Date();
    this.user_details = this.authService.getUserData();
    this.getListFlowMeters();
  }


  getListFlowMeters(){
    this.stationService.getServiceStationListTanks(this.user_details?.service_station_id).subscribe((res)=>{
        this.listFlowMeters = res;
        if(res.length > 0){
            this.selectedFlowMeter = this.listFlowMeters[0]
        }

    });

  }

  getPeriodRecords(){
    let usefullData:any = {};
    if(this.selectedFlowMeter){
        if(this.rangeDates?.length == 2 && this.rangeDates[1] == null){
            usefullData = {
                tankId: this.selectedFlowMeter.id,
                dateStart: this.rangeDates[0].getFullYear()+'-'+
                            ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                            (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate())
            };
            this.period = "Date : "+Utility.toLocalDate(this.rangeDates[0].toDateString());


            this.recordService.getListRecordsForOneDay(usefullData).subscribe((res)=>{
                this.listRecords = res;
                if(this.listRecords?.length > 0){
                  this.messageService.add({ severity: 'info', summary: "Informations", detail: "Données chargées" });
                }else{
                  this.messageService.add({
                    severity: 'error',
                    summary: "Informations",
                    detail: "Aucune données disponible dans la période"
                  });
                }

            });
        }else if(this.rangeDates?.length == 2 && this.rangeDates[1] != null){
            usefullData = {
                tankId: this.selectedFlowMeter.id,
                dateStart: this.rangeDates[0].getFullYear()+'-'+
                            ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                            (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate()),
                dateEnd: this.rangeDates[1].getFullYear()+'-'+
                            ((this.rangeDates[1].getMonth()+1) <= 9 ? '0'+(this.rangeDates[1].getMonth()+1) : (this.rangeDates[1].getMonth()+1)) +'-'+
                            (this.rangeDates[1].getDate() <= 9 ? '0'+this.rangeDates[1].getDate() : this.rangeDates[1].getDate())
            };
            this.period = "Periode du "+Utility.toLocalDate(this.rangeDates[0].toDateString())+" au "+Utility.toLocalDate(this.rangeDates[1].toDateString());

            this.recordService.getListRecordsForPeriod(usefullData).subscribe((res)=>{
                this.listRecords = res;
                if(this.listRecords?.length > 0){
                  this.messageService.add({ severity: 'info', summary: "Informations", detail: "Données chargées" });
                }else{
                  this.messageService.add({
                    severity: 'error',
                    summary: "Informations",
                    detail: "Aucune données disponible dans la période"
                  });
                }

            });
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

  generateFlowMeterDataPdf(){
    let usefullData = {
      user_details: this.user_details,
      tank: this.selectedFlowMeter,
      period: this.period,
      listRecords: this.listRecords
    };
    this.pdfService.generateTankDataPdf(usefullData);
  }


}
