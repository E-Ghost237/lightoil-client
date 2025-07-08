import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { InteractionService } from 'src/app/demo/services/interaction.service';
import { AuthService } from '../../../auth/services/auth.service';
import { RecordService } from '../../../dashboard/services/record.service';
import { HbtGraphService } from '../../services/hbt-graph.service';
import { StationService } from '../../services/station.service';
import * as Utility from '../../../../utilities/utility';
import { ProductService } from '../../services/product.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-hbp-graph',
  templateUrl: './hbp-graph.component.html',
  styleUrls: ['./hbp-graph.component.scss'],
  providers: [MessageService]
})

export class HbpGraphComponent {
  date: Date;
  maxDate: Date | undefined;
  rangeDates: Date[] | undefined;

  Tableau: boolean = false;
  user_details!:any;
  period:string = "";

  selectedStationProduct:any;
  listStationProducts:any[]=[];

  listRecords:any={};

 constructor(
    private router: Router,
    private cookieService: CookieService,
    private authService: AuthService,
    private stationService: StationService,
    private recordService: RecordService,
    private interactionService: InteractionService,
    private hbtGraphService: HbtGraphService,
    private messageService: MessageService,
    private productService: ProductService
    ){}

  ngOnInit(){

    this.maxDate = new Date();
    this.user_details = this.authService.getUserData();
    this.getListProducts();
  }



  getListProducts(){
    this.productService.getListStationProductsByStationId(this.user_details?.service_station_id).subscribe((res)=>{
      if(res.status == true){
        this.listStationProducts = res.listStationProducts;
        if(res.listStationProducts > 0){
          this.selectedStationProduct = this.listStationProducts[0];
        }
      }
      //;
    });
    //;
  }

  getPeriodRecords(){
    let usefullData:any = {};
    if(this.selectedStationProduct){
        if(this.rangeDates?.length == 2 && this.rangeDates[1] == null){
            usefullData = {
                stationProductId: this.selectedStationProduct.id,
                dateStart: this.rangeDates[0].getFullYear()+'-'+
                            ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                            (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate())
            };
            this.period = "Date : "+Utility.toLocalDate(this.rangeDates[0].toDateString());
            //;

            this.hbtGraphService.getListRecordsForGraphByStationProductId(usefullData).subscribe((res)=>{
              if(this.isGoodData(res)){
                this.listRecords = res;
                this.messageService.add({ severity: 'info', summary: "Informations", detail: "Données chargées" });
                this.sendInitGraph();
              }else{
                this.messageService.add({
                  severity: 'error',
                  summary: "Informations",
                  detail: "Aucune données disponible dans la période"
                });
                this.emptyTheGraph();
              }

              //;
            });

        }else if(this.rangeDates?.length == 2 && this.rangeDates[1] != null){
          usefullData = {
              stationProductId: this.selectedStationProduct.id,
              dateStart: this.rangeDates[0].getFullYear()+'-'+
                          ((this.rangeDates[0].getMonth()+1) <= 9 ? '0'+(this.rangeDates[0].getMonth()+1) : (this.rangeDates[0].getMonth()+1)) +'-'+
                          (this.rangeDates[0].getDate() <= 9 ? '0'+this.rangeDates[0].getDate() : this.rangeDates[0].getDate()),
              dateEnd: this.rangeDates[1].getFullYear()+'-'+
                          ((this.rangeDates[1].getMonth()+1) <= 9 ? '0'+(this.rangeDates[1].getMonth()+1) : (this.rangeDates[1].getMonth()+1)) +'-'+
                          (this.rangeDates[1].getDate() <= 9 ? '0'+this.rangeDates[1].getDate() : this.rangeDates[1].getDate())
          };
          this.period = "Periode du "+Utility.toLocalDate(this.rangeDates[0].toDateString())+" au "+Utility.toLocalDate(this.rangeDates[1].toDateString());
          //;

          this.hbtGraphService.getListRecordsForGraphByStationProductId(usefullData).subscribe((res)=>{
            if(this.isGoodData(res)){
              this.listRecords = res;
              this.messageService.add({ severity: 'info', summary: "Informations", detail: "Données chargées" });
              this.sendInitGraph();
            }else{
              this.messageService.add({
                severity: 'error',
                summary: "Informations",
                detail: "Aucune données disponible dans la période"
              });
              this.emptyTheGraph();
            }
            //;
          });
        }else{
          this.listRecords=[];
        }
    }else{
        this.listRecords=[];
    }
  }

  isGoodData(listRecords:any[]){
    let stat:boolean = false;
    if(listRecords.length > 0){
      for (let i = 0; i < listRecords.length; i++) {
        if(listRecords[i].data.status && listRecords[i].data.listDate.length > 0){
          return true;
        }
      }
    }
    return stat;
  }

  backToDshboard(){
    this.router.navigate(['/pages/dashboard']);
    //(this.listCuve);
  }

  onDropDownChange(event:any){
    //;
    this.getPeriodRecords();
  }

  onDateSelect(event:any){
    //;
    this.getPeriodRecords();
  }

  sendInitGraph(){
    this.interactionService.addNewDataToShare({
      from: "hbp-graph",
      for: "hbp-custom-graph",
      action: "reinitialize the graph",
      listRecord: this.listRecords,
      selectedStationProduct: this.selectedStationProduct,
      period: this.period
    });
  }

  emptyTheGraph(){
    this.interactionService.addNewDataToShare({
      from: "hbp-graph",
      for: "hbp-custom-graph",
      action: "empty the graph"
    });
  }

  generateTankProductGraphPdf(){
    this.interactionService.addNewDataToShare({
      from: "hbp-graph",
      for: "hbp-custom-graph",
      action: "export the graph"
    });
  }
}
