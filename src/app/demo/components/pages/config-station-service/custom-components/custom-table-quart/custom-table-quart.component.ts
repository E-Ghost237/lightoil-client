import { Component, Input } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { QuartService } from '../../../services/quart.service';

@Component({
  selector: 'app-custom-table-quart',
  templateUrl: './custom-table-quart.component.html',
  styleUrls: ['./custom-table-quart.component.scss'],
  providers: [MessageService, ConfirmationService]
})


export class CustomTableQuartComponent {

  @Input()
  stationId!:number;

  quartDialog: boolean = false;

  quarts!: any[];

  quart!: any;

  selectedQuarts!: any[] | null;

  submitted: boolean = false;

  listHours!:any[];
  selectedClosedHour!:string;
  selectedOpenedHour!:string;

  constructor(
    private quartService: QuartService, 
    private messageService: MessageService, 
    private confirmationService: ConfirmationService
    ) {}

  ngOnInit() {
    this.initWorkingData();
    if(this.stationId){
      this.getListQuartWorking();
    }
  }

  initWorkingData(){
    this.listHours=[
      
      "00:00:00"
      ,
      "01:00:00"
      ,
      "02:00:00"
      ,
       "03:00:00"
      ,
       "04:00:00"
      ,
       "05:00:00"
      ,
       "06:00:00"
      ,
       "07:00:00"
      ,
       "08:00:00"
      ,
       "09:00:00"
      ,
     "10:00:00"
      ,
       "11:00:00"
      ,
       "12:00:00"
      ,
       "13:00:00"
      ,
       "14:00:00"
      ,
      "15:00:00"
      ,
       "16:00:00"
      ,
       "17:00:00"
      ,
       "18:00:00"
      ,
      "19:00:00"
      ,
       "20:00:00"
      ,
       "21:00:00"
      ,
       "22:00:00"
      ,
       "23:00:00"
      
    ];
    this.selectedOpenedHour = this.listHours[0];
    this.selectedClosedHour = this.listHours[5];
  }

  getListQuartWorking(){
    this.quartService.getListQuarts(this.stationId).subscribe((res)=>{
      //console.log("Liste des quarts: ", res);
      this.quarts = res;
      /* if(this.quarts.length > 0){
        this.quarts.forEach((quart)=>{
          console.log("tab quart: ",this.getHourQuartFromQuartString(quart));
        });
      } */
    });
  }

  getHourQuartFromQuartString(quartString: any){
    let $splitTimeStart:any[] = quartString.time_start.split(":");
    let $splitTimeClose:any[] = quartString.time_close.split(":");
    return {
      splitStart: $splitTimeStart,
      splitClose: $splitTimeClose
    };
  }

  openNew() {
    this.quart = {
      service_station_id: this.stationId
    };
    this.submitted = false;
    this.quartDialog = true;
  }

  deleteSelectedQuart() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected quart working?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if(this.selectedQuarts?.length > 0){
          this.quartService.deleteListQuarts({listQuarts: this.selectedQuarts}).subscribe((res)=>{
            if(res.status == true){
              this.getListQuartWorking();
              this.selectedQuarts = null;
              this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'List quarts Deleted', life: 3000 });
            }else{
              this.messageService.add({ severity: 'error', summary: 'Echec', detail: 'List quarts not Deleted', life: 3000 });
            }
          });
        }
      }
    });
  }

  editQuart(quart: any) {
    this.quart = { ...quart };
    this.quartDialog = true;
  }

  deleteQuart(quart: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + quart.time_start+'/'+ quart.time_close + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.quartService.deleteQuart(quart.id).subscribe((res)=>{
          if(res.status == true){
            this.quart = {};
            this.getListQuartWorking();
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Quart working Deleted', life: 3000 });
          }else{
            //this.quart = {};
            this.messageService.add({ severity: 'error', summary: 'Echec', detail: 'Quart working not Deleted', life: 3000 });
          }
        });
      }
    });
  }

  hideDialog() {
    this.quartDialog = false;
    this.submitted = false;
  }

  saveQuart() {
    this.submitted = true;
    console.log("edit quart: ",this.quart);
    if (this.quart.time_start?.trim()) {
      if (this.quart.id) {
        this.quartService.updateQuart(this.quart).subscribe((res)=>{
          if(res.status == true){
            this.getListQuartWorking();
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Quart working Updated', life: 3000 });
          }else{
            this.messageService.add({ severity: 'error', summary: 'Echec', detail: 'Quart working not Updated', life: 3000 });
          }
        });
      } else {
        this.quartService.storeQuart(this.quart).subscribe((res)=>{
          if(res.status == true){
            this.getListQuartWorking();
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Quart working Created', life: 3000 });
          }else{
            this.messageService.add({ severity: 'error', summary: 'Echec', detail: 'Quart working not Created', life: 3000 });
          }
        });
        
      }
      //this.getListQuartWorking();
      //this.quarts = [...this.quarts];
      this.quartDialog = false;
      this.quart = {};
    }
  }
}
