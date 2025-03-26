import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { PdfService } from 'src/app/demo/services/pdf.service';
import { AuthService } from '../../../auth/services/auth.service';
import { RecordService } from '../../../dashboard/services/record.service';
import { variables } from '../../history-by-tank/variables';
import { QuartService } from '../../services/quart.service';
import { StationService } from '../../services/station.service';

@Component({
  selector: 'app-fmh-volume',
  templateUrl: './fmh-volume.component.html',
  styleUrls: ['./fmh-volume.component.scss'],
  providers: [MessageService]
})

export class FmhVolumeComponent {
  date: Date;
  maxDate: Date | undefined;
  rangeDates: Date[] | undefined;
  selectedFlowMeter:any;
  
  listFlowMeters:any[]=[];
  listQuarter: variables[];
  selectedQuart:any;
  dataOutputs!:any;
  user_details!:any;


  constructor(
      private authService: AuthService,
      private quartService: QuartService,
      private stationService: StationService,
      private recordService: RecordService,
      private messageService: MessageService,
      private pdfService: PdfService
      ){}

  ngOnInit() {
    this.maxDate = new Date();
    this.user_details = this.authService.getUserData();
    console.log("station id: ", this.user_details.service_station_id);
    this.getListQuartWorking();
    this.getListFlowMeters();
  }

  getListFlowMeters(){
    this.stationService.getServiceStationListTanks(this.user_details?.service_station_id).subscribe((res)=>{
      this.listFlowMeters = res;
      if(res.length > 0){
        this.selectedFlowMeter = this.listFlowMeters[0];
      }
    });
    //console.log("user is: ", this.user);
  }

  getListQuartWorking(){
    this.quartService.getListQuarts(this.user_details?.service_station_id).subscribe((res)=>{
      this.listQuarter = res;
      //console.log("list quarts: ", res);
    });
  }

  onDropDownChangeQuart(event:any){
    this.getOutputsOnPeriod();
    console.log("show event: ", this.selectedQuart);
    //this.getPeriodRecords();
  }

  onDropDownChangeFlowMeter(event:any){
    this.getOutputsOnPeriod();
    console.log("show event: ", this.selectedFlowMeter);
    //this.getPeriodRecords();
  }

  onDateSelect(event:any){
    this.getOutputsOnPeriod();
    console.log("show event: ", this.rangeDates);
    //this.getPeriodRecords();
  }

  getOutputsOnPeriod(){
      let usefullData:any = {};
      if(this.selectedFlowMeter){
          if(this.rangeDates?.length == 2 && this.rangeDates[1] == null){
              if (this.selectedQuart) {
                  usefullData = {
                      tankId : this.selectedFlowMeter.id,
                      timeStart: this.selectedQuart.time_start,
                      timeClose: this.selectedQuart.time_close,
                      dateStart: this.rangeDates[0].getFullYear()+'-'+
                          ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                          (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate()),
                      dateEnd: this.rangeDates[0].getFullYear()+'-'+
                          ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                          (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate())
                  }
              } else {
                  usefullData = {
                      tankId : this.selectedFlowMeter.id,
                      timeStart: null,
                      timeClose: null,
                      dateStart: this.rangeDates[0].getFullYear()+'-'+
                          ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                          (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate()),
                      dateEnd: this.rangeDates[0].getFullYear()+'-'+
                          ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                          (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate())
                  }
              }

              this.recordService.getOutPutsOnPeriod(usefullData).subscribe((res)=>{
                  this.dataOutputs = res;
                  if(this.dataOutputs?.periodRecord?.length <= 0){
                      this.messageService.add({ 
                              severity: 'error', 
                              summary: "Informations", 
                              detail: "Aucune sortie dans la période" 
                          });
                  }else{
                      this.messageService.add({ severity: 'info', summary: "Informations", detail: "Sorties chargées" }); 
                  }
                  console.log("usefull data js: ", usefullData);
                  console.log("usefull data: ", res);
              });
          }else if(this.rangeDates?.length == 2 && this.rangeDates[1] != null){
              if (this.selectedQuart) {
                  usefullData = {
                      tankId : this.selectedFlowMeter.id,
                      timeStart: this.selectedQuart.time_start,
                      timeClose: this.selectedQuart.time_close,
                      dateStart: this.rangeDates[0].getFullYear()+'-'+
                          ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                          (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate()),
                      dateEnd: this.rangeDates[1].getFullYear()+'-'+
                          ((this.rangeDates[1].getMonth()+1) <= 9 ? '0'+(this.rangeDates[1].getMonth()+1) : (this.rangeDates[1].getMonth()+1)) +'-'+
                          (this.rangeDates[1].getDate() <= 9 ? '0'+this.rangeDates[1].getDate() : this.rangeDates[1].getDate())
                  }
              } else {
                  usefullData = {
                      tankId : this.selectedFlowMeter.id,
                      timeStart: null,
                      timeClose: null,
                      dateStart: this.rangeDates[0].getFullYear()+'-'+
                          ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                          (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate()),
                      dateEnd: this.rangeDates[1].getFullYear()+'-'+
                          ((this.rangeDates[1].getMonth()+1) <= 9 ? '0'+(this.rangeDates[1].getMonth()+1) : (this.rangeDates[1].getMonth()+1)) +'-'+
                          (this.rangeDates[1].getDate() <= 9 ? '0'+this.rangeDates[1].getDate() : this.rangeDates[1].getDate())
                  }
              }
              
              this.recordService.getOutPutsOnPeriod(usefullData).subscribe((res)=>{
                  this.dataOutputs = res;
                  if(this.dataOutputs?.periodRecord?.length <= 0){
                      this.messageService.add({ 
                              severity: 'error', 
                              summary: "Informations", 
                              detail: "Aucune sortie dans la période" 
                          });
                  }else{
                      this.messageService.add({ severity: 'info', summary: "Informations", detail: "Sorties chargées" }); 
                  }
                  console.log("usefull data js: ", usefullData);
                  console.log("usefull data: ", res);
              });
          }else{
              this.dataOutputs = {};
          }
      }else{
          this.dataOutputs = {};
      }

  }

  generateFlowMeterOutputPdf(){
    let usefullData = {
        user_details: this.user_details,
        tank: this.selectedFlowMeter,
        dataOuptuts: this.dataOutputs
    };
    this.pdfService.generateTankOutputsPdf(usefullData);
  }

}
